import { withAuth } from '../../../utils/authMiddleware';
import { createConversation, getUserConversations, saveMessageToConversation } from '../../../utils/mongodb';
import { getChatResponse } from '../../../utils/venice';

export default withAuth(async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const conversations = await getUserConversations(req.user._id);
      res.status(200).json({ conversations });
    } catch (error) {
      console.error('Conversations error:', error);
      res.status(500).json({ message: 'Failed to fetch conversations' });
    }
  } else if (req.method === 'POST') {
    try {
      // Get user's previous conversations
      const previousConversations = await getUserConversations(req.user._id);

      // Create welcome message prompt based on history
      const welcomePrompt = `You are a helpful AI assistant in a chat-based economy game.
Current user: ${req.user.displayName}
Current balance: ${req.user.balance || 0} coins
Chat history: ${previousConversations.length} previous conversations

Generate a personalized welcome message. If they're a returning user, acknowledge their previous interactions.
Consider their current balance and any patterns in their previous conversations.
Keep it friendly and concise.

Response format:
{
  "chatResponse": "Your personalized welcome message"
}`;

      // Get AI welcome message
      const response = await getChatResponse([
        {
          role: 'system',
          content: welcomePrompt
        },
        // Include last few messages from previous conversations for context
        ...previousConversations.slice(0, 3).flatMap(conv => 
          conv.messages.slice(-2).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        )
      ], false);

      let welcomeMessage;
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        welcomeMessage = analysis?.chatResponse || "Hello! I'm your AI assistant. How can I help you today?";
      } catch (e) {
        console.error('Failed to parse welcome message:', e);
        welcomeMessage = "Hello! I'm your AI assistant. How can I help you today?";
      }

      // Create new conversation
      const conversation = await createConversation(req.user._id);

      // Add personalized welcome message
      await saveMessageToConversation(conversation._id, {
        role: 'assistant',
        content: welcomeMessage,
      });

      // Return the conversation with the welcome message
      const updatedConversation = {
        ...conversation,
        messages: [{
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date()
        }]
      };

      res.status(200).json({ conversation: updatedConversation });
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({ message: 'Failed to create conversation' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}); 
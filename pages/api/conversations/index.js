import { withAuth } from '../../../utils/authMiddleware';
import { createConversation, getUserConversations, saveMessageToConversation } from '../../../utils/mongodb';
import { getChatResponse } from '../../../utils/venice';

function logError(context, error) {
  const timestamp = new Date().toISOString();
  const red = "\x1b[31m";
  const reset = "\x1b[0m";
  const message = error && error.message ? error.message : String(error);
  console.error(`${red}[${timestamp}] [ERROR - ${context}] ${message}${reset}`);
  if (error && error.stack) {
    console.error(error.stack);
  }
}

export default withAuth(async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const conversations = await getUserConversations(req.user._id);
      res.status(200).json({ conversations });
    } catch (error) {
      logError('Conversations', error);
      res.status(500).json({ message: 'Failed to fetch conversations' });
    }
  } else if (req.method === 'POST') {
    try {
      // Create new conversation
      const conversation = await createConversation(req.user._id);

      // Add welcome message with badge format for tokens
      const welcomeMessage = {
        text: `Welcome to the marketplace`,
        tokens: req.user.balance || 0
      };

      // Add welcome message to conversation
      await saveMessageToConversation(conversation._id, {
        role: 'assistant',
        content: welcomeMessage,
        isWelcome: true
      });

      // Return the conversation with the welcome message
      const updatedConversation = {
        ...conversation,
        messages: [{
          role: 'assistant',
          content: welcomeMessage,
          isWelcome: true,
          timestamp: new Date()
        }]
      };

      res.status(200).json({ conversation: updatedConversation });
    } catch (error) {
      logError('CreateConversation', error);
      res.status(500).json({ message: 'Failed to create conversation' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}); 
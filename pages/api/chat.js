import { withAuth } from '../../utils/authMiddleware';
import { saveMessage, getUserMessages } from '../../utils/mongodb';
import { getChatResponse } from '../../utils/venice';

export default withAuth(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Save user message
    await saveMessage({
      userId,
      role: 'user',
      content: message,
    });

    // Get conversation history
    const history = await getUserMessages(userId);
    
    // Format messages for Venice API
    const formattedMessages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant in a chat-based economy game. Help users manage their virtual tokens and listings through engaging conversations.'
      },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Get AI response
    const aiResponse = await getChatResponse(formattedMessages);

    // Save AI response
    await saveMessage({
      userId,
      role: 'assistant',
      content: aiResponse.content,
    });

    res.status(200).json({ 
      message: aiResponse.content,
      user: req.user 
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Failed to process message' });
  }
}); 
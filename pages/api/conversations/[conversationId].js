import { withAuth } from '../../../utils/authMiddleware';
import { getConversation } from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default withAuth(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { conversationId } = req.query;

  try {
    const conversation = await getConversation(conversationId);
    
    if (!conversation || conversation.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.status(200).json({ conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Failed to fetch conversation' });
  }
}); 
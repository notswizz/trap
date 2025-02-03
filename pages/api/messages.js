import { withAuth } from '../../utils/authMiddleware';
import { getUserMessages } from '../../utils/mongodb';

export default withAuth(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const messages = await getUserMessages(req.user._id);
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Messages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
}); 
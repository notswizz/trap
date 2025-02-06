import { withAuth } from '../../../utils/authMiddleware';
import { connectToDatabase } from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default withAuth(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Delete all notifications for the user
    await db.collection('notifications').deleteMany({
      userId: new ObjectId(req.user._id)
    });

    return res.status(200).json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Clear notifications error:', error);
    return res.status(500).json({ message: 'Error clearing notifications' });
  }
}); 
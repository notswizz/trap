import { withAuth } from '../../../utils/authMiddleware';
import { connectToDatabase } from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default withAuth(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const total = await db.collection('notifications')
      .countDocuments({ userId: new ObjectId(req.user._id) });

    // Get notifications with pagination
    const notifications = await db.collection('notifications')
      .find({ userId: new ObjectId(req.user._id) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get unread count
    const unreadCount = await db.collection('notifications')
      .countDocuments({ 
        userId: new ObjectId(req.user._id),
        read: false
      });

    return res.status(200).json({
      notifications,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        unreadCount
      }
    });
  } catch (error) {
    console.error('Notification history error:', error);
    return res.status(500).json({ message: 'Error fetching notification history' });
  }
}); 
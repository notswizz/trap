import { withAuth } from '../../../utils/authMiddleware';
import { connectToDatabase } from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default withAuth(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const { lastChecked } = req.query;

    // Get user's notifications
    const query = {
      userId: new ObjectId(req.user._id),
      read: false
    };

    // If lastChecked is provided, only get notifications after that timestamp
    if (lastChecked) {
      query.createdAt = { $gt: new Date(parseInt(lastChecked)) };
    }

    const notifications = await db.collection('notifications')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Mark notifications as read
    if (notifications.length > 0) {
      await db.collection('notifications').updateMany(
        { _id: { $in: notifications.map(n => n._id) } },
        { $set: { read: true } }
      );
    }

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('Notifications error:', error);
    return res.status(500).json({ message: 'Error fetching notifications' });
  }
}); 
import { connectToDatabase } from '../../../utils/mongodb';
import { withAuth } from '../../../utils/authMiddleware';
import { ObjectId } from 'mongodb';

export default withAuth(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Debug log the incoming user
    console.log('Incoming user:', req.user);
    
    // Get user's info
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user._id) }
    );

    if (!user) {
      console.error('User not found:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Debug log the found user
    console.log('Found user:', {
      _id: user._id,
      username: user.username
    });

    try {
      // Get total active listings
      const totalListings = await db.collection('listings')
        .countDocuments({ status: 'active' });

      // Get listings currently owned by user
      const userListings = await db.collection('listings')
        .countDocuments({ 
          currentOwnerUsername: user.username,
          status: 'active'
        });

      // Calculate average response time (placeholder for now)
      const responseTime = '< 1s';

      res.status(200).json({
        totalListings,
        userListings,
        tokens: user.balance || 0,
        username: user.username,
        displayName: user.displayName
      });

    } catch (dbError) {
      console.error('Database query error:', dbError);
      throw dbError;
    }

  } catch (error) {
    console.error('Stats error:', {
      message: error.message,
      stack: error.stack,
      user: req.user?._id
    });
    
    return res.status(500).json({ 
      message: 'Error fetching stats',
      error: error.message 
    });
  }
}); 
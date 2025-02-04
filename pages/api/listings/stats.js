import { connectToDatabase } from '../../../utils/mongodb';
import { withAuth } from '../../../utils/authMiddleware';
import { ObjectId } from 'mongodb';

async function handler(req, res) {
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
      // Get total active listings count
      const totalListings = await db.collection('listings')
        .countDocuments({});  // Removed status filter temporarily for testing
      
      // Debug log
      console.log('Total listings:', totalListings);

      // Get user's listings - simplified query for testing
      const userListings = await db.collection('listings')
        .countDocuments({
          $or: [
            { currentOwnerUsername: user.username },
            { creatorUsername: user.username }
          ]
        });

      // Debug log
      console.log('User listings:', {
        username: user.username,
        count: userListings
      });

      // Simplified response for testing
      return res.status(200).json({
        totalListings,
        userListings,
        responseTime: '238ms' // Static for now
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
}

export default withAuth(handler); 
import { getAuthUser } from '../../../utils/authMiddleware';
import { connectToDatabase } from '../../../utils/mongodb';

export default async function handler(req, res) {
  // Handle GET request for current user
  if (req.method === 'GET') {
    try {
      const user = await getAuthUser(req);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      res.status(200).json({ 
        user: {
          _id: user._id,
          username: user.displayName || user.username,
          email: user.email,
          balance: user.balance
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user data' });
    }
  }
  // Handle POST request for username check
  else if (req.method === 'POST') {
    try {
      const { username } = req.body;

      // Basic validation
      if (!username?.trim()) {
        return res.status(400).json({ message: 'Username is required' });
      }

      const { db } = await connectToDatabase();
      
      // Check if user exists
      const user = await db.collection('users').findOne(
        { username: username.toLowerCase() },
        { projection: { _id: 1, username: 1, displayName: 1 } }
      );

      if (!user) {
        return res.status(404).json({ exists: false });
      }

      // Return minimal user info
      res.status(200).json({
        exists: true,
        user: {
          username: user.displayName || user.username
        }
      });
    } catch (error) {
      console.error('User check error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
} 
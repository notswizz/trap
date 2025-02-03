import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export async function getAuthUser(req) {
  const authToken = req.cookies['auth-token'];
  
  if (!authToken) {
    return null;
  }

  try {
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(authToken) }
    );

    if (!user) {
      console.error('Auth token valid but user not found:', authToken);
      return null;
    }

    // Remove sensitive data but keep balance
    const { password, ...userWithoutPassword } = user;
    
    // Ensure balance is properly extracted from MongoDB format
    const formattedUser = {
      ...userWithoutPassword,
      balance: user.balance?.$numberInt || user.balance || 0
    };

    return formattedUser;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Use this for API routes that require authentication
export function withAuth(handler) {
  return async (req, res) => {
    const user = await getAuthUser(req);
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Debug logging
    console.log('Authenticated user:', {
      id: user._id,
      username: user.username,
      balance: user.balance
    });

    req.user = user;
    return handler(req, res);
  };
} 
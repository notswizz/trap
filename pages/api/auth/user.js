import { getAuthUser } from '../../../utils/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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
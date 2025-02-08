import { connectToDatabase } from '../../../utils/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username?.trim() || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const { db } = await connectToDatabase();
    
    // Find user by username
    const user = await db.collection('users').findOne({ 
      username: username.toLowerCase() 
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Update last login time
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Set secure HTTP-only cookie
    res.setHeader('Set-Cookie', [
      `auth-token=${user._id}; HttpOnly; Secure; SameSite=Strict; Path=/`
    ]);
    
    // Return only necessary user data
    res.status(200).json({
      user: {
        _id: user._id,
        username: user.displayName || user.username,
        email: user.email,
        balance: user.balance?.$numberInt || user.balance || 0
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ message: 'Invalid username or password' });
  }
} 
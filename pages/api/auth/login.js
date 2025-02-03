import { loginUser } from '../../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await loginUser({ 
      email: email.trim().toLowerCase(), 
      password 
    });

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
    res.status(400).json({ message: 'Invalid email or password' });
  }
} 
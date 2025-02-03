import { createUser } from '../../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Username validation
    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ 
        message: 'Username can only contain letters, numbers, and underscores' 
      });
    }

    const user = await createUser({ 
      username: username.trim(), 
      email: email.trim(), 
      password 
    });

    // Set secure HTTP-only cookie instead of sending sensitive data
    res.setHeader('Set-Cookie', [
      `auth-token=${user._id}; HttpOnly; Secure; SameSite=Strict; Path=/`
    ]);
    
    // Return only necessary user data
    res.status(200).json({
      user: {
        _id: user._id,
        username: user.displayName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ message: error.message });
  }
} 
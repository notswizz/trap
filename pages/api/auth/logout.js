export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Clear the auth cookie
  res.setHeader('Set-Cookie', [
    'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict'
  ]);

  res.status(200).json({ message: 'Logged out successfully' });
} 
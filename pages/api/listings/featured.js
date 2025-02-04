import { connectToDatabase } from '../../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    
    const listings = await db.collection('listings')
      .aggregate([
        { $match: { status: 'active' } },
        { $sample: { size: 10 } },
        { $project: {
          title: 1,
          price: 1,
          description: 1,
          creatorDisplayName: 1,
          _id: 0
        }}
      ]).toArray();

    // If no listings found, return demo listings
    if (!listings.length) {
      return res.status(200).json({
        listings: [
          {
            title: "AI Trading Bot",
            price: { $numberInt: "50" },
            description: "Automated trading strategies"
          },
          {
            title: "Neural Network",
            price: { $numberInt: "75" },
            description: "Custom ML model"
          }
        ]
      });
    }

    return res.status(200).json({ listings });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(200).json({
      listings: [
        {
          title: "AI Trading Bot",
          price: { $numberInt: "50" },
          description: "Automated trading strategies"
        },
        {
          title: "Neural Network",
          price: { $numberInt: "75" },
          description: "Custom ML model"
        }
      ]
    });
  }
} 
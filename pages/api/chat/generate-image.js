import { withAuth } from '../../../utils/authMiddleware';
import { generateImage } from '../../../utils/venice';
import { saveMessageToConversation } from '../../../utils/mongodb';

export default withAuth(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prompt, conversationId } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // Generate the image
    const imageUrl = await generateImage(prompt);

    // If we have a conversation ID, save this as a message
    if (conversationId) {
      await saveMessageToConversation(conversationId, {
        role: 'assistant',
        content: imageUrl,
        isImage: true,
        prompt,
        timestamp: new Date()
      });
    }

    res.status(200).json({ 
      success: true,
      imageUrl,
      message: "Image generated successfully"
    });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to generate image',
      success: false
    });
  }
}); 
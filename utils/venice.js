import OpenAI from 'openai';

const venice = new OpenAI({
  apiKey: process.env.VENICE_API_KEY,
  baseURL: "https://api.venice.ai/api/v1",
});

export async function getChatResponse(messages, includeVenicePrompt = true) {
  try {
    // Format messages to ensure they're in the correct format
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'object' ? msg.content.text : msg.content
    }));

    const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant in a chat-based economy game. Help users earn and manage their virtual tokens and listings through engaging conversations."
          },
          ...formattedMessages
        ],
        venice_parameters: {
          include_venice_system_prompt: includeVenicePrompt
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Venice API Error Response:', data);
      throw new Error(data.error?.message || 'Failed to get AI response');
    }

    if (!data.choices?.[0]?.message) {
      throw new Error('Invalid response format from AI');
    }

    return data.choices[0].message;
  } catch (error) {
    console.error('Venice API Error:', error);
    throw new Error('Failed to get response from AI');
  }
}

export async function generateImage(prompt, options = {}) {
  const defaultOptions = {
    model: "fluently-xl",
    prompt,
    width: 512,
    height: 512,
    steps: 30,
    hide_watermark: false,
    return_binary: false,
    cfg_scale: 7,
    safe_mode: false
  };

  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.VENICE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...defaultOptions,
      ...options
    })
  };

  try {
    const response = await fetch('https://api.venice.ai/api/v1/image/generate', requestOptions);
    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.images[0];
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
} 
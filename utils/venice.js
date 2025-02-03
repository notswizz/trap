import OpenAI from 'openai';

const venice = new OpenAI({
  apiKey: process.env.VENICE_API_KEY,
  baseURL: "https://api.venice.ai/api/v1",
});

export async function getChatResponse(messages, includeVenicePrompt = true) {
  try {
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
            content: "You are a helpful AI assistant in a chat-based economy game. Help users earn and manage their virtual currency through engaging conversations and tasks."
          },
          ...messages
        ],
        venice_parameters: {
          include_venice_system_prompt: includeVenicePrompt
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
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
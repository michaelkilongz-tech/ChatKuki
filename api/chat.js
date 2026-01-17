// MINIMAL WORKING BACKEND FOR DEEPSEEK AI
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // ====================
    // YOUR GROQ API KEY (from Environment Variable)
    // ====================
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable not set');
    }

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant named DeepSeek AI.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({
        error: `Groq API error: ${response.status}`,
        details: error
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'No response';

    return res.status(200).json({
      response: aiResponse,
      success: true,
      model: 'llama-3.1-8b-instant'
    });

  } catch (error) {
    console.error('Backend error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
            }

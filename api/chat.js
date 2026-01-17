// SIMPLE WORKING BACKEND
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get API key from Vercel
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY not set in environment');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    console.log('Calling Groq API with key:', GROQ_API_KEY.substring(0, 10) + '...');
    
    // Simple Groq API call
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
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });
    
    const data = await response.json();
    console.log('Groq response:', response.status, data);
    
    if (data.choices && data.choices[0]) {
      return res.json({
        response: data.choices[0].message.content,
        success: true
      });
    } else {
      return res.status(500).json({ 
        error: 'AI service error',
        details: data
      });
    }
    
  } catch (error) {
    console.error('Backend error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
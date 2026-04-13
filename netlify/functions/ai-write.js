const https = require('https');

function httpsPost(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { topic } = JSON.parse(event.body);

    const prompt = `You are a TNPSC current affairs writer. Write a complete article in Tamil about: "${topic}"

Return ONLY a valid JSON object with no extra text, no markdown, no code fences. Use this exact structure:
{
  "title": "Tamil title here",
  "category": "one of: அரசியல் & நிர்வாகம், அறிவியல் & தொழில்நுட்பம், சுற்றுச்சூழல், பொருளாதாரம், தமிழ்நாடு, வரலாறு, விளையாட்டு, சர்வதேசம்",
  "emoji": "one relevant emoji",
  "excerpt": "1-2 sentence Tamil summary",
  "content": "2-3 paragraph Tamil article about the topic",
  "examTips": ["tip 1 in Tamil", "tip 2 in Tamil", "tip 3 in Tamil"],
  "quiz": [
    {"question": "Tamil question 1", "options": ["option A", "option B", "option C", "option D"], "correct": 0, "explanation": "Tamil explanation"},
    {"question": "Tamil question 2", "options": ["option A", "option B", "option C", "option D"], "correct": 1, "explanation": "Tamil explanation"},
    {"question": "Tamil question 3", "options": ["option A", "option B", "option C", "option D"], "correct": 2, "explanation": "Tamil explanation"}
  ]
}`;

    const bodyStr = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    };

    const data = await httpsPost(options, bodyStr);

    // Surface full API error if something went wrong
    if (!data.content) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API error', details: JSON.stringify(data) })
      };
    }

    const text = data.content[0].text.trim();
    const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(clean);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};

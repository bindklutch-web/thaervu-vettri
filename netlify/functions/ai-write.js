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
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
    });

    const apiKey = process.env.GEMINI_API_KEY;
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    };

    const data = await httpsPost(options, bodyStr);

    if (!data.candidates || !data.candidates[0]) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Gemini error', details: JSON.stringify(data) })
      };
    }

    const text = data.candidates[0].content.parts[0].text.trim();
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

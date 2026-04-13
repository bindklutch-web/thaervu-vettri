exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { topic } = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a TNPSC current affairs writer. Write a complete article in Tamil about: "${topic}"

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
}`
        }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text.trim();
    const parsed = JSON.parse(text);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    };

  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};

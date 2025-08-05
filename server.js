const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const OPENROUTER_API_KEY =
  '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';

const app = express();
app.use(cors());
app.use(bodyParser.json());

function buildPrompt(memory) {
  return `Summarize the following chat transcript as a personality card. Write a detailed, friendly, natural language summary of the user's personality, interests, and communication style. Make it sound like a real human summary, not a template.\n\nChat Transcript:\n${memory}\n\nPersonality Card:`;
}

app.post('/generate-card', async (req, res) => {
  const { memory } = req.body;
  if (!memory || typeof memory !== 'string' || memory.length < 20) {
    return res
      .status(400)
      .json({ card: '', error: 'No valid memory provided.' });
  }
  if (!OPENROUTER_API_KEY) {
    return res
      .status(500)
      .json({ card: '', error: 'OpenRouter API key missing.' });
  }

  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'ChatCard Personality Card',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3-8b-instruct',
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful assistant that writes personality summary cards.',
            },
            { role: 'user', content: buildPrompt(memory) },
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      }
    );

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonErr) {
      console.error('OpenRouter API returned non-JSON:', text);
      throw new Error('OpenRouter API returned invalid response.');
    }
    if (!response.ok) {
      console.error('OpenRouter API error:', data);
      throw new Error(
        data.error?.message || data.error || 'OpenRouter API error'
      );
    }

    console.log('OpenRouter API response:', data);
    const card = data.choices?.[0]?.message?.content?.trim() || '';
    if (!card) {
      console.error('No card generated. Full API response:', data);
      throw new Error('No card generated.');
    }
    res.json({ card });
  } catch (e) {
    console.error('Error in /generate-card:', e);
    res.status(500).json({ card: '', error: e.message || 'AI backend error' });
  }
});

app.listen(3001, () =>
  console.log('ChatCard AI backend running on http://localhost:3001')
);

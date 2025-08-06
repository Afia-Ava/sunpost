const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const HF_API_TOKEN = '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';

const app = express();
app.use(cors());
app.use(bodyParser.json());

function buildPrompt(memory) {
  return `You are an expert at writing personality summary cards. Given the following chat transcript, write a detailed, friendly, and natural language summary of the user's personality, interests, and communication style. Make it sound like a real human wrote it, not a template. Include unique traits, quirks, and any interesting observations.\n\nChat Transcript:\n${memory}\n\nPersonality Card:`;
}

app.post('/generate-card', async (req, res) => {
  const { memory } = req.body;
  console.log('--- Incoming /generate-card request ---');
  console.log('Memory:', typeof memory, memory && memory.slice(0, 120));
  if (!memory || typeof memory !== 'string' || memory.length < 20) {
    console.log('Rejected: No valid memory provided.');
    return res
      .status(400)
      .json({ card: '', error: 'No valid memory provided.' });
  }
  if (!HF_API_TOKEN) {
    console.log('Rejected: Hugging Face API token missing.');
    return res
      .status(500)
      .json({ card: '', error: 'Hugging Face API token missing.' });
  }

  try {
    const HF_MODEL = 'meta-llama/Llama-2-13b-chat-hf';
    const payload = {
      inputs: buildPrompt(memory),
      parameters: {
        max_new_tokens: 400,
        temperature: 0.7,
        return_full_text: false,
      },
    };
    console.log(
      'Sending to Hugging Face:',
      JSON.stringify(payload).slice(0, 300)
    );
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error('Non-JSON response from Hugging Face:', text);
      return res.status(502).json({
        card: '',
        error: 'Hugging Face API returned invalid response.',
      });
    }
    console.log('Hugging Face API response:', data);
    if (!response.ok) {
      if (data.error) {
        if (data.error.includes('loading')) {
          return res.status(503).json({
            card: '',
            error:
              'The AI model is still loading. Please wait a minute and try again.',
          });
        }
        if (data.error.includes('rate limit')) {
          return res.status(429).json({
            card: '',
            error:
              'Hugging Face API rate limit reached. Please try again later.',
          });
        }
        return res.status(502).json({ card: '', error: data.error });
      }
      return res
        .status(502)
        .json({ card: '', error: 'Hugging Face API error.' });
    }
    let card = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      card = data[0].generated_text.trim();
    } else if (typeof data.generated_text === 'string') {
      card = data.generated_text.trim();
    }
    if (!card) {
      console.error('No card generated. Full API response:', data);
      return res.status(502).json({ card: '', error: 'No card generated.' });
    }
    console.log('Generated card:', card.slice(0, 200));
    res.json({ card });
  } catch (e) {
    console.error('Error in /generate-card:', e);
    res.status(500).json({ card: '', error: e.message || 'AI backend error' });
  }
});

app.listen(3001, () =>
  console.log('Sunpost AI backend running on http://localhost:3001')
);

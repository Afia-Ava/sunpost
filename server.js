const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

let cohereApiKey = '';
try {
  cohereApiKey = require('./cohere-secrets.js').COHERE_API_KEY;
} catch (e) {
  console.error(
    'Cohere API key not found. Please create cohere-secrets.js with COHERE_API_KEY.'
  );
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

function buildPrompt(memory) {
  return `Analyze the following chat transcript and write a detailed personality card.\n\nFill in every section with specific details from the transcript. Do not repeat this prompt.\n\nChat Transcript:\n${memory}\n\nPersonality Card:\nTraits:\nInterests:\nCommunication Style:\nEmotional Tone:\nSummary:`;
}

app.post('/generate-card', async (req, res) => {
  const { memory } = req.body;
  if (!memory || typeof memory !== 'string' || memory.length < 20) {
    return res
      .status(400)
      .json({ card: '', error: 'No valid memory provided.' });
  }
  if (!cohereApiKey) {
    return res.status(500).json({ card: '', error: 'Cohere API key missing.' });
  }
  try {
    const prompt = buildPrompt(memory);
    const cohereRes = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cohereApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command',
        prompt,
        max_tokens: 320,
        temperature: 0.85,
        k: 0,
        stop_sequences: ['\n\n'],
        return_likelihoods: 'NONE',
      }),
    });
    const data = await cohereRes.json();
    const card =
      data.generations && data.generations[0] && data.generations[0].text
        ? data.generations[0].text.trim()
        : '';
    if (!card) throw new Error('No card generated.');
    res.json({ card });
  } catch (err) {
    console.error('Cohere error:', err);
    res.status(500).json({ card: '', error: 'AI backend error.' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`ChatCard AI backend running on http://localhost:${PORT}`);
});

const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

// POST /api/gemini
// Body: { problem: string }
app.post('/api/gemini', async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: 'Server API key not configured (set GEMINI_API_KEY).' });

    const { problem } = req.body || {};
    if (!problem || typeof problem !== 'string') return res.status(400).json({ error: 'Missing problem in request body' });

    // Google Generative Language (Gemini) example endpoint. Adjust model or URL if needed.
    const apiUrl = ``;
    const payload = {
      // The exact request format may differ; this worked with earlier beta examples.
      // We ask the model to return only the final numerical answer.
      prompt: `Solve the following math word problem and return only the numeric answer: ${problem}`,
      max_output_tokens: 80,
      temperature: 0.0
    };

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await resp.json();
    return res.status(resp.status).json(json);
  } catch (err) {
    console.error('Proxy error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

app.listen(PORT, () => console.log(`Proxy listening on http://localhost:${PORT}`));

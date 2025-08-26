const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY || ''; // Set to empty for local fallback

function localSolver(problem) {
    const match = problem.match(/(\d+)\s*pages.*?(\d+)\s*pages/);
    if (match) {
        const totalPages = parseInt(match[1], 10);
        const pagesPerDay = parseInt(match[2], 10);
        return Math.ceil(totalPages / pagesPerDay);
    }
    return null; // Return null if the problem cannot be solved
}

// POST /api/gemini
// Body: { problem: string }
app.post('/api/gemini', async (req, res) => {
  try {
    const { problem } = req.body || {};
    if (!problem || typeof problem !== 'string') return res.status(400).json({ error: 'Missing problem in request body' });

    // Use local solver if API key is not configured
    if (!API_KEY) {
        const result = localSolver(problem);
        if (result !== null) {
            return res.status(200).json({ answer: result });
        } else {
            return res.status(400).json({ error: 'Could not solve problem locally.' });
        }
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
    const payload = {
      contents: [{
        parts: [{
          text: `Solve the following math word problem and return only the numeric answer: ${problem}`
        }]
      }],
      generationConfig: {
        maxOutputTokens: 80,
        temperature: 0.0
      }
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

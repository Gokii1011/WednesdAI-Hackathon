const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// ✅ Define allowed origins (including your Vercel app URL)
const allowedOrigins = [
  'http://localhost:3000', // for local testing
  'https://wednesd-ai-hackathon-n9to.vercel.app' // your deployed frontend
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed from this origin'));
  }
}));

app.use(express.json());

// ⚠️ NEVER expose this token in frontend — keep it secret
const SALESFORCE_ACCESS_TOKEN = 'Bearer eyJ0bmsiOi...'; // ← keep the token secure
const AGENT_ENDPOINT = 'https://api.salesforce.com/einstein/ai-agent/v1/sessions/b03772db-73db-45f8-8d35-49a89b34682a/messages';

app.post('/agent', async (req, res) => {
  try {
    const response = await fetch(AGENT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': SALESFORCE_ACCESS_TOKEN
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error forwarding to Salesforce:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});

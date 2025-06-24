const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors()); // allow all origins for now
app.use(express.json());

const SALESFORCE_ACCESS_TOKEN = 'eyJ0bmsiOiJjb3JlL3Byb2QvMDBESG8wMDAwMDdFWFNWTUE0IiwidmVyIjoiMS4wIiwia2lkIjoiQ09SRV9BVEpXVC4wMERIbzAwMDAwN0VYU1YuMTc1MDI2MjIxNTMwNSIsInR0eSI6InNmZGMtY29yZS10b2tlbiIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzY3AiOiJzZmFwX2FwaSBjaGF0Ym90X2FwaSBhcGkiLCJzdWIiOiJ1aWQ6MDA1SG8wMDAwMDkzZlJxSUFJIiwicm9sZXMiOltdLCJpc3MiOiJodHRwczovL2luMTc1MDI1NzIyOTIyMy5teS5zYWxlc2ZvcmNlLmNvbSIsImNsaWVudF9pZCI6IjNNVkc5UnIwRVoyWU9WTWFVaWlNMl81TzlMem5PUmc2TVZMRk9QbFZxaElTLnNGYVpEUzRRbDBRa0xfWUloNGVsci51QW5sSE40RGV1MzFXUFh2X00iLCJhdWQiOlsiaHR0cHM6Ly9pbjE3NTAyNTcyMjkyMjMubXkuc2FsZXNmb3JjZS5jb20iLCJodHRwczovL2FwaS5zYWxlc2ZvcmNlLmNvbSJdLCJuYmYiOjE3NTA3NTM4NjQsIm10eSI6Im9hdXRoIiwic2ZhcF9yaCI6ImJvdC1zdmMtbGxtOmF3cy1wcm9kOC1jYWNlbnRyYWwxL2VpbnN0ZWluLGJvdC1zdmMtbGxtL0Zsb3dHcHQ6YXdzLXByb2QxLXVzZWFzdDEvZWluc3RlaW4sZWluc3RlaW4tdHJhbnNjcmliZS9FaW5zdGVpbkdQVDphd3MtcHJvZDgtY2FjZW50cmFsMS9laW5zdGVpbixlaW5zdGVpbi1haS1nYXRld2F5L0VpbnN0ZWluR1BUOmF3cy1wcm9kOC1jYWNlbnRyYWwxL2VpbnN0ZWluIiwic2ZpIjoiYTVhMTM4Y2Y1MTZiMzU1MDhjZGIwMmY1YmM5ZmExOWZhZmNlN2Q5MzNhNzhmMTVhMDg2MjBmNzkxYjRkYTZiYSIsInNmYXBfb3AiOiJFaW5zdGVpbkhhd2tpbmdDMkNFbmFibGVkLEVHcHRGb3JEZXZzQXZhaWxhYmxlLEVpbnN0ZWluR2VuZXJhdGl2ZVNlcnZpY2UsVGFibGVhdU1ldHJpY0Jhc2ljcyxTYWxlc2ZvcmNlQ29uZmlndXJhdG9yRW5naW5lIiwiaHNjIjpmYWxzZSwiZXhwIjoxNzUwNzU1Njc5LCJpYXQiOjE3NTA3NTM4Nzl9.aCke6hm687MkYQedUU19-jBZrySIu0XVQITKk7WICcakvXGCntaFSUCspK0rlSziOSmRgbsp0lSS3YppHqEkZ3MuKKYk5qGo6BSF2CXMzpOYRB2U0Gf29cwJuGoNimoA_imDy7hfVB7ilsggrV6_YEFJCqxss2sVUeZgdkTU97bC2GLucfj1Zj80iUO1EMJgpi5Xd8T_AmDKkqsCmDoxIs_E9Xj6sWgM98q3zKZDg3b0hweUE4vWpgntDZTZdbRmSpxpuFRAmcNf83f-RHOojkO3BCcztXIFnLdhnaJ6n0DIpT_OFcxeMkswuNFgOZqVuHFju68SF9dTKLF8Uy4rXQ';
const AGENT_ENDPOINT = 'https://api.salesforce.com/einstein/ai-agent/v1/sessions/b03772db-73db-45f8-8d35-49a89b34682a/messages';

app.post('/agent', async (req, res) => {
  try {
    const response = await fetch(AGENT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SALESFORCE_ACCESS_TOKEN}`
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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
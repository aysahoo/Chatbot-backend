import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { config } from 'dotenv';

config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/chat', async (req, res) => {
  const { messages } = req.body;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not set.' });
  }
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          ...messages,
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    console.error('OpenAI API error:', err);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.post('/summarize', async (req, res) => {
  const { messages } = req.body;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not set.' });
  }
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Given the following chat, generate a short, clear, and engaging title (max 8 words) that best describes the main topic or purpose of the conversation. Do not include generic words like "Chat" or "Conversation". Only return the title.' },
          ...messages,
        ],
        max_tokens: 20,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({ title: response.data.choices[0].message.content.trim() });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
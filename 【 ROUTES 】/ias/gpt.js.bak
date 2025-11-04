// api/endpoints/gpt.js
import express from 'express';
import fetch from 'node-fetch'; // se estiver usando Node 18+ pode usar global fetch

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Passe ?query=' });

  try {
    // Faz a requisição para o seu "GPT" ou serviço de texto
    const response = await fetch(`https://text.pollinations.ai/responda%20isso%20em%20português:%20${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain'
      }
    });

    const text = await response.text();

    if (!text) return res.status(404).json({ error: 'Nenhuma resposta encontrada' });

    // Retorna como JSON
    res.json({ pergunta: query, resposta: text });
  } catch (err) {
    next(err);
  }
});

export default router;
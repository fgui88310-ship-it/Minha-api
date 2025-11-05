import express from 'express';
const router = express.Router();

import { buscarPorEmoji, buscarPorTexto, infoGeral } from '../../【 SCRAPERS 】/emojiService.js';

router.get('/', async (req, res, next) => {
  try {
    const { query, emoji, limit = 20, page = 1 } = req.query;

    if (!query && !emoji) {
      return res.status(400).json({ error: 'Passe ?query= ou ?emoji=' });
    }

    // 🔹 Busca direta por emoji
    if (emoji) {
      const result = await buscarPorEmoji(emoji); // <-- aqui
      if (!result) return res.status(404).json({ error: 'Emoji não encontrado' });
      return res.json(result);
    }

    // 🔹 Busca por texto
    const results = await buscarPorTexto(query, parseInt(limit), parseInt(page)); // <-- aqui
    if (results.length === 0) return res.status(404).json({ error: 'Nenhum emoji encontrado' });

    res.json({
      total: results.length,
      page: parseInt(page),
      limit: parseInt(limit),
      results
    });
  } catch (err) {
    next(err);
  }
});

export default router;
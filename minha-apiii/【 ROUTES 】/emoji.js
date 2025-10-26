import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import { CACHE_EMOJI, EMOJI_DIR } from '../config.js';

const router = express.Router();

// Carrega todos os emojis direto da pasta
const allEmojis = fs.readdirSync(EMOJI_DIR)
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(EMOJI_DIR, f), 'utf8')));

// Cache em memória para pesquisas
const memoryCache = new Map();

router.get('/', (req, res, next) => {
  try {
  const { query, emoji, limit = 20, page = 1 } = req.query;

  if (!query && !emoji) return res.status(400).json({ error: 'Passe ?query= ou ?emoji=' });

  // pesquisa direta por emoji
  if (emoji) {
    const result = allEmojis.find(e => e.emoji === emoji);
    if (!result) return res.status(404).json({ error: 'Emoji não encontrado' });
    return res.json(result);
  }

  // pesquisa por texto com cache
  const cacheKey = `${query}:${limit}:${page}`;
  if (memoryCache.has(cacheKey)) return res.json(memoryCache.get(cacheKey));

  const matches = allEmojis.filter(d =>
    d.nome.toLowerCase().includes(query.toLowerCase()) ||
    d.categoria.toLowerCase().includes(query.toLowerCase())
  );

  if (matches.length === 0) return res.status(404).json({ error: 'Nenhum emoji encontrado' });

  const start = (page - 1) * limit;
  const paginated = matches.slice(start, start + parseInt(limit));

  memoryCache.set(cacheKey, paginated);

  res.json({
    total: matches.length,
    page: parseInt(page),
    limit: parseInt(limit),
    results: paginated
  });
  } catch (err) {
  next(err);
  }
});

export default router;

import express from 'express';
import { validateQuery } from '../【 VALIDATORS 】/anime.js';
import { searchInfoAnime } from '../【 SCRAPERS 】/infoanime.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { query, limit = 5 } = req.query;
  const validation = validateQuery(query);
  if (validation.error) return res.status(validation.status).json({ error: validation.error });

  try {
    const results = await searchInfoAnime(query, parseInt(limit, 10));
    if (!results.length) return res.json({ message: `Nenhum resultado para "${query}"`, results: [], total: 0 });
    res.json({ results, total: results.length, source: 'InfoAnime' });
  } catch (err) {
    next(err);
  }
});

export default router;
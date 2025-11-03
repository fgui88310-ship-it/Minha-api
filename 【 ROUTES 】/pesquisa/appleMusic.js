import express from 'express';
import { searchAppleMusic } from '../../【 SCRAPERS 】/appleMusicService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { query, limit = 5 } = req.query;
  if (!query) return res.status(400).json({ error: 'Passe ?query= para buscar músicas' });

  try {
    const results = await searchAppleMusic(query, limit);
    if (results.length === 0) return res.status(404).json({ error: 'Nenhum resultado encontrado' });
    res.json(results);
  } catch (err) {
    next(err);
  }
});

export default router;
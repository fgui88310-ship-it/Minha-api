import express from 'express';
import { searchMovies } from '../【 SCRAPERS 】/movieService.js';
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { query, limit = 5 } = req.query;
    if (!query) return res.status(400).json({ error: 'Passe ?query= para buscar filmes' });
    const movies = await searchMovies(query, +limit);
    res.json(movies);
  } catch (err) {
    next(err); 
  }
});

export default router;
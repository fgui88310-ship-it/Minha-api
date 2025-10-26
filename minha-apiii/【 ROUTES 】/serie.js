// api/endpoints/serie.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

// Endpoint: /api/serie?query=nome_da_serie&limit=5
router.get('/', async (req, res, next) => {
  const { query, limit = 5 } = req.query;
  if (!query) return res.status(400).json({ error: 'Passe ?query= para buscar séries' });

  try {
    const API_KEY_TMDB = 'ddfcb99fae93e4723232e4de755d2423'; // sua chave TMDB
    const url = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY_TMDB}&query=${encodeURIComponent(query)}&language=pt-BR&page=1`;
    
    const { data } = await axios.get(url, { timeout: 5000 });

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ error: 'Nenhuma série encontrada' });
    }

    const series = data.results.slice(0, limit).map(s => ({
      id: s.id,
      titulo: s.name,
      original_title: s.original_name,
      overview: s.overview || "Sem descrição disponível",
      poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
      backdrop: s.backdrop_path ? `https://image.tmdb.org/t/p/w780${s.backdrop_path}` : null,
      first_air_date: s.first_air_date,
      vote_average: s.vote_average,
      vote_count: s.vote_count,
      popularity: s.popularity,
      adult: s.adult
    }));

    res.json(series);
  } catch (err) {
    next(err);
  }
});

export default router;
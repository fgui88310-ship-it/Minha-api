// api/endpoints/wallpaper.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * Endpoint: /api/wallpaper?q=naruto&limit=5
 */
router.get('/', async (req, res, next) => {
  const { q = 'anime', limit = 5 } = req.query;

  try {
    const url = `https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(q)}&categories=111&purity=100&sorting=random&order=desc`;

    const { data } = await axios.get(url, { timeout: 8000 });

    if (!data || !data.data || data.data.length === 0) {
      return res.status(404).json({ error: 'Nenhum wallpaper encontrado.' });
    }

    // Mapeia os resultados e limita a quantidade
    const wallpapers = data.data.slice(0, limit).map((w) => ({
      titulo: w.id,
      link: w.url,
      imagem: w.path,
      thumb: w.thumbs.small,
      categoria: w.category,
      resolucao: w.resolution,
      favoritos: w.favorites,
    }));

    res.json(wallpapers);
  } catch (err) {
    next(err);
  }
});

export default router;
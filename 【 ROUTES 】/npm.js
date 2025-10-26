// api/endpoints/npm.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { query, limit = 5 } = req.query;
  if (!query) return res.status(400).json({ error: 'Passe ?query= para buscar pacotes npm' });

  try {
    const { data } = await axios.get(`https://api.npms.io/v2/search`, {
      params: { q: query, size: limit },
      timeout: 5000,
    });

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ error: 'Nenhum pacote encontrado' });
    }

    const pacotes = data.results.map(item => ({
      nome: item.package.name,
      descricao: item.package.description,
      versao: item.package.version,
      link: item.package.links.npm,
      downloads: item.score.detail.popularity.toFixed(2),
    }));

    res.json(pacotes);
  } catch (err) {
    next(err);
  }
});

export default router;
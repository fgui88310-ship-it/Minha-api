import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const q = req.query.query;
  const limit = parseInt(req.query.limit) || 5;
  if (!q) return res.status(400).json({ error: 'O parâmetro "q" é obrigatório (nome ou gênero do filme).' });

  try {
    const url = `https://www.imdb.com/find/?query=${encodeURIComponent(q)}&s=tt&ttype=ft`;
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    });

    const $ = cheerio.load(data);
    const filmes = [];

    // Novo layout da página de busca IMDb (2024+)
    $('.ipc-metadata-list-summary-item').each((_, el) => {
      const titulo = $(el).find('.ipc-metadata-list-summary-item__t').text().trim();
      const link = 'https://www.imdb.com' + $(el).find('a.ipc-metadata-list-summary-item__t').attr('href');
      const ano = $(el).find('.ipc-metadata-list-summary-item__li').first().text().trim() || 'Desconhecido';
      const poster = $(el).find('img').attr('src') || null;

      if (titulo) filmes.push({ titulo, ano, link, poster });
    });

    if (filmes.length === 0) {
      return res.status(404).json({ error: 'Nenhum resultado encontrado.' });
    }

    res.json({
      query: q,
      total: filmes.length,
      filmes: filmes.slice(0, limit),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
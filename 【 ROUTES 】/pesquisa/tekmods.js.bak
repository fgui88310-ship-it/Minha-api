// api/routes/tekmods.js
import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { query, limit = 10 } = req.query;
  if (!query) return res.status(400).json({ error: 'Passe ?query= para buscar aplicativos' });

  try {
    const searchTerm = encodeURIComponent(query.replace(/\s+/g, '+').toLowerCase());
    const url = `https://tekmods.com/?s=${searchTerm}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const resultados = [];

    $('div#listpost').each((index, element) => {
      if (resultados.length >= limit) return false;

      const titulo = $(element).find('h3.h5.font-weight-semibold').text().trim();
      const link = $(element).find('a.archive-post').attr('href');
      if (titulo && link) resultados.push({ titulo, link });
    });

    if (resultados.length === 0) {
      fs.writeFileSync('./tekmods_debug.html', response.data);
      return res.status(404).json({ error: 'Nenhum aplicativo encontrado', debugFile: 'tekmods_debug.html' });
    }

    res.json(resultados);

  } catch (err) {
    next(err);
  }
});

export default router;
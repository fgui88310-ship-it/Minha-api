// api/endpoints/soundcloud.js
import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "Indisponível";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function parseISO8601Duration(durationStr) {
  if (!durationStr) return 0;
  const match = durationStr.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  const hours = match[1] ? parseInt(match[1].replace('H','')) : 0;
  const minutes = match[2] ? parseInt(match[2].replace('M','')) : 0;
  const seconds = match[3] ? parseInt(match[3].replace('S','')) : 0;
  return hours * 3600 + minutes * 60 + seconds;
}

router.get('/', async (req, res, next) => {
  const { query, limit = 5 } = req.query;
  if (!query) return res.status(400).json({ error: 'Passe ?query= para buscar músicas no SoundCloud' });

  try {
    const searchUrl = `https://soundcloud.com/search/sounds?q=${encodeURIComponent(query)}&filter.content_type=sound`;
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      responseType: 'text',
    });

    const $ = cheerio.load(data);
    const results = [];

    // Parse <noscript> para pegar os links das faixas
    $('noscript').each((i, el) => {
      if (results.length >= limit) return false;
      const $ns = cheerio.load($(el).html());
      $ns('ul li h2 a').each((j, a) => {
        if (results.length >= limit) return false;
        const title = $ns(a).text().trim();
        const url = $ns(a).attr('href');
        if (url && !url.includes('/sets/')) {
          results.push({
            title,
            url: url.startsWith('http') ? url : `https://soundcloud.com${url}`,
            artist_name: 'Indisponível',
            artist_url: 'Indisponível',
            duration: 0
          });
        }
      });
    });

    if (results.length === 0) return res.status(404).json({ error: 'Nenhuma faixa encontrada' });

    res.json(results.slice(0, limit));

  } catch (err) {
    next(err);
  }
});

export default router;
import express from 'express';
import gplay from 'google-play-scraper';
import { setCache, getCache } from '../【 MODULES 】/libs.js';

const router = express.Router();

/**
 * Busca apps na Play Store por texto
 * Ex: GET /playstore?query=whatsapp&limit=5
 */
router.get('/', async (req, res, next) => {
  const { query, limit = 10 } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Passe ?query= para buscar apps' });
  }

  const cacheKey = `playstore:q:${query}:${limit}`;
  const cached = getCache(cacheKey);
  if (cached) {
    console.log('[CACHE] Resultado PlayStore servido do cache:', cacheKey);
    return res.json(cached);
  }

  try {
    const results = await gplay.search({
      term: query,
      num: Math.min(parseInt(limit), 50),
      lang: 'pt-BR',
      country: 'br',
    });

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Nenhum app encontrado' });
    }

    // formatação dos dados retornados
    const apps = results.map(app => ({
      appId: app.appId,
      title: app.title,
      developer: app.developer,
      score: app.score || null,
      installs: app.installs || null,
      price: app.priceText || 'Grátis',
      summary: app.summary || '',
      url: app.url,
      icon: app.icon,
    }));

    setCache(cacheKey, apps);
    console.log('[SCRAPER] Resultado PlayStore:', JSON.stringify(apps, null, 2));
    res.json(apps);

  } catch (err) {
    next(err);
  }
});

export default router;
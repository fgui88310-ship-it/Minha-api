import gplay from 'google-play-scraper';
import { getCache, setCache } from '../【 UTILS 】/cache.js';
import { PLAYSTORE_CONFIG } from '../config.js';

export async function buscarAppsPlayStore(query, limit) {
  const maxLimit = Math.min(parseInt(limit) || 10, PLAYSTORE_CONFIG.MAX_LIMIT);
  const cacheKey = `${PLAYSTORE_CONFIG.CACHE_PREFIX}${query}:${maxLimit}`;

  const cached = getCache(cacheKey);
  if (cached) return cached;

  const results = await gplay.search({
    term: query,
    num: maxLimit,
    lang: PLAYSTORE_CONFIG.LANG,
    country: PLAYSTORE_CONFIG.COUNTRY
  });

  if (!results || results.length === 0) {
    return null;
  }

  const apps = results.map(app => ({
    appId: app.appId,
    title: app.title,
    developer: app.developer,
    score: app.score || null,
    installs: app.installs || null,
    price: app.priceText || 'Grátis',
    summary: app.summary || '',
    url: app.url,
    icon: app.icon
  }));

  setCache(cacheKey, apps);
  return apps;
}
import axios from 'axios';
import * as cheerio from 'cheerio';
import { cache } from '../config.js';

export async function searchDoujin(query, page = 1) {
  const cacheKey = `${query.toLowerCase()}_p${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = `https://nhentai.net/search/?q=${encodeURIComponent(query)}&page=${page}`;
  
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 7000,
    });

    const $ = cheerio.load(data);
    const results = [];

    $('.gallery').each((_, el) => {
      const href = $(el).find('a').attr('href')?.trim();
      const title = $(el).find('.caption').text().trim();
      const rawThumb = $(el).find('.cover img').attr('data-src') || $(el).find('.cover img').attr('src');
      if (!href || !title || !rawThumb) return;

      results.push({
        title,
        link: 'https://nhentai.net' + href,
        thumbnail: rawThumb.replace('t.nhentai.net', 'i.nhentai.net'),
      });
    });

    cache.set(cacheKey, results);
    return results;
  } catch (err) {
    console.error(`[NHENTAI] Erro ao buscar "${query}" p${page}:`, err.message);
    return [];
  }
}
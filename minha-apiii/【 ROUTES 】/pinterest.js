// api/endpoints/pinterest.js
import express from 'express';
import axios from 'axios';
import { parseHTML } from 'linkedom';

const router = express.Router();

// === CONFIGURAÇÕES ===
const CONFIG = {
  API: {
    BASE_URL: 'https://br.pinterest.com',
    TIMEOUT: 30000,
    HEADERS: {
      MOBILE: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.152 Mobile Safari/537.36'
      },
      DESKTOP: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }
  },
  MEDIA: {
    IMAGE_SIZES: {
      LARGE: '736x'
    }
  },
  CACHE: {
    MAX_SIZE: 1000,
    EXPIRE_TIME: 30 * 60 * 1000
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000
  }
};

// === CACHE ===
class PinterestCache {
  constructor() { this.cache = new Map(); }
  getKey(type, input) { return `${type}:${input.toLowerCase()}`; }
  get(type, input) {
    const key = this.getKey(type, input);
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > CONFIG.CACHE.EXPIRE_TIME) { this.cache.delete(key); return null; }
    return cached.data;
  }
  set(type, input, data) {
    if (this.cache.size >= CONFIG.CACHE.MAX_SIZE) this.cache.delete(this.cache.keys().next().value);
    const key = this.getKey(type, input);
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

// === CLIENTE PINTEREST ===
class PinterestClient {
  constructor() { this.axios = axios.create({ baseURL: CONFIG.API.BASE_URL, timeout: CONFIG.API.TIMEOUT }); }
  async request(config, attempt = 1) {
    try { return await this.axios.request(config); }
    catch (err) {
      if (attempt < CONFIG.RETRY.MAX_ATTEMPTS) { 
        await new Promise(r => setTimeout(r, CONFIG.RETRY.DELAY * attempt));
        return this.request(config, attempt + 1);
      }
      throw err;
    }
  }
  async search(query) {
  const response = await this.request({
    method: 'GET',
    url: `/search/pins/?q=${encodeURIComponent(query)}`,
    headers: CONFIG.API.HEADERS.MOBILE
  });

  const { document } = parseHTML(response.data);
  const images = [];
  let count = 0;

  // Percorre apenas até achar 5 imagens
  for (const el of document.querySelectorAll('.hCL')) {
    const src = el.getAttribute('src');
    if (src) {
      images.push(src.replace(/236x/g, CONFIG.MEDIA.IMAGE_SIZES.LARGE));
      count++;
    }
    if (count >= 5) break; // Para assim que pegar 5
  }

  return images;
}
}

const cache = new PinterestCache();
const client = new PinterestClient();

// === ENDPOINT ===
router.get('/', async (req, res, next) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Passe ?query= para pesquisar' });

  try {
    const cached = cache.get('search', query);
    if (cached) return res.json(cached);

    const images = await client.search(query);
    if (images.length === 0) return res.status(404).json({ error: 'Nenhuma imagem encontrada.' });

    const result = { ok: true, type: 'image', urls: images };
    cache.set('search', query, result);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
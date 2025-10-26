// api/utils/tiktokApi.js
import { axios, http, https } from '../【 MODULES 】/libs.js';

// Configurações
const CONFIG = {
  API: {
    BASE_URL: 'https://www.tikwm.com/api',
    TIMEOUT: 30000,
    HEADERS: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': 'current_language=pt-BR',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
    }
  },
  SEARCH: {
    MAX_RESULTS: 5,
    DEFAULT_CURSOR: 0,
    HD_QUALITY: 1
  },
  CACHE: {
    MAX_SIZE: 1000,
    EXPIRE_TIME: 30 * 60 * 1000 // 30 minutos
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000
  }
};

// Instância do Axios com keepAlive
const axiosInstance = axios.create({
  baseURL: CONFIG.API.BASE_URL,
  timeout: CONFIG.API.TIMEOUT,
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  headers: CONFIG.API.HEADERS
});

// Cache para resultados
let cache = new Map();
let cacheExpiry = new Map();

function getCacheKey(type, input) {
  return `${type}:${input}`;
}

function getCached(type, input) {
  const key = getCacheKey(type, input);
  const expiry = cacheExpiry.get(key);
  if (expiry && Date.now() < expiry) return cache.get(key);
  cache.delete(key);
  cacheExpiry.delete(key);
  return null;
}

function setCache(type, input, data) {
  if (cache.size >= CONFIG.CACHE.MAX_SIZE) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
    cacheExpiry.delete(oldestKey);
  }

  const key = getCacheKey(type, input);
  cache.set(key, data);
  cacheExpiry.set(key, Date.now() + CONFIG.CACHE.EXPIRE_TIME);
}

async function request(config, attempt = 1) {
  try {
    const response = await axiosInstance.request(config);
    return response.data;
  } catch (error) {
    if (attempt < CONFIG.RETRY.MAX_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY.DELAY * attempt));
      return request(config, attempt + 1);
    }
    throw new Error(`Erro na API TikTok: ${error.response?.data?.message || error.message}`);
  }
}

function getTikTokId(url) {
  const match = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
  return match ? match[1] : null;
}

export async function fetchTikTokPost(url) {
  if (!url) return null; // validação básica

  const cached = getCached('download', url);
  if (cached) return cached;

  try {
    const data = await request({
      method: 'GET',
      url: '/',
      params: { url }
    });

    if (!data?.data) {
      console.error('Dados inválidos recebidos da API:', data);
      return null;
    }

    const media = data.data;
    const result = {
      creator: 'Guilherme',
      type: media.images ? 'image' : 'video',
      mime: media.images ? '' : 'video/mp4',
      urls: media.images ? media.images : [media.play], // 👈 Aqui o play é garantido
      audio: media.music_info?.play || '',
      title: media.title || 'Sem título',
      is_private: media.is_private || false,
      views: media.play_count || 0,
      likes: media.digg_count || '❤️ Não disponível',
      taken_at_timestamp: media.create_time || 0
    };

    setCache('download', url, result);
    return result;

  } catch (err) {
    console.error('Erro ao buscar post TikTok:', err.message);
    return null;
  }
}

export async function searchTikTok(query) {
  if (!query || typeof query !== 'string') return null;

  const cached = getCached('search', query);
  if (cached) return cached;

  try {
    const data = await request({
      method: 'POST',
      url: '/feed/search',
      data: {
        keywords: query,
        count: CONFIG.SEARCH.MAX_RESULTS,
        cursor: CONFIG.SEARCH.DEFAULT_CURSOR,
        HD: CONFIG.SEARCH.HD_QUALITY
      }
    });

    if (!data?.data?.videos?.length) {
      console.error('Nenhum vídeo encontrado');
      return null;
    }

    const randomVideo = data.data.videos[Math.floor(Math.random() * data.data.videos.length)];
    const result = {
      creator: 'Guilherme',
      type: 'video',
      mime: 'video/mp4',
      urls: [randomVideo.play],
      audio: randomVideo.music || '',
      title: randomVideo.title || 'Sem título',
      is_private: randomVideo.is_private || false,
      views: randomVideo.play_count || 0,
      likes: randomVideo.digg_count || '❤️ Não disponível',
      taken_at_timestamp: randomVideo.create_time || 0
    };

    setCache('search', query, result);
    return result;

  } catch (err) {
    console.error('Erro na pesquisa TikTok:', err.message);
    return null;
  }
}
import pLimit from 'p-limit';
import { axiosInstance } from '../【 UTILS 】/axiosClient.js';
import { setCache, getCache, getThreadsCache } from '../【 UTILS 】/cache.js'; // <- seu cache
import { parseVideoData, getTikTokId } from '../【 UTILS 】/parse.js';
import { CONFIG } from '../config.js';

const limit = pLimit(CONFIG.CONCURRENCY);

async function request(config, attempt = 1) {
  try {
    const response = await limit(() => axiosInstance.request(config));
    return response.data;
  } catch (error) {
    if (attempt < CONFIG.RETRY.MAX_ATTEMPTS) {
      const delay = CONFIG.RETRY.DELAY * Math.pow(2, attempt - 1);
      await new Promise(res => setTimeout(res, delay));
      return request(config, attempt + 1);
    }
    throw new Error(`Erro na API TikTok: ${error.response?.data?.message || error.message}`);
  }
}

export async function fetchTikTokPost(url) {
  const tikTokId = getTikTokId(url);
  if (!tikTokId) return null;

  const cacheKey = getThreadsCache('download', url);
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const data = await request({ method: 'GET', url: '/', params: { url } });
  if (!data?.data) return null;

  const result = parseVideoData(data.data);
  setCache(cacheKey, result, CONFIG.CACHE.EXPIRE_TIME * 1000); // TTL em ms
  return result;
}

export async function searchTikTok(query) {
  if (!query || typeof query !== 'string') return null;

  const cacheKey = getThreadsCache('search', query);
  const cached = getCache(cacheKey);
  if (cached) return cached;

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

  if (!data?.data?.videos?.length) return null;
  const randomVideo = data.data.videos[Math.floor(Math.random() * data.data.videos.length)];
  const result = parseVideoData(randomVideo);

  setCache(cacheKey, result, CONFIG.CACHE.EXPIRE_TIME * 1000);
  return result;
}
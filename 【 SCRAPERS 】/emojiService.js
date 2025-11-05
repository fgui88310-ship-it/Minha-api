import { loadJsonFiles } from '../【 UTILS 】/fileUtils.js';
import { MemoryCache } from '../【 UTILS 】/cache.js';
import { EMOJI_DIR } from '../config.js';

let allEmojis = null;
const memoryCache = new MemoryCache();

async function getAllEmojis() {
  if (!allEmojis) {
    allEmojis = await loadJsonFiles(EMOJI_DIR);
  }
  return allEmojis;
}

export async function buscarPorEmoji(emoji) {
  const data = await getAllEmojis();
  return data.find(e => e.emoji === emoji) || null;
}

export async function buscarPorTexto(query, limit = 20, page = 1) {
  const data = await getAllEmojis();
  const cacheKey = `${query}:${limit}:${page}`;

  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

  const matches = data.filter(d =>
    d.nome.toLowerCase().includes(query.toLowerCase()) ||
    d.categoria.toLowerCase().includes(query.toLowerCase())
  );

  const start = (page - 1) * limit;
  const paginated = matches.slice(start, start + parseInt(limit));
  memoryCache.set(cacheKey, paginated);
  return paginated;
}

export async function infoGeral() {
  const data = await getAllEmojis();
  return {
    totalEmojis: data.length,
    totalCategorias: new Set(data.map(e => e.categoria)).size
  };
}
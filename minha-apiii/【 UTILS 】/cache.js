// api/utils/cache.js
import fs from 'fs';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const MP3_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas
const CSRF_CACHE_TTL = 60 * 1000; // 1 minuto

// 1. CACHE GERAL (metadados de posts)
const generalCache = new Map();

// 2. CACHE DE MP3 (arquivos de música)
const mp3Cache = new Map();

// 3. CACHE DE THREADS
const threadsCache = new Map();

// 4. CACHE DE ÁUDIO (Instagram)
const audioCacheMap = new Map();

// 5. CSRF TOKEN
let cachedCSRF = null;
let csrfExpiry = 0;

// ========================================
// CSRF CACHE
// ========================================
export function getCSRFTokenCached() {
  if (cachedCSRF && Date.now() < csrfExpiry) {
    return cachedCSRF;
  }
  return null;
}

export function setCSRFTokenCached(token, ttl = CSRF_CACHE_TTL) {
  cachedCSRF = token;
  csrfExpiry = Date.now() + ttl;
}

// ========================================
// GENERAL CACHE (posts, metadados)
// ========================================
export function getCache(key) {
  const item = generalCache.get(key);
  if (!item) return null;
  
  if (Date.now() - item.ts >= item.ttl) {
    generalCache.delete(key);
    return null;
  }
  
  return item.data;
}

export function setCache(key, data, ttl = CACHE_TTL) {
  generalCache.set(key, { data, ts: Date.now(), ttl });
}

// ========================================
// MP3 CACHE
// ========================================
export function getMp3Cache(trackId) {
  const item = mp3Cache.get(trackId);
  if (!item) return null;
  
  if (Date.now() - item.ts >= MP3_CACHE_TTL) {
    mp3Cache.delete(trackId);
    return null;
  }
  
  // Verifica se arquivo existe
  if (!fs.existsSync(item.filePath)) {
    mp3Cache.delete(trackId);
    return null;
  }
  
  return item.filePath;
}

export function setMp3Cache(trackId, filePath) {
  mp3Cache.set(trackId, { 
    filePath, 
    ts: Date.now() 
  });
}

// ========================================
// THREADS CACHE
// ========================================
export function getThreadsCache(key) {
  const item = threadsCache.get(key);
  if (!item) return null;
  
  if (Date.now() - item.ts >= item.ttl) {
    threadsCache.delete(key);
    return null;
  }
  
  return item.data;
}

export function setThreadsCache(key, data, ttl = CACHE_TTL) {
  threadsCache.set(key, { 
    data, 
    ts: Date.now(), 
    ttl 
  });
}

// ========================================
// AUDIO CACHE (Instagram)
// ========================================
export class AudioCache {
  get(key) {
    const cached = audioCacheMap.get(key);
    if (!cached) return null;

    // Verificar expiração
    if (Date.now() > cached.expiry) {
      audioCacheMap.delete(key);
      return null;
    }

    // Verificar se arquivo existe
    if (!fs.existsSync(cached.path)) {
      audioCacheMap.delete(key);
      return null;
    }

    return cached.path;
  }

  set(key, path, options = {}) {
    const expiry = options.expiry || Date.now() + CACHE_TTL;
    audioCacheMap.set(key, { path, expiry });
  }

  clear() {
    audioCacheMap.clear();
  }

  size() {
    return audioCacheMap.size;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of audioCacheMap) {
      if (now > value.expiry || !fs.existsSync(value.path)) {
        audioCacheMap.delete(key);
      }
    }
  }
}

export const audioCache = new AudioCache();

// ========================================
// CACHE DE DEBUG
// ========================================
export function getCacheStats() {
  return {
    general: generalCache.size,
    mp3: mp3Cache.size,
    threads: threadsCache.size,
    audio: audioCache.size(),
    csrf: cachedCSRF ? 'valid' : 'expired'
  };
}

// ========================================
// LIMPEZA AUTOMÁTICA
// ========================================
function cleanupAllCaches() {
  const now = Date.now();
  
  // General Cache
  for (const [key, item] of generalCache) {
    if (now - item.ts >= item.ttl) generalCache.delete(key);
  }
  
  // Threads Cache
  for (const [key, item] of threadsCache) {
    if (now - item.ts >= item.ttl) threadsCache.delete(key);
  }
  
  // Audio Cache
  audioCache.cleanup();
  
  console.log('[CACHE] Limpeza automática concluída');
}

// Executa limpeza a cada 2 minutos
setInterval(cleanupAllCaches, 2 * 60 * 1000);

// Limpeza inicial
cleanupAllCaches();

// ========================================
// EXPORTAÇÕES PRINCIPAIS
// ========================================
export {
  generalCache as cache,  // Para compatibilidade com código antigo
  mp3Cache,
  threadsCache
};

/**
 * 🧩 Endpoint Configurações Globais
 * 
 * Este módulo centraliza constantes e expressões utilizadas por endpoints da API.
 * Ideal para: nickgen, username stylers, nickname generators, etc.
 * 
 * 📦 Padrão: ES Module (ESM)
 * 🚀 Última atualização: 2025-11-11
 */

/* -------------------------------------------------------------------------- */
/* [ NICK GEN ]                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Regex usada para detectar se o texto é composto **somente por emojis**.
 * 
 * - Baseada em Unicode moderno (Extended_Pictographic)
 * - Permite validações simples e rápidas
 * @type {RegExp}
 */
import NodeCache from 'node-cache';
import pLimit from 'p-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const onlyEmojisRegex = /^(?:\p{Extended_Pictographic}|\uFE0F|\u200D)+$/u;



/**
 * Comprimento mínimo permitido para o texto do nick.
 * @type {number}
 */
export const MIN_LENGTH = 2;

/**
 * Comprimento máximo permitido para o texto do nick.
 * @type {number}
 */
export const MAX_LENGTH = 32;

/**
 * Lista de palavras proibidas em nicks ou buscas.
 * @type {string[]}
 */
export const forbiddenWords = ['adulto', 'hentai', '18+', 'improprio', 'porn'];

/**
 * URL base do site InfoAnime, utilizado para scraping de animes e mangás.
 * @type {string}
 */
export const INFOANIME_BASE_URL = 'https://www.infoanime.com.br';

// 🧠 Cache de 10 minutos para reduzir scraping repetido
export const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });


// 🔒 Limite de 3 requisições simultâneas
export const limit = pLimit(3);

import CONSTANTS from './【 UTILS 】/constants.js';

export const DEFAULT_CLIENT_ID = CONSTANTS.DEFAULT_CLIENT_ID;

export const CONFIG = {
  API: {
    BASE_URL: 'https://www.tikwm.com/api',
    TIMEOUT: 30000,
    HEADERS: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': 'current_language=pt-BR',
      'User-Agent': 'Mozilla/5.0 ...'
    }
  },
  SEARCH: { MAX_RESULTS: 5, DEFAULT_CURSOR: 0, HD_QUALITY: 1 },
  CACHE: { EXPIRE_TIME: 30 * 60 },
  RETRY: { MAX_ATTEMPTS: 3, DELAY: 1000 },
  CONCURRENCY: 5
};

export const THREADS_URL_REGEX = /^https?:\/\/(www\.)?threads\.(net|com)\/@[a-zA-Z0-9._-]+\/post\/[a-zA-Z0-9_-]+(\?.*)?$/;

const outputDir = path.join(__dirname, 'downloads'); // ← definido ANTES

export const CACHE_EMOJI = path.join(__dirname, './【 EMOJIS 】/');

export const CACHE = path.join(__dirname, './【 CACHE 】/');

export const isInvalid = (result) => {
  return (
    !result ||
    result.postID === 'Código não encontrado' ||
    result.username === 'unknown' ||
    result.fullName === 'Não encontrado' ||
    result.title === 'Conteúdo não disponível' ||
    result.mediaType === 'Sem mídia' ||
    (Array.isArray(result.medias) && result.medias.length === 0)
  );
}


export const maxFrases = limit ? parseInt(limit, 10) : 5; // default limit 5

export const CACHE_DDD = path.join(CACHE, 'cache-estados-completo.json');

export const EMOJI_DIR = path.join('【 EMOJIS 】', 'emoji_info'); // pasta para salvar os mashups

export const PATHS = {
  baseDir: __dirname,
  tempDir: path.join(__dirname, '【 TEMP 】'),
  downloadsDir: path.join(outputDir),
  cookie: __dirname,
  cookiesInsta: path.join(__dirname, 'cookies.txt'),
  cookiesYT: path.join(__dirname, 'cookiesYT.txt'),
  cookieSC: path.join(__dirname, 'cookieSC.txt'), // ← VÍRGULA AQUI
  pagina_inicial: path.join(__dirname, '【 PUBLIC 】', 'index.html'), // ← VÍRGULA AQUI
  docs: path.join(__dirname, '【 PUBLIC 】', 'docs.html'), // ← VÍRGULA AQUI
  arquivos_estaticos: path.join(__dirname, '【 PUBLIC 】') // ← opcional no final
};

export function getEmojiFilename(e1, e2) {
  return `${e1}_${e2}.png`;
}

export function getEmojiFilePath(filename) {
  return path.join(EMOJI_DIR, filename);
}

export const BRONXYS_CONFIG = {
  BASE_URL: 'https://api.bronxyshost.com.br/api-bronxys/tabela_camp',
  API_KEY: 'juniornerd_ISM',
  TIMEOUT: 10000,
};

export const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
};

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const BACKGROUND_URL =
  'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

export const PINTEREST_CONFIG = {
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
    IMAGE_SIZES: { LARGE: '736x' }
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

export const PLAYSTORE_CONFIG = {
  MAX_LIMIT: 50,
  LANG: 'pt-BR',
  COUNTRY: 'br',
  CACHE_PREFIX: 'playstore:q:'
};

export const PODER360_CONFIG = {
  FEED_URL: 'https://www.poder360.com.br/feed',
  TIMEOUT: 8000,
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  LIMITE_NOTICIAS: 3
};

/* -------------------------------------------------------------------------- */
/* [ FUTUROS ENDPOINTS ]                                                      */
/* -------------------------------------------------------------------------- */
/**
 * Aqui podem ser adicionadas futuras constantes globais de endpoints:
 * - Exemplo: expressões para validação de e-mail, URLs, usernames, etc.
 * 
 * Basta exportar novas variáveis:
 * ```js
 * export const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
 * ```
 */
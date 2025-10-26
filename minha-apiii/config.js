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

export const EMOJI_DIR = path.join('【 EMOJIS 】', 'emojis'); // pasta para salvar os mashups

const outputDir = './downloads';

export const PATHS = {
  baseDir: __dirname,
  tempDir: path.join(__dirname, '【 TEMP 】'),
  downloadsDir: path.join(outputDir), // Certifique-se que outputDir está definido
  cookie: __dirname,
  cookiesInsta: path.join(__dirname, 'cookies.txt'),
  cookiesYT: path.join(__dirname, 'cookiesYT.txt'),
  cookieSC: path.join(__dirname, 'cookieSC.txt') // nome válido, sem .js no meio
};

export function getEmojiFilename(e1, e2) {
  return `${e1}_${e2}.png`;
}

export function getEmojiFilePath(filename) {
  return path.join(EMOJI_DIR, filename);
}

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
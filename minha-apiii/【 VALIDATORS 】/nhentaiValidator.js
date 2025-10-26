import { onlyEmojisRegex } from '../config.js';

export function validateQueryParams(query, page, max, pages) {
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    throw new Error('Parâmetro "query" inválido. Deve ter ao menos 2 caracteres.');
  }

  if (onlyEmojisRegex.test(query.trim())) {
    throw new Error('Parâmetro "query" não pode conter apenas emojis.');
  }

  const pageNum = parseInt(page);
  const maxNum = parseInt(max);
  const pagesNum = parseInt(pages);

  if (isNaN(pageNum) || pageNum < 1) throw new Error('Parâmetro "page" inválido.');
  if (isNaN(maxNum) || maxNum < 1 || maxNum > 50) throw new Error('Parâmetro "limit" inválido. Máx: 50');
  if (isNaN(pagesNum) || pagesNum < 1 || pagesNum > 5) throw new Error('Parâmetro "pages" inválido. Máx: 5');

  return { page: pageNum, max: maxNum, pages: pagesNum };
}
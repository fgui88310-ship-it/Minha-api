import { onlyEmojisRegex, MIN_LENGTH, forbiddenWords } from '../config.js';

export function validateQuery(query) {
  if (!query) return { error: 'Parâmetro "query" é obrigatório', status: 400 };
  if (query.length < MIN_LENGTH) return { error: `Query deve ter pelo menos ${MIN_LENGTH} caracteres`, status: 400 };
  if (onlyEmojisRegex.test(query)) return { error: 'Query não pode ser apenas emojis', status: 400 };
  if (!/^[a-zA-Z0-9\s]+$/.test(query)) return { error: 'Query deve conter apenas letras, números e espaços', status: 400 };
  if (forbiddenWords.some(word => query.toLowerCase().includes(word))) return { error: 'Query contém palavras proibidas', status: 400 };
  return { valid: true };
}
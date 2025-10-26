// validators/nickgen.js
/**
 * Valida os parâmetros de entrada obrigatórios
 * @param {object} query - objeto com os query params
 * @param {string[]} requiredFields - lista de campos obrigatórios
 * @returns {string|null} Mensagem de erro ou null se estiver válido
 */
export function validateRequiredFields(query, requiredFields) {
  const missing = requiredFields.filter(f => !(f in query) || String(query[f]).trim() === '');
  if (missing.length === 0) return null;

  if (missing.length === 1) {
    return `Campo obrigatório ausente ou vazio: '${missing[0]}'. Utilize ?${missing[0]}=seuTexto`;
  }
  return `Campos obrigatórios ausentes ou vazios: ${missing.map(m => `'${m}'`).join(', ')}.`;
}

/**
 * Valida o texto para emojis e tamanho
 * @param {string} text - Texto a ser validado
 * @param {RegExp} onlyEmojisRegex - regex para detectar apenas emojis
 * @param {number} minLength - tamanho mínimo permitido
 * @param {number} maxLength - tamanho máximo permitido
 * @returns {string|null} Mensagem de erro ou null se estiver válido
 */
export function validateText(text, onlyEmojisRegex, minLength, maxLength) {
  const trimmed = text.trim();

  if (onlyEmojisRegex.test(trimmed)) {
    return "O texto não pode ser composto apenas por emojis.";
  }

  if (trimmed.length < minLength) {
    return `O texto deve conter pelo menos ${minLength} caracteres.`;
  }

  if (trimmed.length > maxLength) {
    return `O texto não pode ultrapassar ${maxLength} caracteres.`;
  }

  return null;
}

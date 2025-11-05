export function limparTexto(texto) {
  return texto?.replace(/\s+/g, ' ').trim() || '';
}

export function formatarTitulo(titulo, limite = 120) {
  return titulo.length > limite ? titulo.substring(0, limite - 3) + '...' : titulo;
}

export function montarUrlIgn(url) {
  if (!url.startsWith('http')) return `https://br.ign.com${url}`;
  return url;
}

import axios from 'axios';

export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// 🔸 Faz uma requisição com cabeçalhos padrão
export async function fetchHTML(url) {
  const { data } = await axios.get(url, {
    headers: { 'User-Agent': USER_AGENT },
    timeout: 10000,
  });
  return data;
}

// 🔸 Resolve URLs com redirecionamentos (ex: shortlinks da Globo)
export async function resolverUrlRedirecionada(url) {
  try {
    if (url.startsWith('//')) url = 'https:' + url;
    const response = await axios.get(url, { maxRedirects: 5 });
    return response.request.res.responseUrl || url;
  } catch (err) {
    console.error('[HTTP UTILS][REDIRECT]', err.message);
    return url;
  }
}
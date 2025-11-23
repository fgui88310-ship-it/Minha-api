import * as cheerio from 'cheerio';

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
  
import * as cheerio from 'cheerio';

/**
 * Remove scripts, estilos e retorna apenas texto limpo.
 */
export function limparHTML(html) {
  if (!html) return '';
  const $ = cheerio.load(html);
  $('script, style, noscript, iframe, svg').remove();
  return $.text().trim();
}

export function limparHTML(html) {
  if (!html) return '';
  const $ = cheerio.load(html);
  $('script, style, noscript, iframe, svg').remove();
  return $.text().trim();
}
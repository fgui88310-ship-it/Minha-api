// scraper-ign.js
import axios from 'axios';
import * as cheerio from 'cheerio';

export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';

/**
 * Remove quebras de linha e espaços extras
 */
export function limparTexto(texto) {
  if (!texto) return '';
  return texto.replace(/\s+/g, ' ').trim();
}

/**
 * Limita o título e coloca "..." se for muito grande
 */
export function formatarTitulo(titulo, limite = 120) {
  if (!titulo) return '';
  return titulo.length > limite ? titulo.substring(0, limite - 3) + '...' : titulo;
}

/**
 * Completa URLs do IGN Brasil (relativas ou absolutas)
 */
export const montarUrlIgn = (url) => {
  if (!url) return '';

  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('/')) return 'https://br.ign.com' + url;

  return 'https://br.ign.com/' + url;
};

/**
 * Remove scripts, estilos e retorna só o texto limpo da página
 */
export function limparHTML(html) {
  if (!html) return '';

  const $ = cheerio.load(html);
  $('script, style, noscript, iframe, svg, path, symbol, defs, header, footer, nav').remove();

  const texto = $('body')
    .text()
    .replace(/Aceitar todos os cookies|Rejeitar todos os cookies|Gerenciar cookies/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return texto;
}
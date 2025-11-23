// scraper-ign.ts (ou .js)
import axios from 'axios';
import * as cheerio from 'cheerio';   // ← ÚNICO import do cheerio

export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Remove quebra de linhas excessivas e espaços em branco
 */
export function limparTexto(texto: string | undefined): string {
  return texto?.replace(/\s+/g, ' ').trim() || '';
}

/**
 * Limita o tamanho do título e adiciona "..." se necessário
 */
export function formatarTitulo(titulo: string, limite = 120): string {
  return titulo.length > limite ? titulo.substring(0, limite - 3) + '...' : titulo;
}

/**
 * Completa URLs relativas do IGN Brasil
 */
export function montarUrlIgn(url: string): string {
  if (!url) return url;
  
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('/')) return 'https://br.ign.com' + url;
  
  return 'https://br.ign.com/' + url;
}

/**
 * Remove scripts, styles e retorna apenas o texto limpo do HTML
 */
export function limparHTML(html: string): string {
  if (!html) return '';
  const $ = cheerio.load(html);
  $('script, style, noscript, iframe, svg, path, symbol, defs').remove();
  return $('body').text().trim(); // pegar só o body deixa ainda mais limpo
}
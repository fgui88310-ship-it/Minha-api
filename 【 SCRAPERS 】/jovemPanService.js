import axios from 'axios';
import * as cheerio from 'cheerio';
import { limparHTML } from '../【 UTILS 】/htmlUtils.js';

/**
 * Faz scraping do site da Jovem Pan para capturar as últimas notícias.
 */
export async function buscarNoticiasJovemPan(limit = 3) {
  try {
    const { data } = await axios.get('https://www.jovempan.com.br/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const noticias = [];

    $('.news-small').slice(0, limit).each((_, el) => {
      const titulo = $(el).find('.title').text().trim() || 'Sem título';
      const link = $(el).closest('a').attr('href') || '';
      const imagem = $(el).find('img').attr('src') || '';
      const categoria = $(el).find('.category').text().trim() || 'Sem categoria';
      const descricao = limparHTML($(el).find('.descricao, p').html() || '');

      if (link) noticias.push({ titulo, link, imagem, categoria, descricao });
    });

    return noticias;
  } catch (err) {
    console.error('[JOVEMPAN SCRAPER]', err.message);
    return [];
  }
}
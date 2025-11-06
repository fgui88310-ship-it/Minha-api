import Parser from 'rss-parser';
import { limparHTML } from '../utils/htmlUtils.js';

const rssParser = new Parser();

/**
 * Lê o feed RSS do Poder360 e extrai as últimas notícias.
 */
export async function buscarNoticiasPoder360(limit = 3) {
  try {
    const feed = await rssParser.parseURL('https://www.poder360.com.br/feed/');
    const noticias = feed.items.slice(0, limit).map((item) => ({
      titulo: item.title || 'Sem título',
      link: item.link || '',
      imagem: item.enclosure?.url || '',
      categoria: item.categories?.[0] || 'Sem categoria',
      descricao: limparHTML(item['content:encoded'] || item.description || ''),
      pubDate: item.pubDate || '',
    }));
    return noticias;
  } catch (err) {
    console.error('[PODER360 RSS]', err.message);
    return [];
  }
}
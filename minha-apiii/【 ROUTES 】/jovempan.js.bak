import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';

const router = express.Router();
const rssParser = new Parser();

// Limpa HTML de scripts, tags etc.
function limparHTML(html) {
  if (!html) return '';
  const $ = cheerio.load(html);
  $('script, style, noscript, iframe, svg').remove();
  return $.text().trim();
}

// Busca notícias recentes da Jovem Pan
async function buscarNoticiasJovemPan() {
  try {
    const url = 'https://www.jovempan.com.br/';
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 10000, // Timeout de 10 segundos
    });

    const $ = cheerio.load(data);
    const noticias = [];

    // Seleciona os primeiros 3 containers de notícia com a classe .news-small
    $('.news-small').slice(0, 3).each((_, el) => {
      const titulo = $(el).find('.title').text().trim() || 'Sem título';
      const link = $(el).closest('a').attr('href') || '';
      const imagem = $(el).find('img').attr('src') || '';
      const categoria = $(el).find('.category').text().trim() || 'Sem categoria';
      const descricao = limparHTML($(el).find('.descricao, p').html() || '');

      if (link) {
        noticias.push({ titulo, link, imagem, categoria, descricao });
      }
    });

    return noticias;
  } catch (err) {
    console.error('[JOVEMPAN SCRAPER]', err.message);
    return [];
  }
}

// Busca notícias do feed RSS do Poder360
async function buscarNoticiasPoder360() {
  try {
    const url = 'https://www.poder360.com.br/feed/';
    const feed = await rssParser.parseURL(url);

    const noticias = feed.items.slice(0, 3).map((item) => ({
      titulo: item.title || 'Sem título',
      link: item.link || '',
      imagem: item.enclosure?.url || '', // Imagem, se disponível no enclosure
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

// Endpoint para Jovem Pan
router.get('/', async (req, res, next) => {
  try { 
  const noticias = await buscarNoticiasJovemPan();

  if (!noticias.length) {
    return res.status(404).json({ error: 'Nenhuma notícia encontrada' });
  }

  let msg = `📰 *Notícias recentes da Jovem Pan*\n\n`;
  noticias.forEach((n, i) => {
    msg += `*${i + 1}. ${n.titulo}*\n`;
    msg += `📌 *Categoria*: ${n.categoria}\n`;
    if (n.imagem) msg += `🖼️ *Imagem*: ${n.imagem}\n`;
    if (n.descricao) msg += `📝 ${n.descricao}\n`;
    msg += `🔗 [Leia Mais](${n.link})\n\n`;
  });

  res.json({
    total: noticias.length,
    noticias,
    mensagem_formatada: msg
  });
  } catch (err) {
  next(err);
  }
});

export default router;
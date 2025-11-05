import * as cheerio from 'cheerio';
import { fetchHTML, resolverUrlRedirecionada } from '../【 UTILS 】/httpUtils.js';

// 🔹 Busca o conteúdo completo de uma notícia (título + descrição)
export async function buscarNoticiaCompleta(url) {
  try {
    const urlFinal = await resolverUrlRedirecionada(url);
    const html = await fetchHTML(urlFinal);
    const $ = cheerio.load(html);

    const titulo =
      $('h1.content-head__title').first().text().trim() ||
      $('h1').first().text().trim() ||
      $('.title').first().text().trim();

    const seletores = [
      '.content-text__container p',
      '.article-body p',
      '.content-text p',
      '.mc-article-body p',
      '.entry-content p',
      '.post-content p',
      'article p',
    ];

    let descricao = '';

    for (const seletor of seletores) {
      const paragrafos = $(seletor)
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(texto => texto.length > 10);

      if (paragrafos.length > 0) {
        descricao = paragrafos.slice(0, 3).join('\n');
        break;
      }
    }

    if (!descricao) {
      const fallback =
        $('.content-head__subtitle').first().text().trim() ||
        $('meta[name="description"]').attr('content');
      descricao = fallback || '';
    }

    if (!descricao) console.warn(`[GLOBO SCRAPER] Sem descrição em: ${urlFinal}`);

    return { titulo, descricao, link: urlFinal };
  } catch (err) {
    console.error('[GLOBO SCRAPER][NOTÍCIA COMPLETA]', err.message);
    return null;
  }
}

// 🔹 Busca as notícias recentes da home do G1
export async function buscarNoticiasGlobo(limit = 5) {
  try {
    const html = await fetchHTML('https://g1.globo.com/');
    const $ = cheerio.load(html);

    const links = $('.feed-post-body a')
      .map((_, el) => $(el).attr('href'))
      .get()
      .filter(href => href && href.includes('g1.globo.com'));

    if (!links.length) {
      console.warn('[GLOBO SCRAPER] Nenhum link encontrado');
      return [];
    }

    const linksUnicos = [...new Set(links)].slice(0, limit);
    const noticias = (await Promise.all(linksUnicos.map(buscarNoticiaCompleta))).filter(Boolean);
    return noticias;
  } catch (err) {
    console.error('[GLOBO SCRAPER][HOME]', err.message);
    return [];
  }
}
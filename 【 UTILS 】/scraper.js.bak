import axios from 'axios';
import * as cheerio from 'cheerio';
import { isValidUrl } from './urlUtils.js';

export async function pegarDescricao(url) {
  try {
    if (!isValidUrl(url)) return 'Descrição não disponível';

    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:91.0) Gecko/91.0 Firefox/91.0' },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    let descricao = $('meta[property="og:description"]').attr('content') ||
                    $('meta[name="twitter:description"]').attr('content') ||
                    $('meta[name="description"]').attr('content');

    if (!descricao) {
      const paragrafos = $('article p, .content p, .article-body p')
        .map((i, el) => $(el).text().trim())
        .get()
        .filter(text => text.length > 0);
      descricao = paragrafos.slice(0, 3).join('\n');
    }

    if ($('[data-paywall-wrapper="true"]').length > 0 || $('.paywall').length > 0)
      return 'Conteúdo bloqueado por paywall';

    return descricao || 'Descrição não disponível';
  } catch {
    return 'Descrição não disponível';
  }
}

export async function scrapingNoticiasPrincipal() {
  try {
    const { data } = await axios.get('https://www.estadao.com.br/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Android 10; Mobile)' },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const noticias = [];

    $('h2.headline b, .headline b').each((i, el) => {
      if (noticias.length >= 3) return;
      const titulo = $(el).text().trim();
      const link = $(el).closest('a').attr('href');
      if (titulo && link) {
        noticias.push({
          titulo,
          descricao: 'Descrição não disponível (veja no link)',
          link: link.startsWith('http') ? link : `https://www.estadao.com.br${link}`,
          pubDate: null,
        });
      }
    });

    return noticias;
  } catch {
    return [];
  }
}
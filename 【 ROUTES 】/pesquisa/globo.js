// api/endpoints/globo.js
import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

// Função para resolver URLs de redirecionamento
async function resolverUrlRedirecionada(url) {
  try {
    if (url.startsWith('//')) url = 'https:' + url;
    const response = await axios.get(url, { maxRedirects: 5 });
    return response.request.res.responseUrl || url; // Retorna a URL final após redirecionamentos
  } catch (err) {
    console.error('[GLOBO REDIRECT]', err.message);
    return url; // Retorna a URL original em caso de erro
  }
}

// Busca uma notícia completa pelo link
async function buscarNoticiaCompleta(url) {
  try {
    // Resolve URLs redirecionadas
    const urlFinal = await resolverUrlRedirecionada(url);
    const { data } = await axios.get(urlFinal);
    const $ = cheerio.load(data);

    // Extrai o título
    const titulo = $('h1.content-head__title').first().text().trim() || 
                   $('h1').first().text().trim() ||
                   $('.title').first().text().trim(); // Adiciona fallback para outras classes de título

    // Tenta diferentes seletores para a descrição
    let descricao = '';
    const seletores = [
      '.content-text__container p', // Estrutura comum
      '.article-body p', // Alternativa
      '.content-text p', // Outra variação
      '.mc-article-body p', // Artigos mais antigos
      '.entry-content p', // Estrutura alternativa
      '.post-content p', // Outra variação comum
      'article p', // Fallback genérico
    ];

    for (const seletor of seletores) {
      const paragrafos = $(seletor)
        .map((i, el) => $(el).text().trim())
        .get()
        .filter(texto => texto && texto.length > 10); // Filtra textos muito curtos ou vazios

      if (paragrafos.length > 0) {
        // Limita a 3 parágrafos para evitar descrições muito longas
        descricao = paragrafos.slice(0, 3).join('\n');
        break;
      }
    }

    // Fallback adicional: tenta pegar o subtítulo ou descrição meta
    if (!descricao) {
      const subtitulo = $('.content-head__subtitle').first().text().trim() ||
                       $('meta[name="description"]').attr('content')?.trim();
      if (subtitulo) {
        descricao = subtitulo;
      }
    }

    // Log para depuração se a descrição ainda estiver vazia
    if (!descricao) {
      console.warn(`[GLOBO FULL] Nenhuma descrição encontrada para a URL: ${urlFinal}`);
    }

    return { titulo, descricao, link: urlFinal };
  } catch (err) {
    console.error('[GLOBO FULL]', err.message);
    return null;
  }
}

// Busca notícias na busca do G1 ou página principal
// Busca notícias recentes do G1 (ignora qualquer query)
async function buscarNoticiasGlobo() {
  try {
    const url = 'https://g1.globo.com/'; // Sempre pega a home

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Pega links das notícias recentes da home
    let links = $('.feed-post-body a')
      .map((i, el) => $(el).attr('href'))
      .get()
      .filter(href => href && href.includes('g1.globo.com')); // Só links válidos

    if (!links.length) {
      console.warn('[GLOBO SCRAPER] Nenhum link de notícia encontrado');
      return null;
    }

    // Resolve URLs redirecionadas e remove duplicatas
    const linksResolvidos = await Promise.all(links.map(resolverUrlRedirecionada));
    const linksLimitados = [...new Set(linksResolvidos)].slice(0, 3); // Limita a 3 links únicos

    // Busca todas notícias completas em paralelo
    const noticias = (await Promise.all(linksLimitados.map(buscarNoticiaCompleta))).filter(Boolean);

    return noticias;
  } catch (err) {
    console.error('[GLOBO SCRAPER]', err.message);
    return null;
  }
}
// Endpoint
router.get('/', async (req, res, next) => {
  try {
  const noticias = await buscarNoticiasGlobo(); // Sem query
  if (!noticias || noticias.length === 0) {
    return res.status(404).json({ error: 'Nenhuma notícia encontrada' });
  }

  // Formata mensagem
  let msg = `📰 *Notícias recentes da Globo*\n\n`;
  noticias.forEach((n, i) => {
    msg += `*${i + 1}. ${n.titulo}*\n`;
    if (n.descricao) msg += `📝 ${n.descricao}\n`;
    msg += `🔗 [Leia Mais](${n.link})\n\n`;
  });

  res.json({
    total: noticias.length,
    noticias,
    mensagem_formatada: msg,
  });
  } catch (err) {
  next(err);
  }
});
export default router;
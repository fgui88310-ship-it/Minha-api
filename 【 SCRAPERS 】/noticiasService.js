import axios from 'axios';

const NEWS_API_KEY = '9dc1dde158804756ae9b33dd8d71f7a1';

/**
 * Busca notícias usando NewsAPI
 * @param {string} query - Termo de pesquisa
 * @param {number} limit - Quantidade de notícias
 * @returns {Array} Lista de notícias formatadas
 */
export async function buscarNoticias(query, limit = 1) {
  const searchUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=pt&apiKey=${NEWS_API_KEY}`;

  const { data } = await axios.get(searchUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 10000,
  });

  if (!data.articles || data.articles.length === 0) return [];

  const articlesToPick = Math.min(limit, data.articles.length);
  let noticias = [];

  if (limit === 1) {
    const randomIndex = Math.floor(Math.random() * data.articles.length);
    noticias.push(data.articles[randomIndex]);
  } else {
    noticias.push(...data.articles.slice(0, articlesToPick));
  }

  return noticias.map(noticia => ({
    titulo: noticia.title,
    autor: noticia.author || 'Não informado',
    fonte: noticia.source.name,
    descricao: noticia.description || 'Sem descrição disponível',
    dataPublicacao: noticia.publishedAt.split('T').join(' - ').split('Z')[0],
    url: noticia.url,
    imagem: noticia.urlToImage || null,
  }));
}
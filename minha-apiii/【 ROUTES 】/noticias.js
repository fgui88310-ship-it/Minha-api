// api/endpoints/noticias.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { query, limit = 1 } = req.query;
  
  // Validação
  if (!query) {
    return res.status(400).json({ 
      error: 'Informe um tema para realizar a pesquisa de suas notícias! Passe ?query= para buscar' 
    });
  }

  try {
    const newsApiKey = '9dc1dde158804756ae9b33dd8d71f7a1';
    const searchUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=pt&apiKey=${newsApiKey}`;
    
    const { data: theNews } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      timeout: 10000,
    });

    // Verifica se há artigos
    if (!theNews.articles || theNews.articles.length === 0) {
      return res.status(404).json({ 
        error: 'Nenhuma notícia encontrada para este tema' 
      });
    }

    // Pega uma notícia aleatória (limit=1 por padrão, ou todas se limit > 1)
    const noticias = [];
    const articlesToPick = limit > theNews.articles.length ? theNews.articles.length : limit;
    
    // Se limit=1, pega uma aleatória
    if (limit === 1) {
      const randomIndex = Math.floor(Math.random() * theNews.articles.length);
      noticias.push(theNews.articles[randomIndex]);
    } else {
      // Se limit > 1, pega as mais recentes (já ordenadas por publishedAt)
      noticias.push(...theNews.articles.slice(0, articlesToPick));
    }

    // Formata as notícias
    const noticiasFormatadas = noticias.map(noticia => ({
      titulo: noticia.title,
      autor: noticia.author || 'Não informado',
      fonte: noticia.source.name,
      descricao: noticia.description || 'Sem descrição disponível',
      dataPublicacao: noticia.publishedAt.split('T').join(' - ').split('Z')[0],
      url: noticia.url,
      imagem: noticia.urlToImage || null
    }));

    res.json({
      totalEncontrados: theNews.totalResults,
      noticias: noticiasFormatadas
    });

  } catch (error) {
    next(err);
  }
});

export default router;
// api/endpoints/wikipedia.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { query, limit = 1 } = req.query;
  if (!query) return res.status(400).json({ error: 'Passe ?query= para buscar na Wikipedia' });

  try {
    // 1️⃣ Busca as páginas
    const searchResponse = await axios.get('https://pt.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: query,
        srlimit: limit,
      },
      timeout: 5000,
    });

    const searchResults = searchResponse.data.query.search;
    if (!searchResults || searchResults.length === 0) {
      return res.status(404).json({ error: 'Nenhum resultado encontrado' });
    }

    // 2️⃣ Pega resumo + imagem de cada página
    const resultados = await Promise.all(searchResults.map(async (item) => {
      const pageId = item.pageid;

      const pageResponse = await axios.get('https://pt.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          format: 'json',
          pageids: pageId,
          prop: 'extracts|pageimages',
          exintro: true,
          explaintext: true,
          redirects: 1,
          piprop: 'original', // pega a imagem principal
        },
        timeout: 5000,
      });

      const page = pageResponse.data.query.pages[pageId];

      return {
        titulo: page.title,
        resumo: page.extract,
        link: `https://pt.wikipedia.org/?curid=${pageId}`,
        imagem: page.original ? page.original.source : null, // null se não tiver imagem
      };
    }));

    res.json(resultados);
  } catch (err) {
    next(err);
  }
});

export default router;
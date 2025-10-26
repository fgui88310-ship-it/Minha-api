// api/endpoints/amazon.js
import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { query, limit = 5 } = req.query;
  if (!query) return res.status(400).json({ error: 'Passe ?query= para buscar produtos' });

  try {
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      timeout: 5000,
    });

    const $ = cheerio.load(data);
    const produtos = [];

    $('div.s-result-item.s-asin, div.puis-card-container').each((i, el) => {
      if (produtos.length >= limit) return false; // Limita a quantidade

      const title = $(el).find('h2 span').text().trim();
      let price = $(el).find('span.a-price:not(.a-text-price) > span.a-offscreen').first().text().trim();
      if (!price) {
        price = $(el).find('div[data-cy="secondary-offer-recipe"] span.a-color-base').first().text().trim() || 'Preço não disponível';
      }
      const link = $(el).find('a.a-link-normal.s-no-outline').attr('href');
      const image = $(el).find('img.s-image').attr('src');

      // Validação básica
      if (title && link && image) {
        const shortLink = link.match(/\/dp\/[A-Z0-9]{10}/)
          ? `https://www.amazon.com${link.match(/\/dp\/[A-Z0-9]{10}/)[0]}`
          : `https://www.amazon.com${link}`;
        produtos.push({
          titulo: title.length > 100 ? title.substring(0, 97) + '...' : title,
          valor: price,
          link: shortLink,
          imagem: image,
        });
      }
    });

    if (produtos.length === 0) return res.status(404).json({ error: 'Nenhum produto encontrado' });

    res.json(produtos);
  } catch (err) {
    next(err);
  }
});

export default router;
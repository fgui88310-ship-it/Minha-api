// api/endpoints/mercadolivre.js
import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { query, limit = 8 } = req.query;
  if (!query) return res.status(400).json({ error: 'Passe ?query= para buscar produtos' });

  try {
    const searchTerm = encodeURIComponent(query.replace(/\s+/g, '-').toLowerCase());
    const url = `https://lista.mercadolivre.com.br/${searchTerm}`;

    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(html);
    const produtos = [];

    // --- PRIMEIRA TENTATIVA: JSON embutido ---
    const jsonScripts = $('script[type="application/ld+json"]');
    jsonScripts.each((_, el) => {
      if (produtos.length >= limit) return false;
      try {
        const jsonData = JSON.parse($(el).html());
        const list = Array.isArray(jsonData['@graph']) ? jsonData['@graph'] : [jsonData];
        list.forEach(item => {
          if (item['@type'] === 'Product' && produtos.length < limit) {
            const nome = item.name || 'Nome não disponível';
            const link = item.offers?.url || '';
            const preco = item.offers?.price
              ? `R$${parseFloat(item.offers.price).toFixed(2).replace('.', ',')}`
              : 'Preço não disponível';
            const avaliacao = item.aggregateRating?.ratingValue
              ? `${item.aggregateRating.ratingValue} (${item.aggregateRating.ratingCount} avaliações)`
              : 'Sem avaliações';
            const imagem = item.image || '';

            if (nome && link) {
              produtos.push({ nome, preco, avaliacao, link, imagem });
            }
          }
        });
      } catch (err) {
        // Ignora erros de parsing
      }
    });

    // --- SEGUNDA TENTATIVA: Scraping direto do HTML ---
    if (produtos.length < limit) {
      $('li.ui-search-layout__item, div.ui-search-result__wrapper').each((_, el) => {
        if (produtos.length >= limit) return false;

        const nome = $(el).find('h2.ui-search-item__title').text().trim();
        const link = $(el).find('a.ui-search-link').attr('href');
        const preco = $(el).find('span.andes-money-amount__fraction').first().text().trim();
        const imagem = $(el).find('img.ui-search-result-image__element').attr('src') ||
                       $(el).find('img.ui-search-result-image__element').attr('data-src');
        const avaliacao = $(el).find('span.ui-search-reviews__rating-number').text().trim();

        if (nome && link) {
          produtos.push({
            nome,
            preco: preco ? `R$${preco.replace('.', ',')}` : 'Preço não disponível',
            imagem: imagem || '',
            link,
            avaliacao: avaliacao ? `${avaliacao} ⭐` : 'Sem avaliações',
          });
        }
      });
    }

    if (produtos.length === 0) {
      return res.status(404).json({ error: 'Nenhum produto encontrado.' });
    }

    res.json(produtos.slice(0, limit));
  } catch (err) {
    next(err);
  }
});

export default router;
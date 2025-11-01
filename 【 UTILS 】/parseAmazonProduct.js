import * as cheerio from 'cheerio';

export function parseAmazonProducts(html, limit = 5) {
  const $ = cheerio.load(html);
  const produtos = [];

  $('div.s-result-item.s-asin, div.puis-card-container').each((i, el) => {
    if (produtos.length >= limit) return false;

    const title = $(el).find('h2 span').text().trim();
    let price = $(el).find('span.a-price:not(.a-text-price) > span.a-offscreen').first().text().trim();
    if (!price) {
      price = $(el).find('div[data-cy="secondary-offer-recipe"] span.a-color-base').first().text().trim() || 'Preço não disponível';
    }
    const link = $(el).find('a.a-link-normal.s-no-outline').attr('href');
    const image = $(el).find('img.s-image').attr('src');

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

  return produtos;
}
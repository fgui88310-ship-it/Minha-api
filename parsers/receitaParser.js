import * as cheerio from 'cheerio';

function normalizeImage(url) {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  if (!url.startsWith('http')) return `https://cybercook.com.br${url}`;
  return url;
}

export function parseReceitas(html) {
  const $ = cheerio.load(html);
  const results = [];
  const seen = new Set();

  $('div.pos-relative.border-card-half-2.card--half-2-image').each((i, el) => {
    if (i >= 10) return;

    const title = $(el).find('h3.title.txt-bold.font-arial a').text().trim();
    const url = $(el).find('a[href*="/receitas"]').attr('href');
    const fullUrl = url?.startsWith('http') ? url : url ? `https://cybercook.com.br${url}` : '';

    if (!title || !fullUrl || seen.has(fullUrl)) return;

    const assessmentRaw = $(el).find('p.score-yellow-box-item').text().trim() || 'Sem avaliação';
    const starEmoji = assessmentRaw !== 'Sem avaliação'
      ? '⭐'.repeat(Math.round(parseFloat(assessmentRaw) || 0))
      : '';

    const commentsMatch = $(el).find('div.ml10').text().match(/\((\d+)\)/);
    const comments = commentsMatch ? commentsMatch[1] : '0';

    const image = normalizeImage($(el).find('img[src]').attr('src'));

    results.push({
      title,
      url: fullUrl,
      assessment: {
        star: assessmentRaw,
        starEmoji,
        comments
      },
      by: $(el).find('p.grey--dark.author.font-arial').text().trim() || 'Anônimo',
      image
    });

    seen.add(fullUrl);
  });

  return results;
}
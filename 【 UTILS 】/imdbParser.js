import * as cheerio from 'cheerio';

/**
 * Limpa texto e remove espaços extras.
 */
function cleanText(text) {
  return text ? text.replace(/\s+/g, ' ').trim() : 'N/A';
}

/**
 * Extrai detalhes do HTML da página IMDb.
 */
export function extrairDetalhes(html, url) {
  const $ = cheerio.load(html);

  const titulo = cleanText($('h1[data-testid="hero__pageTitle"] span').text());
  const tituloOriginal = cleanText($('div.sc-cb6a22b2-1').text().replace('Título original: ', ''));
  const sinopse = cleanText($('span[data-testid="plot-xl"]').text());
  const anoLancamento = $('ul.sc-cb6a22b2-2 li:first-child a').text().trim() || 'N/A';
  const classificacao = $('ul.sc-cb6a22b2-2 li:nth-child(2) a').text().trim() || 'Livre';
  const duracao = $('ul.sc-cb6a22b2-2 li:last-child').text().trim() || 'N/A';
  const avaliacao = $('span[data-testid="hero-rating-bar__aggregate-rating__score"] span:first-child').text().trim() || 'N/A';
  const totalVotos = $('div.sc-4dc495c1-3').text().trim() || 'N/A';
  const generos = $('div[data-testid="interests"] a.ipc-chip__text').map((_, el) => cleanText($(el).text())).get();

  const poster = $('div[data-testid="hero-media__poster"] img.ipc-image').attr('src') || null;

  // Créditos principais
  const direcao = $('li[data-testid="title-pc-principal-credit"]:first-child ul li a')
    .map((_, el) => cleanText($(el).text())).get();

  const roteiristas = $('li[data-testid="title-pc-principal-credit"]:nth-child(2) ul li a')
    .map((_, el) => cleanText($(el).text())).get();

  const elencoPrincipal = $('li[data-testid="title-pc-principal-credit"]:nth-child(3) ul li a')
    .map((_, el) => cleanText($(el).text())).get();

  return {
    titulo,
    tituloOriginal,
    sinopse,
    anoLancamento,
    classificacao,
    duracao,
    avaliacao,
    totalVotos,
    generos,
    direcao,
    roteiristas,
    elencoPrincipal,
    poster,
    fonte: url,
  };
}
import * as cheerio from 'cheerio';
import { fetchHTML } from '../【 UTILS 】/fetchHTML.js';

export async function buscarPalavra(palavra) {
  const word = palavra.toLowerCase().replace(/\s+/g, '-');
  const url = `https://www.dicio.com.br/${encodeURIComponent(word)}/`;

  const html = await fetchHTML(url);
  const $ = cheerio.load(html);

  const definicoes = [];
  $('p.significado.textonovo').find('span.cl, span:not(.etim)').each((_, el) => {
    const texto = $(el).text().trim();
    if (texto && !texto.startsWith('Etimologia')) definicoes.push(texto);
  });

  const exemplos = [];
  $('div.wrap-section h3.tit-exemplo:contains("Exemplos com a palavra")')
    .next('div.frases')
    .find('div.frase')
    .each((_, el) => exemplos.push($(el).text().trim().replace(/\s+/g, ' ')));

  const imagem = $('picture img.imagem-palavra').attr('src') || `https://s.dicio.com.br/${word}.jpg`;

  if (definicoes.length === 0 && exemplos.length === 0) {
    return null;
  }

  return { palavra, definicoes, exemplos, imagem };
}
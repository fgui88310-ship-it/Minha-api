import axios from 'axios';
import * as cheerio from 'cheerio';

export async function fetchFrasesPensador(query, maxFrases) {
  const url = `https://www.pensador.com/${encodeURIComponent(query.replace(/s+/g, '_').toLowerCase())}/`;
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'pt-BR,pt' },
  });
  const $ = cheerio.load(response.data);
  const frases = [];
  
  $('p.frase.fr').each((i, el) => {
    if (i < maxFrases) {
      frases.push($(el).text().trim());
    }
  });
  return frases;
}
import axios from 'axios';
import * as cheerio from 'cheerio';
import { parseFilmes } from '../【 UTILS 】/parseFilmes.js';

const CINEMA_URL = 'https://www.adorocinema.com/filmes/agenda/';

/**
 * Busca filmes em cartaz e faz o parse dos dados
 * @returns {Promise<Array>} lista de filmes
 */
export async function getFilmesEmCartaz() {
  const { data } = await axios.get(CINEMA_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    timeout: 5000,
  });

  const $ = cheerio.load(data);
  return parseFilmes($);
}
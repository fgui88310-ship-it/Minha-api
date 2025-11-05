import axios from 'axios';
import * as cheerio from 'cheerio';
import { extrairFilmes } from '../【 UTILS 】/parse.js';

const IMDB_URL = 'https://www.imdb.com/find/?';

/**
 * Busca filmes no IMDb e retorna resultados formatados.
 * @param {string} termo - termo de pesquisa
 * @param {number} limite - número máximo de resultados
 */
export async function buscarFilmes(termo, limite = 5) {
  const url = `${IMDB_URL}query=${encodeURIComponent(termo)}&s=tt&ttype=ft`;

  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    },
  });

  return extrairFilmes(data).slice(0, limite);
}
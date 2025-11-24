// src/services/serieService.js  (ou onde estiver o seu serviço)

import { axiosInstance } from '../【 UTILS 】/axiosClient.js';
import SerieModule from '../【 MODULES 】/serieModule.js';
import { parseSeries } from '../parsers/serieParser.js';

/**
 * Busca séries a partir de uma query
 * @param {string} query   - Termo de busca
 * @param {number} [limit] - Quantidade máxima de resultados a retornar (opcional)
 * @returns {Promise<Array>} Lista de séries parseadas
 */
async function searchSeries(query, limit) {
  try {
    const url = SerieModule.searchUrl(query);

    // Usando a instância configurada do axios
    const { data } = await axiosInstance.get(url);

    if (!data.results || data.results.length === 0) {
      return [];
    }

    return parseSeries(data.results, limit);
  } catch (err) {
    // Tratamento mais completo (opcional)
    const message = err.response
      ? `Status \( {err.response.status} - \){err.response.statusText}`
      : err.message;

    console.error('[SerieService] erro:', message);
    return [];
  }
}

export default { searchSeries };
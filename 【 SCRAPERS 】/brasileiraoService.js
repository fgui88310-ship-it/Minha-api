// 【 SCRAPERS 】/brasileiraoService.js
import axios from 'axios';
import { BRONXYS_CONFIG } from '../config.js';

export async function fetchTabelaBrasileirao() {
  const url = `${BRONXYS_CONFIG.BASE_URL}?apikey=${BRONXYS_CONFIG.API_KEY}`;
  
  try {
    const { data } = await axios.get(url, {
      timeout: BRONXYS_CONFIG.TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    // Validação do objeto raiz
    if (!data || !data.success || !Array.isArray(data.tabela)) {
      throw new Error('Resposta inválida da API: tabela não encontrada');
    }

    // Retorna apenas o array de times
    return data.tabela;
  } catch (error) {
    if (error.response) {
      throw new Error(`API error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Falha na requisição: ${error.message}`);
  }
}
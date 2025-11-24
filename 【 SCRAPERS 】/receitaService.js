// 【 SERVICES 】/ReceitaService.js

import { axiosInstance as http } from '../【 UTILS 】/axiosClient.js';  // <-- aqui é a mudança principal
import ReceitaModule from '../【 MODULES 】/receitaModule.js';
import { parseReceitas } from '../parsers/receitaParser.js';

async function searchReceitas(q) {
  try {
    const url = ReceitaModule.searchUrl(q);
    
    // Agora você está usando a instância configurada (baseURL, headers, timeout, keepAlive, etc.)
    const { data: html } = await http.get(url);

    const receitas = parseReceitas(html);
    return receitas;

  } catch (err) {
    console.error('[ReceitaService] Erro ao buscar receitas:', err.message);
    
    // Se for erro de resposta da API, pode ser interessante logar mais detalhes
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
    
    return [];
  }
}

export default { searchReceitas };
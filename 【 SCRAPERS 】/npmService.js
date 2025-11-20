import axios from 'axios';

export async function buscarPacotes(query, limit = 5) {
  if (!query) throw new Error('query obrigatório');

  const { data } = await axios.get('https://api.npms.io/v2/search', {
    params: { q: query, size: limit },
    timeout: 5000,
  });

  if (!data.results || data.results.length === 0) {
    return [];
  }

  return data.results.map(item => ({
    nome: item.package.name,
    descricao: item.package.description,
    versao: item.package.version,
    link: item.package.links.npm,
    downloads: item.score.detail.popularity.toFixed(2),
  }));
}
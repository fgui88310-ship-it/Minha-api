export function formatCepData(data) {
  return {
    cep: data.cep,
    logradouro: data.logradouro || 'Não informado',
    complemento: data.complemento || 'Nenhum',
    bairro: data.bairro || 'Não informado',
    cidade: data.localidade || 'Não informado',
    estado: data.uf || 'Não informado',
    ddd: data.ddd || 'Desconhecido',
    ibge: data.ibge || 'Indisponível',
    siafi: data.siafi || 'Indisponível',
  };
}
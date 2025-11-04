export const mapaEstado = {
  'São Paulo': 'SP', 'Rio de Janeiro': 'RJ', 'Minas Gerais': 'MG', 'Bahia': 'BA',
  'Paraná': 'PR', 'Rio Grande do Sul': 'RS', 'Pernambuco': 'PE', 'Ceará': 'CE',
  'Pará': 'PA', 'Santa Catarina': 'SC', 'Goiás': 'GO', 'Maranhão': 'MA',
  'Espírito Santo': 'ES', 'Paraíba': 'PB', 'Amazonas': 'AM', 'Mato Grosso': 'MT',
  'Rio Grande do Norte': 'RN', 'Piauí': 'PI', 'Alagoas': 'AL', 'Distrito Federal': 'DF',
  'Mato Grosso do Sul': 'MS', 'Sergipe': 'SE', 'Rondônia': 'RO', 'Tocantins': 'TO',
  'Acre': 'AC', 'Amapá': 'AP', 'Roraima': 'RR'
};

export function extractAcronymFromCity(state) {
  return mapaEstado[state] || state.substring(0, 2).toUpperCase();
}
export function limparTexto(texto) {
  return texto?.replace(/\s+/g, ' ').trim() || '';
}

export function formatarTitulo(titulo, limite = 120) {
  return titulo.length > limite ? titulo.substring(0, limite - 3) + '...' : titulo;
}

export function montarUrlIgn(url) {
  if (!url.startsWith('http')) return `https://br.ign.com${url}`;
  return url;
}
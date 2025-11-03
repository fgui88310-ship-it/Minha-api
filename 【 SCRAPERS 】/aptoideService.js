import axios from 'axios';

/**
 * Busca um app no Aptoide e retorna informações formatadas.
 */
export async function buscarAppAptoide(query) {
  const url = `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(query)}&trusted=true`;
  const { data } = await axios.get(url, { timeout: 5000 });

  if (!data?.datalist?.list?.length) {
    throw new Error('Nenhum app encontrado.');
  }

  const app = data.datalist.list[0];
  return {
    nome: app.name,
    pacote: app.package,
    versão: app.file.vername,
    tamanhoMB: (app.file.size / 1048576).toFixed(1) + ' MB',
    imagem: app.graphic || app.icon,
    linkOriginal: app.file.path_alt,
  };
}
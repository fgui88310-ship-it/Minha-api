import axios from 'axios';

/**
 * Encurta uma URL usando TinyURL.
 */
export async function gerarLinkCurto(url) {
  const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
  return data;
}
import axios from 'axios';
import { parseHTML } from 'linkedom';

/**
 * Busca informações da música no JSONP da Letras.
 */
async function buscarMetadados(topic) {
  const response = await axios.get(
    `https://solr.sscdn.co/letras/m1/?q=${encodeURIComponent(topic)}&wt=json&callback=LetrasSug`
  );

  const jsonData = response.data.replace('LetrasSug(', '').replace(')\n', '');
  const parsedData = JSON.parse(jsonData);
  const doc = parsedData?.response?.docs?.[0];

  if (!doc?.dns || !doc?.url) return null;

  return {
    url: `https://www.letras.mus.br/${doc.dns}/${doc.url}`,
    artist: doc.dns,
    title: doc.titulo || topic,
  };
}

/**
 * Faz scraping da letra da música.
 */
async function extrairLetra(url) {
  const { data } = await axios.get(url);
  const { document } = parseHTML(data);

  const title = document.querySelector('h1')?.textContent?.trim() || 'Título não disponível';
  const artist = document.querySelector('h2.textStyle-secondary')?.textContent?.trim() || 'Artista não disponível';
  const lyricElements = document.querySelectorAll('.lyric-original > p');

  if (!lyricElements.length) return null;

  const lyricsText = Array.from(lyricElements)
    .map(p => {
      const spans = p.querySelectorAll('span.verse');
      if (spans.length) {
        return Array.from(spans)
          .map(span => span.querySelector('span.romanization')?.textContent || '')
          .filter(line => line)
          .join('\n');
      }
      return p.innerHTML
        .split('<br>')
        .map(line => line.trim())
        .filter(line => line)
        .join('\n');
    })
    .filter(stanza => stanza)
    .join('\n\n');

  return { title, artist, lyrics: lyricsText, url };
}

/**
 * Serviço principal que junta tudo.
 */
export async function buscarLetra(topic) {
  if (!topic) throw new Error('Parâmetro ?topic= é obrigatório.');

  const metadados = await buscarMetadados(topic);
  if (!metadados) throw new Error('Letra não encontrada.');

  const letra = await extrairLetra(metadados.url);
  if (!letra) throw new Error('Letra não disponível.');

  return letra;
}
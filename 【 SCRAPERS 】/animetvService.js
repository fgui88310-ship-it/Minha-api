import axios from 'axios';
import * as cheerio from 'cheerio';

export async function fetchAnimeData(query) {
  const searchUrl = `https://animetv.fun/search?q=${encodeURIComponent(query)}`;
  const { data } = await axios.get(searchUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    timeout: 5000,
  });
  return data;
}

export function parseJsonFromScripts(html, limit) {
  const $ = cheerio.load(html);
  const animes = [];

  const scripts = $('script').toArray();
  for (const el of scripts) {
    let scriptContent = $(el).html();
    if (!scriptContent || !scriptContent.includes('self.__next_f.push')) continue;

    scriptContent = scriptContent.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\n/g, '');
    const match = scriptContent.match(/"data":\s*(\[[^]*?\])(?=\s*[,}\]])/s);

    if (match) {
      let dataStr = match[1];
      try {
        dataStr = dataStr
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
          .replace(/,\s*]/g, ']')
          .replace(/,\s*}/g, '}');

        const dataArray = JSON.parse(dataStr);
        for (const obj of dataArray) {
          if (animes.length >= limit) break;

          const id = obj.id || 'N/A';
          const title = obj.title || 'N/A';
          const image = obj.image || 'N/A';
          const link = id !== 'N/A' ? `https://animetv.fun/anime/${id}` : 'N/A';

          if (title !== 'N/A' && image !== 'N/A') {
            animes.push({
              titulo: title.length > 100 ? title.substring(0, 97) + '...' : title,
              imagem: image,
              link,
              id,
            });
          }
        }
      } catch (e) {
        console.error('Erro ao parsear JSON:', e.message);
      }
    }
  }

  return animes;
}

export function parseHtmlFallback(html, limit) {
  const $ = cheerio.load(html);
  const animes = [];

  $('div.grid > div.group').each((i, el) => {
    if (animes.length >= limit) return false;

    const title = $(el).find('h3').text().trim() || 'N/A';
    const image = $(el).find('img').attr('src') || 'N/A';
    const id = 'N/A';
    const link = 'N/A';

    if (title !== 'N/A' && image !== 'N/A') {
      animes.push({
        titulo: title.length > 100 ? title.substring(0, 97) + '...' : title,
        imagem: image,
        link,
        id,
      });
    }
  });

  return animes;
}
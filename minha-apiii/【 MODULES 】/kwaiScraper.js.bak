import axios from 'axios';
import * as cheerio from 'cheerio';

export async function getKwaiDirectLink(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.kwai.com/'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    // Tenta pegar o JSON embutido primeiro
    let directLink = null;
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const jsonData = JSON.parse($(el).html());
        if (jsonData['@type'] === 'VideoObject') {
          directLink = jsonData.contentUrl || directLink;
        }
      } catch {}
    });

    // Fallback caso não encontre no JSON
    if (!directLink) {
      directLink = $('video source').attr('src') || null;
    }

    return directLink; // só o link direto
  } catch (error) {
    console.error('Erro ao pegar link direto:', error.message);
    return null;
  }
}
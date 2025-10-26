// api/endpoints/animetv.js
import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { query, limit = 5 } = req.query;
  if (!query) return res.status(400).json({ error: 'Passe ?query= para buscar animes' });

  try {
    const searchUrl = `https://animetv.fun/search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      timeout: 5000,
    });

    const $ = cheerio.load(data);
    const animes = [];

    // Try to extract from JSON in scripts first
    const scripts = $('script').toArray();
    for (const el of scripts) {
      let scriptContent = $(el).html();
      if (!scriptContent || !scriptContent.includes('self.__next_f.push')) continue;

      // Normalize script content
      scriptContent = scriptContent.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\n/g, '');
      const match = scriptContent.match(/"data":\s*(\[[^]*?\])(?=\s*[,}\]])/s);
      
      if (match) {
        let dataStr = match[1];
        try {
          // Clean JSON string
          dataStr = dataStr
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
            .replace(/,\s*]/g, ']')
            .replace(/,\s*}/g, '}')
            .replace(/\\n/g, '')
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'");

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
                link: link,
                id: id
              });
            }
          }
        } catch (parseErr) {
          console.error('Erro ao parsear JSON:', parseErr.message);
        }
      }
    }

    // Fallback to DOM scraping if no results from JSON
    if (animes.length === 0) {
      $('div.grid > div.group').each((i, el) => {
        if (animes.length >= limit) return false;

        const title = $(el).find('h3').text().trim() || 'N/A';
        const image = $(el).find('img').attr('src') || 'N/A';
        const id = 'N/A'; // No ID available in DOM
        const link = 'N/A'; // No link available in DOM

        if (title !== 'N/A' && image !== 'N/A') {
          animes.push({
            titulo: title.length > 100 ? title.substring(0, 97) + '...' : title,
            imagem: image,
            link: link,
            id: id
          });
        }
      });
    }

    if (animes.length === 0) {
      return res.status(404).json({ error: 'Nenhum anime encontrado. O conteúdo pode ser dinâmico, tente usar um navegador headless.' });
    }

    res.json(animes);
  } catch (err) {
    console.error('Erro na requisição:', err.message);
    next(err);
  }
});

export default router;
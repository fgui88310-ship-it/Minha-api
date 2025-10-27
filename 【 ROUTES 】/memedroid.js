import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import axiosRetry from 'axios-retry';

const router = express.Router();

router.get('/', async (req, res) => {
  const count = parseInt(req.query.count) || 1;
  if (count < 1 || count > 50) {
    return res.status(400).json({ error: 'O parâmetro count deve estar entre 1 e 50' });
  }

  try {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
      'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
    ];
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    // Configurar retentativas
    axiosRetry(axios, {
      retries: 3,
      retryDelay: (retryCount) => retryCount * 1000,
      retryCondition: (error) => error.response?.status === 403,
    });

    const response = await axios.get('https://pt.memedroid.com/', {
      headers: {
        'User-Agent': randomUserAgent,
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.google.com/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      timeout: 10000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    let memeData = [];
    $('script').each((i, elem) => {
      const scriptContent = $(elem).html();
      if (scriptContent.includes('MMDTrendingGalleryHandler')) {
        const jsonMatch = scriptContent.match(/\[({.*?})\]/s);
        if (jsonMatch && jsonMatch[0]) {
          try {
            memeData = JSON.parse(`[${jsonMatch[0].replace(/'/g, '"')}]`);
          } catch (parseError) {
            console.error('Erro ao parsear JSON dos memes:', parseError.message);
          }
        }
      }
    });

    if (memeData.length === 0) {
      return res.status(404).json({ error: 'Nenhum meme encontrado na página' });
    }

    const shuffledMemes = memeData.sort(() => Math.random() - 0.5);
    const selectedMemes = shuffledMemes.slice(0, count).map((meme) => ({
      title: meme.title || 'Sem título',
      link: meme.url,
    }));

    res.status(200).json({ memes: selectedMemes });
  } catch (err) {
    console.error('[MEMEDROID] Erro ao processar memes:', err.message, err.response?.data);
    res.status(500).json({ error: 'Falha ao processar memes', details: err.message });
  }
});

export default router;
// api/endpoints/pornhub.js
import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

const PornhubModule = {
  firstpage: 1,

  videoUrl: function(query, page = this.firstpage) {
    return `http://www.pornhub.com/video/search?search=${encodeURIComponent(query)}&page=${page}`;
  },

  gifUrl: function(query, page = this.firstpage) {
    return `http://www.pornhub.com/gifs/search?search=${encodeURIComponent(query)}&page=${page}`;
  },

  videoParser: function(html) {
    const $ = cheerio.load(html);
    const videos = $('ul.videos.search-video-thumbs li');

    return videos.map((i, el) => {
      const data = $(el);
      const thumb = data.find('img').attr('data-mediumthumb') || '';
      return {
        titulo: data.find('a').text().trim(),
        link: 'http://pornhub.com' + data.find('a').eq(0).attr('href'),
        duracao: data.find('.duration').text(),
        miniatura: thumb.replace(/\([^)]*\)/g, '')
      };
    }).get();
  },

  gifParser: function(html) {
    const $ = cheerio.load(html);
    const gifs = $('ul.gifs.gifLink li');

    return gifs.map((i, el) => {
      const data = $(el).find('a');
      return {
        titulo: data.find('span').text(),
        link: `http://dl.phncdn.com${data.attr('href')}.gif`,
        webm: data.find('video').attr('data-webm')
      };
    }).get();
  }
};

// Funções de busca
async function getVideos(query, limit = 5, page = 1) {
  try {
    const { data } = await axios.get(PornhubModule.videoUrl(query, page), {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 5000
    });
    return PornhubModule.videoParser(data).slice(0, limit);
  } catch (err) {
    console.error('[Pornhub SCRAPER] Erro ao buscar vídeos:', err.message);
    return [];
  }
}

async function getGifs(query, limit = 5, page = 1) {
  try {
    const { data } = await axios.get(PornhubModule.gifUrl(query, page), {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 5000
    });
    return PornhubModule.gifParser(data).slice(0, limit);
  } catch (err) {
    console.error('[Pornhub SCRAPER] Erro ao buscar GIFs:', err.message);
    return [];
  }
}

// Endpoint principal
router.get('/', async (req, res, next) => {
  try { 
  const { query, limit = 5, tipo = 'video' } = req.query;
  if (!query) return res.status(400).json({ error: 'Passe ?query= para buscar' });

  let resultados = [];
  if (tipo === 'video') resultados = await getVideos(query, limit);
  else if (tipo === 'gif') resultados = await getGifs(query, limit);
  else return res.status(400).json({ error: 'Tipo inválido. Use video ou gif' });

  if (resultados.length === 0) return res.status(404).json({ error: 'Nenhum resultado encontrado' });

  res.json(resultados);
  } catch (err) {
  next(err);
  }
});

export default router;
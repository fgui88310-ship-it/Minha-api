import express from 'express';
import { fetchTikTokPost, searchTikTok } from '../【 SCRAPERS 】/tiktokService.js';

const router = express.Router();

router.get('/search', async (req, res, next) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Passe ?query= com o termo de busca' });

  try {
    const result = await searchTikTok(query);
    if (!result) return res.status(404).json({ error: 'Nenhum vídeo encontrado' });
    res.json(result);
  } catch (err) {
    console.error('[TIKTOK SEARCH] Erro:', err.message);
    next(err);
  }
});

router.get('/fetch', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Passe ?url= com a URL do vídeo' });

  try {
    const videoData = await fetchTikTokPost(url);
    if (!videoData) return res.status(404).json({ error: 'Vídeo não encontrado ou privado' });
    res.json(videoData);
  } catch (err) {
    next(err);
  }
});

export default router;
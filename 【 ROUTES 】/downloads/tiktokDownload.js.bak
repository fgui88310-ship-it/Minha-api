// endpoints/tiktokDownload.js
import express from 'express';
import axios from 'axios';
import { fetchTikTokPost } from '../【 UTILS 】/tikwmApi.js';
const router = express.Router();

// Endpoint para download de vídeo
router.get('/video', async (req, res, next) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Passe ?url= do TikTok');

  try {
    const videoData = await fetchTikTokPost(url);
    

    const videoUrl = videoData.urls[0];
    const startTime = Date.now();

    const stream = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });
    res.setHeader('Content-Disposition', 'attachment; filename=video.mp4');
    res.setHeader('Content-Type', 'video/mp4');

    stream.data.pipe(res);
    stream.data.on('end', () => {
      console.log(`Vídeo enviado em ${(Date.now() - startTime)/1000}s`);
    });
    stream.data.on('error', (err) => {
      console.error('Erro no stream do vídeo:', err.message);
      res.status(500).send('Erro ao enviar vídeo');
    });

  } catch (err) {
    next(err);
  }
});

// Endpoint para download de áudio
router.get('/audio', async (req, res, next) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Passe ?url= do TikTok');

  try {
    const videoData = await fetchTikTokPost(url);

    if (!videoData || !videoData.audio) {
      return res.status(404).send('Áudio não encontrado para este vídeo');
    }

    const audioUrl = videoData.audio;
    const startTime = Date.now();

    const stream = await axios({
      url: audioUrl,
      method: 'GET',
      responseType: 'stream'
    });

    res.setHeader('Content-Disposition', 'attachment; filename=audio.mp3');
    res.setHeader('Content-Type', 'audio/mpeg');

    stream.data.pipe(res);
    stream.data.on('end', () => {
      console.log(`Áudio enviado em ${(Date.now() - startTime)/1000}s`);
    });
    stream.data.on('error', (err) => {
      console.error('Erro no stream do áudio:', err.message);
      res.status(500).send('Erro ao enviar áudio');
    });

  } catch (err) {
    next(err);
  }
});

export default router;

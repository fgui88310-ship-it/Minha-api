// api/endpoints/pinterestMp4.js
import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PATHS } from '../config.js';

const router = express.Router();

const activeDownloads = {};

router.get('/', async (req, res, next) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Passe ?url= do vídeo do Pinterest' });
  }

  if (!url.includes('pinterest.com/pin/')) {
    return res.status(400).json({ error: 'URL deve ser de um pin do Pinterest' });
  }

  const pinIdMatch = url.match(/\/pin\/(\d+)\//);
  const pinId = pinIdMatch ? pinIdMatch[1] : Date.now().toString();

  if (activeDownloads[pinId]) {
    return res.status(409).json({ error: 'Download já em andamento' });
  }

  activeDownloads[pinId] = true;
  
  await fs.promises.mkdir(PATHS.downloadsDir, { recursive: true });

  const finalFile = path.join(PATHS.downloadsDir, `pinterest_${pinId}.mp4`);

  // ✅ LIMPA ARQUIVO ANTIGO
  if (fs.existsSync(finalFile)) {
    await fs.promises.unlink(finalFile).catch(() => {});
  }

  try {
    // 1. Obter cookies (SILENCIOSO)
    const cookieResponse = await axios.get('https://getindevice.com/pinterest-video-downloader/', {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36' }
    });
    
    const cookies = cookieResponse.headers['set-cookie'] || [];
    const cookieString = cookies.join('; ');

    // 2. API request (SILENCIOSO)
    const token = btoa(Date.now());
    const { data: apiData } = await axios.post('https://getindevice.com/wp-json/aio-dl/video-data/', 
      new URLSearchParams({ url, token }), 
      { 
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
          'Cookie': cookieString,
          'Referer': 'https://getindevice.com/pinterest-video-downloader/',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000
      }
    );

    // 3. Extrair URL do vídeo
    const videoUrl = apiData.medias?.find(m => m.videoAvailable || !m.videoAvailable)?.url;
    if (!videoUrl) {
      throw new Error('URL do vídeo não encontrada');
    }

    // ✅ 4. STREAM DIRETO PARA NAVEGADOR (SEM ARQUIVO!)
    const videoResponse = await axios({
      method: 'GET',
      url: videoUrl,
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
      }
    });

    // ✅ ENVIA DIRETO PARA DOWNLOAD NO NAVEGADOR
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="pinterest_video_${pinId}.mp4"`);
    res.setHeader('Content-Length', videoResponse.headers['content-length']);
    res.setHeader('Access-Control-Allow-Origin', '*');

    // PIPE DIRETO - SEM SALVAR ARQUIVO!
    videoResponse.data.pipe(res);

    // Cleanup quando terminar
    videoResponse.data.on('end', () => {
      delete activeDownloads[pinId];
      res.end();
    });

    res.on('close', () => {
      delete activeDownloads[pinId];
    });

  } catch (err) {
    delete activeDownloads[pinId];
    console.error(`[PINTEREST] Erro pin ${pinId}:`, err.message);
    res.status(500).json({ error: 'Falha ao baixar vídeo' });
  }
});

export default router;
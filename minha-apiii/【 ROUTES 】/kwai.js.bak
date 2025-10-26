// endpoints/kwai.js
import express from 'express';
import axios from 'axios';
import { getKwaiDirectLink } from '../【 MODULES 】/kwaiScraper.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Informe a URL do vídeo Kwai.');

  try {
    const directLink = await getKwaiDirectLink(url);
    if (!directLink) return res.status(404).send('Link de download não encontrado.');

    // Configura o response para enviar como arquivo
    res.setHeader('Content-Disposition', 'attachment; filename=video.mp4');
    res.setHeader('Content-Type', 'video/mp4');

    // Marca o início do download
    const startTime = Date.now();

    const videoStream = await axios({
      url: directLink,
      method: 'GET',
      responseType: 'stream'
    });

    // Quando o stream terminar, calcula o tempo
    videoStream.data.pipe(res);
    videoStream.data.on('end', () => {
      const duration = (Date.now() - startTime) / 1000;
      console.log(`Download enviado para o usuário em ${duration.toFixed(2)} segundos.`);
    });

    // Trata erros no stream
    videoStream.data.on('error', (err) => {
      console.error('Erro no stream de vídeo:', err.message);
      res.status(500).send('Erro ao enviar o vídeo.');
    });

  } catch (err) {
    next(err);
  }
});

console.log("router kwai carregado");
export default router;
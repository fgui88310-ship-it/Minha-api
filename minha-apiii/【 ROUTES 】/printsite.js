// routes/printsite.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { url } = req.query;

  // Validação do parâmetro url
  if (!url) {
    return res.status(400).json({ error: 'Passe ?url= para capturar o screenshot do site' });
  }

  // Verifica se o URL é válido
  const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/;
  if (!urlPattern.test(url)) {
    return res.status(400).json({ error: 'URL inválido. Forneça um URL completo (ex: https://example.com)' });
  }

  try {
    const screenshotUrl = `https://image.thum.io/get/fullpage/${encodeURI(url)}`;
    const response = await axios.get(screenshotUrl, {
      responseType: 'arraybuffer', // Recebe a resposta como buffer para imagem
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      timeout: 10000, // Timeout de 10 segundos, pois screenshots podem demorar
    });

    // Verifica se a resposta é uma imagem válida
    if (!response.headers['content-type'].startsWith('image/')) {
      return res.status(404).json({ error: 'Nenhum screenshot válido retornado pelo site' });
    }

    // Define o cabeçalho da resposta como imagem
    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data); // Envia o buffer da imagem diretamente
  } catch (err) {
    console.error('Erro ao capturar screenshot:', err.message);
    res.status(500).json({
      error: '🚫 Eita, tivemos um pequeno erro! Tente novamente em alguns instantes! 😬✨',
    });
  }
});

export default router;
import express from 'express';
import { createCanvas, loadImage } from 'canvas';

const router = express.Router();

// Endpoint para gerar a imagem de level-up
router.get('/', async (req, res) => {
  const { level1 = '0', level2 = '1', url } = req.query;

  // Validação básica
  if (!level1 || !level2) {
    return res.status(400).send('Parâmetros level1 e level2 são obrigatórios');
  }

  try {
    // === CONFIGURAÇÃO DO CANVAS ===
    const width = 400;
    const height = 100;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // === FUNDO ARREDONDADO (preto com opacidade) ===
    ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
    ctx.beginPath();
    ctx.roundRect(10, 10, width - 20, height - 20, 25);
    ctx.fill();

    // === CARREGAR ÍCONE (do Discord ou URL personalizada) ===
    let iconImage;
    try {
      const iconUrl = url || 'https://discord.com/assets/28174.svg'; // fallback: logo do Discord
      const response = await fetch(iconUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      iconImage = await loadImage(buffer);
    } catch (err) {
      console.warn('Erro ao carregar imagem, usando fallback');
      // Fallback: círculo verde com ícone do Discord
      ctx.fillStyle = '#57F287';
      ctx.beginPath();
      ctx.arc(45, 50, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('D', 45, 58);
      iconImage = null;
    }

    // === DESENHAR ÍCONE (se carregado) ===
    if (iconImage) {
      const iconSize = 50;
      const iconX = 25;
      const iconY = (height - iconSize) / 2;

      // Clip circular
      ctx.save();
      ctx.beginPath();
      ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(iconImage, iconX, iconY, iconSize, iconSize);
      ctx.restore();
    }

    // === TEXTO: Level-up! ===
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Level-up!', 90, 38);

    // === NÍVEIS: 0 · 1 ===
    ctx.font = '24px Arial';
    ctx.fillStyle = '#BBBBBB';
    ctx.fillText(`${level1} · ${level2}`, 90, 68);

    // === ENVIAR IMAGEM ===
    res.setHeader('Content-Type', 'image/png');
    res.send(canvas.toBuffer('image/png'));

  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    res.status(500).send('Erro ao gerar imagem');
  }
});

export default router;
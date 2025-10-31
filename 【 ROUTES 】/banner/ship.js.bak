import express from 'express';
import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch'; // Certifique-se de ter node-fetch instalado

const router = express.Router();

// Função auxiliar para carregar imagem com fallback
async function loadImageWithFallback(url, fallbackColor = '#cccccc') {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch');
    const buffer = Buffer.from(await response.arrayBuffer());
    return await loadImage(buffer);
  } catch (err) {
    console.warn(`Erro ao carregar imagem: ${url}, usando fallback`);
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = fallbackColor;
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('?', 50, 65);
    return canvas;
  }
}

router.get('/', async (req, res, next) => {
  const { foto1, foto2, mat = '79', fundo } = req.query;

  // Validação
  if (!foto1 || !foto2) {
    return res.status(400).send('Parâmetros foto1 e foto2 são obrigatórios');
  }

  const match = Math.min(100, Math.max(0, parseInt(mat) || 79));

  try {
    const width = 400;
    const height = 300;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // === FUNDO PERSONALIZADO OU PADRÃO ===
    if (fundo) {
      try {
        const bgImage = await loadImageWithFallback(fundo);
        ctx.drawImage(bgImage, 0, 0, width, height);
        // Overlay escuro para legibilidade
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, width, height);
      } catch {
        // Fundo padrão roxo/rosa degradê
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#ff69b4');
        gradient.addColorStop(1, '#ff1493');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#ff69b4');
      gradient.addColorStop(1, '#ff1493');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // === BORDA DECORATIVA (quadrado com borda arredondada) ===
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(20, 60, width - 40, 180, 30);
    ctx.stroke();

    // Fundo interno
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();

    // === CARREGAR FOTOS ===
    const img1 = await loadImageWithFallback(foto1, '#8a2be2');
    const img2 = await loadImageWithFallback(foto2, '#ff69b4');

    const photoSize = 100;
    const photoY = 90;

    // Foto 1 (esquerda)
    ctx.save();
    ctx.beginPath();
    ctx.arc(70, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img1, 70 - photoSize / 2, photoY, photoSize, photoSize);
    ctx.restore();

    // Foto 2 (direita)
    ctx.save();
    ctx.beginPath();
    ctx.arc(width - 70, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img2, width - 70 - photoSize / 2, photoY, photoSize, photoSize);
    ctx.restore();

    // === CORAÇÃO GRANDE NO MEIO ===
    const heartSize = 80;
    const heartX = width / 2;
    const heartY = 135;

    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    const heartPath = (x, y, size) => {
      const s = size / 2;
      ctx.moveTo(x, y + s / 4);
      ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s / 4);
      ctx.bezierCurveTo(x - s, y + s / 2, x, y + s, x, y + s);
      ctx.bezierCurveTo(x, y + s, x + s, y + s / 2, x + s, y + s / 4);
      ctx.bezierCurveTo(x + s, y, x, y, x, y + s / 4);
    };
    heartPath(heartX, heartY, heartSize);
    ctx.fill();

    // === CUPIDOS (simples, com asas e arco) ===
    const drawCupid = (x, y, flip = false) => {
      // Corpo
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(x, y + 15, 12, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cabeça
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();

      // Asas
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(x - (flip ? -15 : 15), y + 10, 15, 25, flip ? 0.3 : -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Arco e flecha
      ctx.strokeStyle = '#ff69b4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - (flip ? 20 : -20), y + 5);
      ctx.lineTo(x - (flip ? 30 : -30), y);
      ctx.moveTo(x - (flip ? 30 : -30), y);
      ctx.lineTo(x - (flip ? 25 : -25), y - 3);
      ctx.stroke();
    };

    drawCupid(70, 50);           // Cupido esquerdo
    drawCupid(width - 70, 50, true); // Cupido direito

    // === BARRA DE PROGRESSO ===
    const barWidth = 200;
    const barHeight = 30;
    const barX = (width - barWidth) / 2;
    const barY = 210;

    // Fundo da barra
    ctx.fillStyle = '#fff';
    ctx.roundRect(barX, barY, barWidth, barHeight, 15);
    ctx.fill();

    // Preenchimento da barra
    const fillWidth = (match / 100) * barWidth;
    const gradientBar = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    gradientBar.addColorStop(0, '#ff69b4');
    gradientBar.addColorStop(1, '#ff1493');
    ctx.fillStyle = gradientBar;
    ctx.roundRect(barX, barY, fillWidth, barHeight, 15);
    ctx.fill();

    // Texto do match
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${match}%`, width / 2, barY + barHeight / 2 + 8);

    // === ENVIAR IMAGEM ===
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(canvas.toBuffer('image/png'));

  } catch (error) {
    console.error('Erro ao gerar ship:', error);
    next(error);
  }
});

export default router;
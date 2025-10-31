import express from 'express';
import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';

const router = express.Router();

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
  const { foto1, foto2, mat = '85', fundo } = req.query;

  if (!foto1 || !foto2) {
    return res.status(400).send('Parâmetros foto1 e foto2 são obrigatórios');
  }

  const match = Math.min(100, Math.max(0, parseInt(mat) || 85));

  try {
    const width = 400;
    const height = 300;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // === FUNDO COM DEGRADÊ SUAVE E BRILHO ===
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
    gradient.addColorStop(0, '#ff9ee4');
    gradient.addColorStop(0.5, '#ff69b4');
    gradient.addColorStop(1, '#ff1493');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Overlay sutil para profundidade
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // === BORDA DECORATIVA COM GLOW ===
    ctx.shadowColor = '#ff69b4';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(20, 60, width - 40, 180, 35);
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // Fundo interno com vidro fosco
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.roundRect(20, 60, width - 40, 180, 35);
    ctx.fill();

    // === FOTOS COM BORDA BRANCA E SOMBRA ===
    const img1 = await loadImageWithFallback(foto1, '#8a2be2');
    const img2 = await loadImageWithFallback(foto2, '#ff69b4');

    const photoSize = 110;
    const photoY = 85;

    const drawPhoto = (img, x) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
      ctx.clip();

      ctx.drawImage(img, x - photoSize / 2, photoY, photoSize, photoSize);
      
      // Borda branca com glow
      ctx.restore();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#ff69b4';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x, photoY + photoSize / 2, photoSize / 2 + 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    drawPhoto(img1, 75);
    drawPhoto(img2, width - 75);

    // === CORAÇÃO CENTRAL COM PULSAÇÃO (efeito estático) ===
    const heartSize = 90;
    const heartX = width / 2;
    const heartY = 135;

    // Glow do coração
    ctx.shadowColor = '#ff3333';
    ctx.shadowBlur = 30;
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

    // Brilho interno
    ctx.shadowBlur = 0;
    const innerGradient = ctx.createRadialGradient(heartX, heartY - 20, 0, heartX, heartY - 20, 30);
    innerGradient.addColorStop(0, 'rgba(255,255,255,0.8)');
    innerGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGradient;
    ctx.fill();

    // === CUPIDOS MAIS FOFOS COM AURÉOLA ===
    const drawCupid = (x, y, flip = false) => {
      // Auréola
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y - 15, 8, 5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Cabeça
      ctx.fillStyle = '#ffdbbe';
      ctx.beginPath();
      ctx.arc(x, y - 5, 10, 0, Math.PI * 2);
      ctx.fill();

      // Corpo
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(x, y + 10, 10, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Asas com degradê
      const wingGrad = ctx.createLinearGradient(x - 20, y, x + 20, y + 20);
      wingGrad.addColorStop(0, '#ffffff');
      wingGrad.addColorStop(1, '#ffe4e1');
      ctx.fillStyle = wingGrad;
      ctx.beginPath();
      ctx.ellipse(x - (flip ? -18 : 18), y + 8, 16, 28, flip ? 0.4 : -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Arco com coração na ponta
      ctx.strokeStyle = '#ff69b4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x - (flip ? 25 : -25), y + 5, 8, flip ? Math.PI : 0, flip ? 0 : Math.PI);
      ctx.stroke();

      // Flecha com coração
      ctx.fillStyle = '#ff3333';
      ctx.beginPath();
      ctx.moveTo(x - (flip ? 33 : -33), y + 5);
      ctx.lineTo(x - (flip ? 30 : -30), y + 2);
      ctx.lineTo(x - (flip ? 30 : -30), y + 8);
      ctx.closePath();
      ctx.fill();
    };

    drawCupid(75, 45);
    drawCupid(width - 75, 45, true);

    // === BARRA DE PROGRESSO ESTILOSA ===
    const barWidth = 220;
    const barHeight = 36;
    const barX = (width - barWidth) / 2;
    const barY = 208;

    // Sombra da barra
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;

    // Fundo da barra
    ctx.fillStyle = '#ffffff';
    ctx.roundRect(barX, barY, barWidth, barHeight, 18);
    ctx.fill();

    // Preenchimento com degradê animado
    const fillWidth = (match / 100) * (barWidth - 8);
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    barGrad.addColorStop(0, '#ff9ee4');
    barGrad.addColorStop(0.5, '#ff69b4');
    barGrad.addColorStop(1, '#ff1493');
    ctx.fillStyle = barGrad;
    ctx.roundRect(barX + 4, barY + 4, fillWidth, barHeight - 8, 14);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Texto com sombra
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px "Comic Sans MS", "Arial"', 'sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fillText(`${match}%`, width / 2, barY + barHeight / 2 + 10);

    // Brilho no texto
    ctx.shadowColor = '#ff69b4';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${match}%`, width / 2, barY + barHeight / 2 + 10);

    // Reset shadow
    ctx.shadowBlur = 0;

    // === CORAÇÕES FLUTUANTES DECORATIVOS ===
    const drawFloatingHeart = (x, y, size, opacity) => {
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#ff69b4';
      heartPath(x, y, size);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    drawFloatingHeart(50, 80, 20, 0.3);
    drawFloatingHeart(width - 50, 100, 15, 0.3);
    drawFloatingHeart(100, 220, 18, 0.2);
    drawFloatingHeart(width - 120, 200, 22, 0.2);

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
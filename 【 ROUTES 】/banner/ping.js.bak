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


router.get('/ping', async (req, res, next) => {
  const {
    char = 'https://i.imgur.com/character.png',
    name = 'AmorBot',
    ping = '0.08',
    uptime = '3d 12h',
    groups = '89',
    users = '2.1K'
  } = req.query;

  try {
    const width = 1200;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // === FUNDO DEGRADÊ SUAVE ===
    const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.8);
    bgGradient.addColorStop(0, '#ffd6f7');
    bgGradient.addColorStop(0.6, '#ffb3f0');
    bgGradient.addColorStop(1, '#ff99e6');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // === BRILHO CENTRAL (PULSO) ===
    const pulseGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 300);
    pulseGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    pulseGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = pulseGradient;
    ctx.fillRect(0, 0, width, height);

    // === PERSONAGEM CENTRAL COM PULSO E GLOW ===
    const charImg = await loadImageWithFallback(char, '#ff69b4');
    const charSize = 300;
    const charX = width / 2;
    const charY = height / 2;

    // Clip circular
    ctx.save();
    ctx.beginPath();
    ctx.arc(charX, charY, charSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(charImg, charX - charSize / 2, charY - charSize / 2, charSize, charSize);
    ctx.restore();

    // Borda com glow duplo
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = '#ff69b4';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(charX, charY, charSize / 2 + 6, 0, Math.PI * 2);
    ctx.stroke();

    // Glow interno (brilho)
    ctx.shadowBlur = 60;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(charX, charY, charSize / 2 + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // === NOME DO BOT ===
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px "Comic Sans MS", cursive';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.fillText(name, width / 2, 70);
    ctx.shadowBlur = 0;

    // === CAIXAS COM VIDRO FOSCO (ESQUERDA) ===
    const drawGlassBox = (x, y, title, value, emoji) => {
      // Fundo com blur e transparência
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.roundRect(x, y, 180, 70, 35);
      ctx.fill();

      // Borda suave
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Texto
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, x + 90, y + 25);

      ctx.font = 'bold 24px "Comic Sans MS", sans-serif';
      ctx.fillText(value, x + 90, y + 50);

      // Emoji
      ctx.font = '28px Arial';
      ctx.fillText(emoji, x + 35, y + 45);
    };

    drawGlassBox(80, 120, 'Grupos', groups, 'Group');
    drawGlassBox(80, 200, 'Usuários', users, 'Person');

    // === BOTÃO "ONLINE" ESTILOSO ===
    const btnX = width - 280;
    const btnY = 200;
    const btnWidth = 180;
    const btnHeight = 60;

    // Fundo do botão com degradê
    const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnWidth, btnY);
    btnGrad.addColorStop(0, '#ff69b4');
    btnGrad.addColorStop(1, '#ff1493');
    ctx.fillStyle = btnGrad;
    ctx.roundRect(btnX, btnY, btnWidth, btnHeight, 30);
    ctx.fill();

    // Borda brilhante
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Texto do botão
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Online', btnX + btnWidth / 2, btnY + 35);

    // Tempo online
    ctx.font = '16px "Comic Sans MS", sans-serif';
    ctx.fillText(uptime, btnX + btnWidth / 2, btnY + 55);

    // Ícone de check
    ctx.font = '24px Arial';
    ctx.fillText('Check', btnX + 40, btnY + 38);

    // === VELOCIDADE (CAIXA PEQUENA) ===
    drawGlassBox(width - 260, 120, 'Ping', `${ping}s`, 'Speed');

    // === CORAÇÕES FLUTUANTES COM OPACIDADE ===
    const drawFloatingHeart = (x, y, size, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ff69b4';
      const s = size / 2;
      ctx.beginPath();
      ctx.moveTo(x, y + s / 4);
      ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s / 4);
      ctx.bezierCurveTo(x - s, y + s / 2, x, y + s, x, y + s);
      ctx.bezierCurveTo(x, y + s, x + s, y + s / 2, x + s, y + s / 4);
      ctx.bezierCurveTo(x + s, y, x, y, x, y + s / 4);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    drawFloatingHeart(150, 100, 30, 0.3);
    drawFloatingHeart(width - 150, 130, 25, 0.3);
    drawFloatingHeart(200, 380, 35, 0.2);
    drawFloatingHeart(width - 200, 360, 30, 0.2);

    // === ENVIAR IMAGEM ===
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(canvas.toBuffer('image/png'));

  } catch (error) {
    console.error('Erro ao gerar ping:', error);
    next(error);
  }
});

export default router;

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
  const {
    bg = 'https://i.imgur.com/example-bg.jpg', // fundo opcional
    char = 'https://i.imgur.com/character.png', // personagem opcional
    name = 'Botzinho',                         // nome do bot
    ping = '0.12',                             // velocidade em segundos
    uptime = '2d 5h 30m',                      // tempo online
    groups = '127',                            // total de grupos
    users = '3.2K'                             // total de usuários
  } = req.query;

  try {
    const width = 1200;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // === FUNDO COM DEGRADÊ RADIAL SUAVE ===
    const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
    bgGradient.addColorStop(0, '#ffe6f7');
    bgGradient.addColorStop(0.5, '#ffccf2');
    bgGradient.addColorStop(1, '#ff99e6');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Overlay leve para profundidade
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, width, height);

    // === IMAGEM DE FUNDO (OPCIONAL) COM FALLBACK ===
    try {
      const bgImg = await loadImageWithFallback(bg, '#ff99e6');
      ctx.globalAlpha = 0.4;
      ctx.drawImage(bgImg, 0, 0, width, height);
      ctx.globalAlpha = 1;
    } catch (err) {
      console.warn('Imagem de fundo não carregada, usando cor sólida');
    }

    // === PERSONAGEM CENTRAL COM BORDA E GLOW ===
    const charImg = await loadImageWithFallback(char, '#ff69b4');
    const charSize = 320;
    const charX = width / 2;
    const charY = height / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(charX, charY, charSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(charImg, charX - charSize / 2, charY - charSize / 2, charSize, charSize);
    ctx.restore();

    // Borda branca com glow
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = '#ff69b4';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(charX, charY, charSize / 2 + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // === CAIXAS DE INFORMAÇÃO (ESQUERDA E DIREITA) ===
    const boxWidth = 240;
    const boxHeight = 90;
    const boxRadius = 20;
    const leftX = 50;
    const rightX = width - 50 - boxWidth;

    const drawInfoBox = (x, title, value, icon, color1, color2) => {
      // Fundo com vidro fosco
      const grad = ctx.createLinearGradient(x, 0, x + boxWidth, 0);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.fillStyle = grad;
      ctx.roundRect(x, 180, boxWidth, boxHeight, boxRadius);
      ctx.fill();

      // Borda sutil
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Texto
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Comic Sans MS", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, x + boxWidth / 2, 210);

      ctx.font = 'bold 28px "Comic Sans MS", Arial, sans-serif';
      ctx.fillText(value, x + boxWidth / 2, 245);

      // Ícone decorativo
      ctx.font = '32px Arial';
      ctx.fillText(icon, x + 30, 240);
    };

    // Esquerda
    drawInfoBox(leftX, 'Grupos', groups, 'Group', '#ff9ee4', '#ff69b4');
    drawInfoBox(leftX, 'Usuários', users, 'Person', '#ffb6e0', '#ff85c0');

    // Direita
    drawInfoBox(rightX, 'Velocidade', `${ping}s`, 'Speed', '#ff69b4', '#ff1493');
    drawInfoBox(rightX, 'Online', uptime, 'Clock', '#ff85c0', '#ff3399');

    // === NOME DO BOT COM ESTILO ===
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px "Comic Sans MS", cursive';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.fillText(name, width / 2, 80);

    // Brilho no nome
    ctx.shadowColor = '#ff69b4';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, width / 2, 80);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // === CORAÇÕES DECORATIVOS FLUTUANTES ===
    const drawHeart = (x, y, size, opacity = 0.4) => {
      ctx.globalAlpha = opacity;
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

    drawHeart(100, 120, 30);
    drawHeart(width - 100, 140, 25);
    drawHeart(180, 400, 35);
    drawHeart(width - 180, 380, 30);

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
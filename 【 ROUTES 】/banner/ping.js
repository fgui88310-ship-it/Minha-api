import express from 'express';
import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';

const router = express.Router();

async function loadImageWithFallback(url, fallbackColor = '#ff69b4') {
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

router.get('/', async (req, res) => {
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

    // === EXTENSÃO roundRect ===
    if (!ctx.roundRect) {
      ctx.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
      };
    }

    // === FUNDO DEGRADÊ ===
    const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.8);
    bgGradient.addColorStop(0, '#ffd6f7');
    bgGradient.addColorStop(0.6, '#ffb3f0');
    bgGradient.addColorStop(1, '#ff99e6');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // === BRILHO CENTRAL ===
    const pulseGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 300);
    pulseGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    pulseGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = pulseGradient;
    ctx.fillRect(0, 0, width, height);

    // === PERSONAGEM CENTRAL (CÍRCULO COM CLIP) ===
    const charImg = await loadImageWithFallback(char, '#ff69b4');
    const charSize = 300;
    const charX = width / 2;
    const charY = height / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(charX, charY, charSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(charImg, charX - charSize / 2, charY - charSize / 2, charSize, charSize);
    ctx.restore();

    // Borda com glow
    ctx.shadowColor = '#ff69b4';
    ctx.shadowBlur = 40;
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(charX, charY, charSize / 2 + 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 60;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(charX, charY, charSize / 2 + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // === NOME DO BOT ===
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.fillText(name, width / 2, 80);
    ctx.shadowBlur = 0;

    // === FUNÇÃO PARA CAIXA DE VIDRO (PEQUENA) ===
    const drawStatBox = (x, y, title, value, emoji) => {
      const boxW = 160;
      const boxH = 70;
      const radius = 35;

      // Fundo fosco
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.roundRect(x, y, boxW, boxH, radius);
      ctx.fill();

      // Borda
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.roundRect(x, y, boxW, boxH, radius);
      ctx.stroke();

      // Emoji
      ctx.font = '28px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(emoji, x + 40, y + 45);

      // Título
      ctx.font = '16px Arial';
      ctx.fillText(title, x + 90, y + 28);

      // Valor
      ctx.font = 'bold 24px Arial';
      ctx.fillText(value, x + 90, y + 55);
    };

    // === CAIXAS DE ESTATÍSTICAS (ESQUERDA) ===
    drawStatBox(100, 140, 'Grupos', groups, 'Group');
    drawStatBox(100, 230, 'Usuários', users, 'Person');

    // === PING (DIREITA, ALINHADO COM GRUPOS) ===
    drawStatBox(width - 260, 140, 'Ping', `${ping}s`, 'Speed');

    // === BOTÃO ONLINE (DIREITA, ABAIXO DO PING) ===
    const btnX = width - 260;
    const btnY = 230;
    const btnW = 160;
    const btnH = 70;
    const btnR = 35;

    const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
    btnGrad.addColorStop(0, '#ff69b4');
    btnGrad.addColorStop(1, '#ff1493');
    ctx.fillStyle = btnGrad;
    ctx.roundRect(btnX, btnY, btnW, btnH, btnR);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.roundRect(btnX, btnY, btnW, btnH, btnR);
    ctx.stroke();

    // Ícone Check
    ctx.font = '28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Check', btnX + 40, btnY + 45);

    // Texto Online
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Online', btnX + 100, btnY + 38);

    // Uptime
    ctx.font = '16px Arial';
    ctx.fillText(uptime, btnX + 100, btnY + 58);

    // === CORAÇÕES FLUTUANTES (LEVE E DISCRETO) ===
    const drawHeart = (x, y, size, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ff69b4';
      const s = size;
      ctx.beginPath();
      const hx = x, hy = y + s / 4;
      ctx.moveTo(hx, hy);
      ctx.bezierCurveTo(hx, hy - s / 2, hx - s, hy - s / 2, hx - s, hy);
      ctx.bezierCurveTo(hx - s, hy + s / 2, hx, hy + s, hx, hy + s);
      ctx.bezierCurveTo(hx, hy + s, hx + s, hy + s / 2, hx + s, hy);
      ctx.bezierCurveTo(hx + s, hy - s / 2, hx, hy - s / 2, hx, hy);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    drawHeart(180, 120, 28, 0.25);
    drawHeart(width - 180, 120, 26, 0.25);
    drawHeart(150, 380, 32, 0.18);
    drawHeart(width - 150, 360, 30, 0.18);

    // === ENVIA IMAGEM ===
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(canvas.toBuffer());

  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    res.status(500).send('Erro ao gerar imagem');
  }
});

export default router;
// api/routes/ping.js
import express from 'express';
import { JSDOM } from 'jsdom';
import { toPng } from 'html-to-image';
import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';

const router = express.Router();

// CONFIGURAÇÃO GLOBAL DO CANVAS (ESSENCIAL)
const canvas = createCanvas(1, 1);
const ctx = canvas.getContext('2d');

global.HTMLCanvasElement = canvas.constructor;
global.CanvasRenderingContext2D = ctx.constructor;
global.Image = loadImage;

// getContext seguro
global.HTMLCanvasElement.prototype.getContext = function (type) {
  if (type !== '2d') return null;
  const c = createCanvas(this.width || 300, this.height || 150);
  return c.getContext('2d');
};

// Converte imagem para data URL
const toDataUrl = async (url) => {
  try {
    const res = await fetch(url, { timeout: 10000 });
    if (!res.ok) return null;
    const buffer = await res.buffer();
    const mime = res.headers.get('content-type') || 'image/png';
    return `data:${mime};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
};

const generatePingImage = async (bg, char, name, ping, uptime, groups, users) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Poppins',sans-serif;background:#ffe6f0}
    .banner{width:1200px;height:500px;background:url('${bg}') center/cover no-repeat;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between}
    .bot-name{position:absolute;top:40px;left:50%;transform:translateX(-50%);color:white;font-size:48px;font-weight:700;text-shadow:0 2px 8px rgba(0,0,0,0.3);z-index:3}
    .character-container{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1}
    .character{width:320px;height:320px;object-fit:contain;border-radius:50%;border:6px solid white;box-shadow:0 10px 25px rgba(0,0,0,0.2)}
    .info-boxes{display:flex;flex-direction:column;gap:20px;z-index:2}
    .left-boxes{margin-left:30px}.right-boxes{margin-right:30px}
    .box{background:rgba(255,255,255,0.9);padding:25px;border-radius:20px;box-shadow:0 5px 15px rgba(0,0,0,0.15);text-align:center;width:220px;backdrop-filter:blur(6px)}
    .groups-box,.users-box{background:rgba(255,182,193,0.85)}
    .groups-box h3,.users-box h3{font-size:18px;color:#ff4d6d;margin:0 0 8px}
    .groups-box p,.users-box p{font-size:20px;color:#333;font-weight:600;margin:0}
    .speed-box,.uptime-box{background:rgba(255,182,193,0.85);width:250px;padding:30px}
    .speed-box h3,.uptime-box h3{font-size:20px;color:#ff4d6d;margin:0 0 10px}
    .speed-box p,.uptime-box p{font-size:24px;color:#333;font-weight:600;margin:0}
  </style>
</head>
<body>
  <div class="banner">
    <h1 class="bot-name">${name}</h1>
    <div class="character-container"><img class="character" src="${char}" /></div>
    <div class="info-boxes left-boxes">
      <div class="box groups-box"><h3>Total de Grupos</h3><p>${groups}</p></div>
      <div class="box users-box"><h3>Total de Usuários</h3><p>${users}</p></div>
    </div>
    <div class="info-boxes right-boxes">
      <div class="box speed-box"><h3>Velocidade</h3><p>${ping}s</p></div>
      <div class="box uptime-box"><h3>Tempo Online</h3><p>${uptime}</p></div>
    </div>
  </div>
</body>
</html>
`;

  // Cria DOM com canvas já registrado
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.HTMLCanvasElement = global.HTMLCanvasElement;
      window.CanvasRenderingContext2D = global.CanvasRenderingContext2D;
      window.Image = global.Image;
    }
  });

  const document = dom.window.document;

  // Substitui imagem
  const img = document.querySelector('.character');
  if (img && img.src.startsWith('http')) {
    const dataUrl = await toDataUrl(img.src);
    if (dataUrl) img.src = dataUrl;
  }

  // Aguarda
  await new Promise(r => setTimeout(r, 200));

  const element = document.querySelector('.banner');
  const dataUrl = await toPng(element, {
    quality: 1,
    pixelRatio: 2,
    width: 1200,
    height: 500,
    style: { backgroundColor: '#ffe6f0' },
    cacheBust: true
  });

  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  return Buffer.from(base64, 'base64');
};

router.get('/', async (req, res) => {
  try {
    const {
      bg = 'https://i.imgur.com/8x8x8x8.jpg',
      char = 'https://i.imgur.com/bot.png',
      name = 'Bot',
      ping = '0.1',
      uptime = '24h',
      groups = '100',
      users = '1K'
    } = req.query;

    const buffer = await generatePingImage(bg, char, name, ping, uptime, groups, users);
    res.set('Content-Type', 'image/png').send(buffer);
  } catch (error) {
    console.error('Erro:', error.message);
    res.status(500).json({ error: 'Falha', details: error.message });
  }
});

export default router;
import express from 'express';
import { JSDOM } from 'jsdom';
import { toPng } from 'html-to-image';
import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';

const router = express.Router();

// Configuração global do Canvas para o JSDOM
const configureCanvas = (window) => {
  const { Canvas, CanvasRenderingContext2D, Image } = createCanvas;

  window.HTMLCanvasElement = Canvas;
  window.CanvasRenderingContext2D = CanvasRenderingContext2D;
  window.Image = Image;

  // Simula getContext
  Canvas.prototype.getContext = function (type) {
    if (type === '2d') {
      return this._context2d || (this._context2d = new CanvasRenderingContext2D(this.width, this.height));
    }
    return null;
  };

  return window;
};

const Ping = async (backgroundImage, characterImage, botName, pingSpeed, uptime, totalGroups, totalUsers) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          body { margin: 0; padding: 0; font-family: 'Poppins', sans-serif; background: #ffe6f0; }
          .banner { 
            width: 1200px; height: 500px; 
            background: url('${backgroundImage}') center/cover no-repeat; 
            display: flex; align-items: center; justify-content: space-between; 
            position: relative; overflow: hidden; 
          }
          .character-container { 
            position: absolute; top: 50%; left: 50%; 
            transform: translate(-50%, -50%); z-index: 1; 
          }
          .character { 
            width: 320px; height: 320px; object-fit: contain; 
            border-radius: 50%; border: 6px solid #fff; 
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); 
          }
          .info-boxes { 
            display: flex; flex-direction: column; gap: 20px; z-index: 2; 
          }
          .left-boxes { margin-left: 30px; }
          .right-boxes { margin-right: 30px; }
          .box { 
            background: rgba(255, 255, 255, 0.9); padding: 25px; 
            border-radius: 20px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15); 
            text-align: center; width: 220px; backdrop-filter: blur(6px); 
          }
          .groups-box, .users-box { background: rgba(255, 182, 193, 0.85); }
          .groups-box h3, .users-box h3 { font-size: 18px; color: #ff4d6d; margin: 0 0 8px; }
          .groups-box p, .users-box p { font-size: 20px; color: #333; font-weight: 600; margin: 0; }
          .speed-box, .uptime-box { background: rgba(255, 182, 193, 0.85); width: 250px; padding: 30px; }
          .speed-box h3, .uptime-box h3 { font-size: 20px; color: #ff4d6d; margin: 0 0 10px; }
          .speed-box p, .uptime-box p { font-size: 24px; color: #333; font-weight: 600; margin: 0; }
          .bot-name {
            position: absolute; top: 40px; left: 50%; transform: translateX(-50%);
            color: white; font-size: 48px; font-weight: 700;
            text-shadow: 0 2px 8px rgba(0,0,0,0.3);
            z-index: 3;
          }
        </style>
      </head>
      <body>
        <div class="banner">
          <h1 class="bot-name">${botName}</h1>
          <div class="character-container">
            <img class="character" src="${characterImage}" />
          </div>
          <div class="info-boxes left-boxes">
            <div class="box groups-box"><h3>Total de Grupos</h3><p>${totalGroups}</p></div>
            <div class="box users-box"><h3>Total de Usuários</h3><p>${totalUsers}</p></div>
          </div>
          <div class="info-boxes right-boxes">
            <div class="box speed-box"><h3>Velocidade</h3><p>${pingSpeed}s</p></div>
            <div class="box uptime-box"><h3>Tempo Online</h3><p>${uptime}</p></div>
          </div>
        </div>
      </body>
    </html>
  `;

  // Cria DOM com Canvas
  const dom = new JSDOM(htmlContent, {
    resources: "usable",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    beforeParse(window) {
      configureCanvas(window);
    }
  });

  const document = dom.window.document;

  // Função para carregar imagem como base64
  const loadImageAsDataURL = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Falha ao carregar imagem');
      const buffer = await response.buffer();
      const base64 = buffer.toString('base64');
      const mime = response.headers.get('content-type') || 'image/png';
      return `data:${mime};base64,${base64}`;
    } catch (err) {
      console.warn(`Falha ao carregar imagem: ${url}`, err.message);
      return null;
    }
  };

  // Substitui imagens externas por data URLs
  const imgElements = document.querySelectorAll('img');
  for (const img of imgElements) {
    const src = img.getAttribute('src');
    if (src && src.startsWith('http')) {
      const dataUrl = await loadImageAsDataURL(src);
      if (dataUrl) {
        img.setAttribute('src', dataUrl);
      } else {
        img.style.display = 'none'; // esconde se falhar
      }
    }
  }

  // Espera fontes e imagens carregarem
  await new Promise((resolve) => {
    let loaded = 0;
    const total = imgElements.length;

    if (total === 0) return resolve();

    imgElements.forEach(img => {
      if (img.complete) {
        if (++loaded === total) resolve();
      } else {
        img.onload = () => { if (++loaded === total) resolve(); };
        img.onerror = () => { if (++loaded === total) resolve(); };
      }
    });
  });

  const element = document.querySelector('.banner');

  // Gera PNG com html-to-image
  const dataUrl = await toPng(element, {
    quality: 1,
    pixelRatio: 2,
    width: 1200,
    height: 500,
    style: { backgroundColor: '#ffe6f0' },
    cacheBust: true,
    // Força uso do canvas
    imageTimeout: 30000,
    skipFonts: false
  });

  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  return Buffer.from(base64, 'base64');
};

// Endpoint
router.get('/', async (req, res) => {
  try {
    const {
      bg = 'https://i.imgur.com/8x8x8x8.jpg',
      char = 'https://i.imgur.com/bot.png',
      name = 'Meu Bot',
      ping = '0.12',
      uptime = '2d 5h',
      groups = '150',
      users = '1.2K'
    } = req.query;

    if (!char || !bg) {
      return res.status(400).json({ error: 'Parâmetros char e bg são obrigatórios.' });
    }

    const imageBuffer = await Ping(bg, char, name, ping, uptime, groups, users);

    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    });
    res.send(imageBuffer);
  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    res.status(500).json({ error: 'Erro ao gerar imagem', details: error.message });
  }
});

export default router;
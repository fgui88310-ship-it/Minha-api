import express from 'express';
import { JSDOM } from 'jsdom';
import { toPng } from 'html-to-image';

const router = express.Router();

// Função Ping (já fornecida por você)
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
            <div class="box groups-box"><h3>Total de Grupos Group</h3><p>${totalGroups}</p></div>
            <div class="box users-box"><h3>Total de Usuários Person</h3><p>${totalUsers}</p></div>
          </div>
          <div class="info-boxes right-boxes">
            <div class="box speed-box"><h3>Velocidade Speed</h3><p>${pingSpeed}s</p></div>
            <div class="box uptime-box"><h3>Tempo Online Check</h3><p>${uptime}</p></div>
          </div>
        </div>
      </body>
    </html>
  `;

  const dom = new JSDOM(htmlContent, { resources: "usable", runScripts: "dangerously" });
  const document = dom.window.document;

  await new Promise((resolve) => {
    const imgs = document.querySelectorAll('img');
    let loaded = 0;
    if (imgs.length === 0) return resolve();

    imgs.forEach(img => {
      if (img.complete) loaded++;
      else {
        img.onload = () => { if (++loaded === imgs.length) resolve(); };
        img.onerror = () => { if (++loaded === imgs.length) resolve(); };
      }
    });
    if (loaded === imgs.length) resolve();
  });

  const element = document.querySelector('.banner');
  const dataUrl = await toPng(element, {
    quality: 1,
    pixelRatio: 2,
    width: 1200,
    height: 500,
    style: { backgroundColor: '#ffe6f0' }
  });

  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  return Buffer.from(base64, 'base64');
};

// Endpoint GET
router.get('/', async (req, res) => {
  try {
    const {
      bg = 'https://i.imgur.com/abc123.jpg', // imagem de fundo padrão
      char = 'https://i.imgur.com/char.png',  // personagem padrão
      name = 'Meu Bot',
      ping = '0.12',
      uptime = '2d 5h 30m',
      groups = '150',
      users = '1.2K'
    } = req.query;

    // Validação básica
    if (!char || !bg) {
      return res.status(400).json({ error: 'Parâmetros char e bg são obrigatórios.' });
    }

    const imageBuffer = await Ping(bg, char, name, ping, uptime, groups, users);

    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store'
    });
    res.send(imageBuffer);
  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    res.status(500).json({ error: 'Erro interno ao gerar a imagem.' });
  }
});

export default router;
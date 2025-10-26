// api/endpoints/name.js
import express from 'express';
import { createCanvas, loadImage } from 'canvas';

const router = express.Router();

router.get('/', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Falta ?name=' });

  const safeName = name.trim().toUpperCase();

  try {
    // === CANVAS 600x200 ===
    const width = 600;
    const height = 200;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fundo degradê
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#4ecdc4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Borda arredondada
    ctx.beginPath();
    ctx.roundRect(10, 10, width - 20, height - 20, 20);
    ctx.fill();

    // Sombra no texto
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 8;

    // Nome
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px "Arial", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(safeName, width / 2, 100);

    // Subtítulo
    ctx.font = '28px "Arial", sans-serif';
    ctx.fillText('BEM-VINDO AO TIME!', width / 2, 150);

    // === GERA HTML + CSS IGUAL AO SEU ===
    const html = `
      <div class="banner">
        <h1>${safeName}</h1>
        <p>BEM-VINDO AO TIME!</p>
      </div>
    `;

    const css = `
      .banner {
        width: ${width}px;
        height: ${height}px;
        background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        font-family: 'Arial', sans-serif;
        text-align: center;
        box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        overflow: hidden;
      }
      h1 {
        margin: 0;
        font-size: 48px;
        font-weight: bold;
        text-shadow: 0 4px 8px rgba(0,0,0,0.4);
      }
      p {
        margin: 10px 0 0;
        font-size: 28px;
      }
    `;

    // === RESPOSTA ===
    res.json({
      html,
      css,
      width,
      height,
      font: 'Arial' // ou 'Pacifico' se quiser Google Fonts
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

export default router;
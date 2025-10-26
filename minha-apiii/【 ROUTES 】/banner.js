import express from 'express';
import axios from 'axios';

const router = express.Router();

// Endpoint GET /api/banner?foto=...&numero=...&grupo=...&membro=...
router.get('/', async (req, res) => {
  const {
    foto = 'https://i.pravatar.cc/150?img=3',
    numero = '+55 21 99999-9999',
    grupo = 'Galera do JavaScript',
    membro = 1,
  } = req.query;

  const html = `
    <html>
      <body>
        <div style="width:1200px;height:500px;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);display:flex;align-items:center;justify-content:center;color:white;font-family:Poppins,sans-serif;">
          <img src="${foto}" style="width:150px;height:150px;border-radius:50%;border:5px solid #fff;margin-right:40px;" />
          <div>
            <div style="font-size:36px;font-weight:600;margin-bottom:10px;">Bem-vindo(a), <span style="color:#00d2ff;">${numero}</span></div>
            <div style="font-size:28px;margin-bottom:8px;">ao grupo <strong style="color:#feca57;">${grupo}</strong></div>
            <div style="font-size:24px;color:#ccc;margin-bottom:25px;">Você é o <span>#${membro}º membro</span></div>
            <div style="font-size:22px;font-style:italic;opacity:0.9;">☕ Quer um café enquanto lê as regras?</div>
          </div>
        </div>
      </body>
    </html>
  `;

  const payload = {
    html,
    css: '',
    viewport_width: '1200',
    viewport_height: '500',
    google_fonts: 'Poppins',
    device_scale: '2',
  };

  try {
    const { data } = await axios.post('https://htmlcsstoimage.com/demo_run', payload, {
      headers: {
        cookie: 'session=abc123',
        'x-csrf-token': 'ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG'
      },
      responseType: 'arraybuffer' // importante: retorna bytes da imagem
    });

    res.setHeader('Content-Type', 'image/png'); // define que é imagem
    res.setHeader('Content-Disposition', 'attachment; filename=banner.png'); // força download
    res.send(data); // envia a imagem
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao gerar o banner');
  }
});

export default router;
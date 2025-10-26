// gerar.js
const fs = require('fs');
const fetch = require('node-fetch'); // npm install node-fetch@2

const API_URL = 'https://htmltoimage.cognima.com.br/api.php';

async function gerarBanner(html, options = {}) {
  const payload = new URLSearchParams({
    html: html,
    viewport_width: options.width || '1200',
    viewport_height: options.height || '500',
    device_scale: options.scale || '2',
    format: options.format || 'png',
    ...(options.css && { css: options.css }),
    ...(options.google_fonts && { google_fonts: options.google_fonts })
  });

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (compatible; NodeBot/1.0)',
      'Origin': 'https://htmltoimage.cognima.com.br',
      'Referer': 'https://htmltoimage.cognima.com.br/'
    },
    body: payload
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

// === EXEMPLO PING ===
(async () => {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Poppins',sans-serif;background:#ffe6f0}
    .banner{width:1200px;height:500px;background:url('https://i.imgur.com/5e5zY8r.jpg') center/cover;display:flex;align-items:center;justify-content:space-between;position:relative;overflow:hidden}
    .char{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2}
    .char img{width:320px;height:320px;object-fit:contain;border-radius:50%;border:6px solid #fff;box-shadow:0 10px 25px rgba(0,0,0,.3)}
    .box{background:rgba(255,255,255,.92);padding:22px;border-radius:18px;box-shadow:0 5px 15px rgba(0,0,0,.15);text-align:center;width:220px;backdrop-filter:blur(5px)}
    .left{margin-left:30px}.right{margin-right:30px}
    .box h3{font-size:17px;color:#e91e63;margin-bottom:6px}
    .box p{font-size:21px;color:#333;font-weight:700}
    .right .box{width:250px;padding:28px}
    .right h3{font-size:19px}.right p{font-size:23px}
  </style>
</head>
<body>
  <div class="banner">
    <div class="char"><img src="https://i.imgur.com/7k2j3fM.png"></div>
    <div class="left">
      <div class="box"><h3>Total de Grupos</h3><p>512</p></div>
      <div class="box"><h3>Total de Usuários</h3><p>12453</p></div>
    </div>
    <div class="right">
      <div class="box"><h3>Velocidade</h3><p>0.05s</p></div>
      <div class="box"><h3>Tempo Online</h3><p>7d 21h</p></div>
    </div>
  </div>
</body>
</html>`;

    const buffer = await gerarBanner(html, {
      width: '1200',
      height: '500',
      scale: '2',
      format: 'png'
    });

    fs.writeFileSync('banner_final.png', buffer);
    console.log('banner_final.png GERADO COM SUCESSO, SEU ARROMBADO!');
  } catch (err) {
    console.error('ERRO:', err.message);
  }
})();

// api/server.js
import { config } from 'dotenv';
config();
import myInstantsRouter from './【 ROUTES 】/myinstants.js';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { rateLimit } from './【 MODULES 】/libs.js'; // só rateLimit do libs
import { cleanupOldFiles } from './【 UTILS 】/fileUtils.js'; // importa direto do arquivo utilitário
// routers
import levelupRouter from './【 ROUTES 】/levelup.js';
import nameInfoRouter from './【 ROUTES 】/nameInfo.js';
import printsiteRouter from './【 ROUTES 】/printsite.js';
import tunaRouter from './【 ROUTES 】/tuna.js';
import animetvRouter from './【 ROUTES 】/animetv.js';
import bannerRouter from './【 ROUTES 】/banner.js';
import dddRouter from './【 ROUTES 】/ddd.js';
import brasileiraoRouter from './【 ROUTES 】/brasileirao.js';
import pinterestMp4Router from './【 ROUTES 】/pinterestMp4.js';
import translatorRouter from './【 ROUTES 】/translator.js';
import sportsRouter from './【 ROUTES 】/sports.js';
import noticiasRouter from './【 ROUTES 】/noticias.js';
import soundcloudFullRouter from './【 ROUTES 】/soundcloudsearch.js';
import serieRouter from './【 ROUTES 】/serie.js';
import npmRouter from './【 ROUTES 】/npm.js';
import tiktokRouter from './【 ROUTES 】/tiktok.js';
import soundcloudRouter from './【 ROUTES 】/soundcloud.js';
import signoRouter from './【 ROUTES 】/signo.js';
import instagramVideoInfoRouter from './【 ROUTES 】/instagramVideoInfo.js';
import threadsRouter from './【 ROUTES 】/threads.js';
import gptRouter from './【 ROUTES 】/gpt.js'; // importa o router GPT
import appleMusicRouter from './【 ROUTES 】/appleMusic.js';
import nickgenRouter from './【 ROUTES 】/nickgen.js';
import horoscopo from "./【 ROUTES 】/horoscopo.js";
import playstoreRouter from './【 ROUTES 】/playstore.js';
import xvideosRouter from './【 ROUTES 】/xvideos.js';
import pinterestRouter from './【 ROUTES 】/pinterest.js';
import lyricsRouter from './【 ROUTES 】/lyrics.js';
import pornhubRouter from './【 ROUTES 】/pornhub.js';
import tekmodsRouter from './【 ROUTES 】/tekmods.js';
import globoRouter from './【 ROUTES 】/globo.js';
import poder360Router from './【 ROUTES 】/poder360.js';
import whatsappGroupsRouter from './【 ROUTES 】/whatsapp-groups.js';
import jovempanRouter from './【 ROUTES 】/jovempan.js';
import uolRouter from './【 ROUTES 】/uol.js';
import cinemaRouter from './【 ROUTES 】/cinema.js';
import estadaoRouter from './【 ROUTES 】/estadao.js';
import dicionarioRouter from './【 ROUTES 】/dicionario.js';
import kwaiRouter from './【 ROUTES 】/kwai.js';
import mercadoLivreRoute from './【 ROUTES 】/mercadolivre.js';
import tiktokDownloadRouter from './【 ROUTES 】/tiktokDownload.js';
import stickersRouter from './【 ROUTES 】/stickers.js';
import metadinhasRouter from './【 ROUTES 】/metadinhas.js';
import emojimixRouter from './【 ROUTES 】/emojimix.js';
import emojiRouter from './【 ROUTES 】/emoji.js';
import celularRouter from './【 ROUTES 】/celular.js';
import twitterDownloadRouter from './【 ROUTES 】/twitterDownload.js';
import facebookDownloadRouter from './【 ROUTES 】/facebookDownload.js';
import youtubeRouter from './【 ROUTES 】/youtube.js';
import nhentaiRouter from './【 ROUTES 】/nhentai.js';
import playvideoRouter from './【 ROUTES 】/playvideo.js';
import ytsearchRouter from './【 ROUTES 】/ytsearch.js';
import nasaRoute from './【 ROUTES 】/nasa.js';
import gimageRouter from './【 ROUTES 】/gimage.js';
import imdbInfoRouter from './【 ROUTES 】/imdbinfo.js';
import cepRouter from './【 ROUTES 】/cep.js';
import amazonRouter from './【 ROUTES 】/amazon.js';
import animeRouter from './【 ROUTES 】/anime.js';
import pensadorRouter from './【 ROUTES 】/pensador.js';
import climaRouter from './【 ROUTES 】/clima.js';
import receitaRouter from './【 ROUTES 】/receita.js';
import wikipediaRouter from './【 ROUTES 】/wikipedia.js';
import movieRouter from './【 ROUTES 】/movie.js';
import imdbRouter from './【 ROUTES 】/imdb.js';
import aptoideRoute from './【 ROUTES 】/aptoide.js';
import { errorHandler } from './【 MIDDLEWARE 】/errorHandler.js';
import gameNewsRouter from './【 ROUTES 】/game-news.js';

// Substitui __dirname para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limit para /api
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 requisições por minuto
  message: {
    error: 'Limite de requisições excedido. Tente novamente em 1 minuto.'
  }
});
app.use('/api', limiter);

// Página inicial
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '【 PUBLIC 】', 'index.html'));
});

// Rota para a documentação (categorias de endpoints)
app.get('/docs', (req, res) => {
  res.sendFile(join(__dirname, '【 PUBLIC 】', 'docs.html'));
});

// Servir arquivos estáticos
app.use(express.static(join(__dirname, '【 PUBLIC 】')));
app.use('/downloads', express.static(join(__dirname, 'downloads')));

// Montar rotas da API
app.use('/api/animetv', animetvRouter);
app.use('/api/levelup', levelupRouter);
app.use('/api/banner', bannerRouter);
app.use('/api/metadinhas', metadinhasRouter);
app.use('/api/game-news', gameNewsRouter);
app.use('/api/sports', sportsRouter);
app.use('/api/printsite', printsiteRouter);
app.use('/api/threads', threadsRouter);
app.use('/api/soundcloud', soundcloudRouter);
app.use('/api/instagram', instagramVideoInfoRouter);
app.use('/api/myinstants', myInstantsRouter);
app.use('/api/gpt', gptRouter);
app.use('/api/name', nameInfoRouter);
app.use('/api/nasa', nasaRoute);
app.use('/api/amazon', amazonRouter);
app.use('/api/nickgen', nickgenRouter);
app.use('/api/signo', signoRouter);
app.use("/api/horoscopo", horoscopo);
app.use('/api/playstore', playstoreRouter);
app.use('/api/imdb', imdbRouter);
app.use('/api/imdbinfo', imdbInfoRouter);
app.use('/api/pinterest', pinterestRouter);
app.use('/api/globo', globoRouter);
app.use('/api/tekmods', tekmodsRouter);
app.use('/api/nhentai', nhentaiRouter);
app.use('/api/emoji', emojiRouter);
app.use('/api/anime', animeRouter);
app.use('/api/youtube', youtubeRouter);
app.use('/api/cep', cepRouter);
app.use('/api/poder360', poder360Router);
app.use('/api/jovempan', jovempanRouter);
app.use('/api/uol', uolRouter);
app.use('/api/ddd', dddRouter);
app.use('/api/npm', npmRouter);
app.use('/api/translator', translatorRouter);
app.use('/api/estadao', estadaoRouter);
app.use('/api/cinema', cinemaRouter);
app.use('/api/clima', climaRouter);
app.use('/api/kwai', kwaiRouter);
app.use('/api/aptoide', aptoideRoute);
app.use('/api/receita', receitaRouter);
app.use('/api/serie', serieRouter);
app.use('/api/brasileirao', brasileiraoRouter);
app.use('/api/tiktok/download', tiktokDownloadRouter);
app.use('/api/figurinhas', stickersRouter);
app.use('/api/tiktok', tiktokRouter);
app.use('/api/lyrics', lyricsRouter);
app.use('/api/wikipedia', wikipediaRouter);
app.use('/api/mercadolivre', mercadoLivreRoute);
app.use('/api/emojimix', emojimixRouter);
app.use('/api/pornhub', pornhubRouter);
app.use('/api/soundcloudsearch', soundcloudRouter);
app.use('/api/playvideo', playvideoRouter);
app.use('/api/celular', celularRouter);
app.use('/api/whatsapp-groups', whatsappGroupsRouter);
app.use('/api/ytsearch', ytsearchRouter);
app.use('/api/twitter/download', twitterDownloadRouter);
app.use('/api/facebook/download', facebookDownloadRouter);
app.use('/api/gimage', gimageRouter);
app.use('/api/xvideos', xvideosRouter);
app.use('/api/noticias', noticiasRouter);
app.use('/api/pensador', pensadorRouter);
app.use('/api/movie', movieRouter);
app.use('/api/applemusic', appleMusicRouter);
app.use('/api/dicionario', dicionarioRouter);
app.use('/api/pinterestMp4', pinterestMp4Router);
app.use('/api/tuna', tunaRouter);
// Página inicial
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '【 PUBLIC 】', 'index.html'));
});

// Middleware de erro global (NOVO - SUBSTITUA)
app.use(errorHandler);

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>404 - Página não encontrada | MAKISE API</title>
      <!-- Google Fonts para tipografia premium -->
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
      <!-- Font Awesome para ícones -->
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        :root {
          --primary: #0a0a0a;
          --accent: #c00000;
          --text: #ffffff;
          --text-muted: #a0a0a0;
        }
        body { 
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(135deg, var(--primary) 0%, #2c1a3d 100%); /* Gradiente futurista */
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          margin: 0;
          color: var(--text);
          overflow: hidden;
        }
        .container {
          text-align: center;
          background: rgba(21, 21, 21, 0.8); /* Fundo semi-transparente */
          padding: 60px 40px;
          border-radius: 20px;
          box-shadow: 0 0 30px rgba(192, 0, 0, 0.5); /* Glow vermelho neon */
          max-width: 500px;
          animation: fadeIn 1s ease-in-out;
          border: 1px solid var(--accent);
        }
        h1 { 
          font-size: 80px; 
          margin: 0 0 20px 0;
          color: var(--accent);
          text-shadow: 0 0 20px var(--accent); /* Efeito neon */
          animation: pulse 2s infinite;
        }
        p { 
          font-size: 18px; 
          margin: 0 0 20px 0;
          line-height: 1.5;
          color: var(--text-muted);
        }
        .illustration {
          font-size: 100px; /* Ícone grande como ilustração */
          color: var(--accent);
          margin-bottom: 20px;
          animation: float 3s infinite ease-in-out;
        }
        a.btn { 
          display: inline-block;
          padding: 14px 30px;
          font-size: 16px;
          color: var(--text); 
          background-color: var(--accent);
          border-radius: 50px;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 0 15px rgba(192, 0, 0, 0.5);
          margin: 10px;
        }
        a.btn:hover {
          background-color: #ff0000;
          transform: scale(1.05);
          box-shadow: 0 0 25px rgba(192, 0, 0, 0.8);
        }
        .countdown {
          font-size: 14px;
          color: var(--text-muted);
          margin-top: 20px;
        }
        /* Animações */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { text-shadow: 0 0 10px var(--accent); }
          50% { text-shadow: 0 0 30px var(--accent); }
          100% { text-shadow: 0 0 10px var(--accent); }
        }
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        @media (max-width: 480px) {
          h1 { font-size: 60px; }
          .container { padding: 40px 20px; }
          .illustration { font-size: 80px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <i class="fas fa-robot illustration"></i> <!-- Ilustração: robô perdido (ícone) -->
        <h1>404</h1>
        <p>Ops! A página que você procura não existe. Talvez ela tenha sido movida ou seja um endpoint inválido na MAKISE API.</p>
        <a href="/" class="btn">Voltar ao Início</a>
        <a href="/docs" class="btn" style="background-color: #6a0dad;">Ver Documentação</a> <!-- Link extra para API docs -->
        <div class="countdown">Redirecionando para casa em <span id="timer">5</span>s...</div>
      </div>
      <script>
        // Contador de redirecionamento automático
        let time = 5;
        const timerEl = document.getElementById('timer');
        const interval = setInterval(() => {
          time--;
          timerEl.textContent = time;
          if (time <= 0) {
            clearInterval(interval);
            window.location.href = '/';
          }
        }, 1000);
      </script>
    </body>
    </html>
  `);
});

// Iniciar limpeza periódica de arquivos antigos
setInterval(cleanupOldFiles, 60 * 60 * 1000);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Rodando em http://localhost:${PORT}`);
});
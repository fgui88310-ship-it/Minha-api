// api/endpoints/playvideo.js
import express from 'express';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PATHS } from '../config.js';

const router = express.Router();

// Controla downloads ativos
const activeDownloads = {};

router.get('/', async (req, res, next) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Passe ?url= do vídeo' });

  const idMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  const videoId = idMatch ? idMatch[1] : Date.now();

  await fs.promises.mkdir(PATHS.downloadsDir, { recursive: true });

  const finalFile = path.join(PATHS.downloadsDir, `${videoId}.mp4`);
  const tempFile = path.join(PATHS.downloadsDir, `${videoId}_temp.mp4`);

  if (activeDownloads[videoId]) {
    return res.status(409).json({ error: 'Download já em andamento para este vídeo' });
  }

  activeDownloads[videoId] = true;

  if (fs.existsSync(tempFile)) await fs.promises.unlink(tempFile);

  try {
    const cookiesPath = path.join(PATHS.cookiesYTp);
    const hasCookies = fs.existsSync(cookiesPath);

    const args = [
      '-f', 'best[ext=mp4]/best',
      '--no-playlist',
      '--newline',
      '--progress',
      '--concurrent-fragments', '8',
      '--progress-template', '[%(progress.downloaded_bytes)s/%(progress.total_bytes)s | %(progress.percent)s%% | %(speed)s | ETA: %(eta)s]',
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      '-o', tempFile,
      url
    ];

    if (hasCookies) {
      args.splice(2, 0, '--cookies', cookiesPath);
      console.log(`[PLAYVIDEO] Usando cookies.txt (${cookiesPath})`);
    }

    const ytProcess = spawn('yt-dlp', args);

    let lastBytes = 0;
    let lastTime = Date.now();

    ytProcess.stdout.on('data', (data) => {
      const str = data.toString().trim();
      console.log(`[PLAYVIDEO] ${str}`);

      // Parse do progress do yt-dlp: "[baixado_bytes/total_bytes | 45% | 2.3MiB/s | ETA: 0:40]"
      const match = str.match(/\[(\d+)\/(\d+) \| (\d+)% \| ([\d\.]+)([KMG]?)iB\/s/);
      if (match) {
        const downloaded = parseInt(match[1], 10);
        const total = parseInt(match[2], 10);
        const percent = parseInt(match[3], 10);
        const speed = parseFloat(match[4]);
        const unit = match[5];

        let speedMB = speed;
        if (unit === 'K') speedMB /= 1024;
        if (unit === 'G') speedMB *= 1024;

        console.log(`📊 Velocidade atual: ${speedMB.toFixed(2)} MB/s | ${percent}%`);
      }
    });

    ytProcess.stderr.on('data', (data) => {
      console.warn(`[PLAYVIDEO] ERRO/AVISO: ${data.toString().trim()}`);
    });

    ytProcess.on('close', async (code) => {
      delete activeDownloads[videoId];

      if (code === 0) {
        await fs.promises.rename(tempFile, finalFile);
        console.log(`[PLAYVIDEO] Download concluído: ${finalFile}`);

        res.download(finalFile, `${videoId}.mp4`, (err) => {
          if (err) console.error('[PLAYVIDEO] Erro ao enviar arquivo:', err.message);
        });
      } else {
        console.error(`[PLAYVIDEO] yt-dlp finalizou com código ${code}`);
        res.status(500).json({ error: 'Falha ao baixar vídeo. Tente com cookies.txt ou outro link.' });
      }
    });
  } catch (err) {
    delete activeDownloads[videoId];
    next(err);
  }
});

export default router;
import express from 'express';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PATHS } from '../config.js';
const router = express.Router();
const execPromise = promisify(exec);

// Configurações para autenticação (substitua pelos valores reais)
const FACEBOOK_AUTH = {
  cookies: {
    c_user: '', // Substitua pelo cookie c_user
    xs: '', // Substitua pelo cookie xs
    datr: '', // Substitua pelo cookie datr
    fr: '', // Substitua pelo cookie fr
  },
};

// Função getFbVideoInfo (copiada da sua versão anterior)
async function getFbVideoInfo(videoUrl, cookie, useragent) {
  return new Promise((resolve, reject) => {
    const headers = {
      'sec-fetch-user': '?1',
      'sec-ch-ua-mobile': '?0',
      'sec-fetch-site': 'none',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'cache-control': 'max-age=0',
      authority: 'www.facebook.com',
      'upgrade-insecure-requests': '1',
      'accept-language': 'en-GB,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,en-US;q=0.6',
      'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
      'user-agent': useragent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      cookie: cookie || '',
    };
    const parseString = (string) => JSON.parse(`{"text": "${string}"}`).text;
    if (!videoUrl || !videoUrl.trim()) return reject('Please specify the Facebook URL');
    if (!['facebook.com', 'fb.watch'].some((domain) => videoUrl.includes(domain))) return reject('Please enter the valid Facebook URL');
    axios.get(videoUrl, { headers }).then(({ data }) => {
      var _a, _b;
      data = data.replace(/"/g, '"').replace(/&/g, '&');
      const sdMatch = data.match(/"browser_native_sd_url":"(.+?)"/) || data.match(/"playable_url":"(.+?)"/) || data.match(/sd_src\s*:\s*"([^"]+)"/) || data.match(/(?<="src":")[^"](https:\/\/[^"]+)/);
      const hdMatch = data.match(/"browser_native_hd_url":"(.+?)"/) || data.match(/"playable_url_quality_hd":"(.+?)"/) || data.match(/hd_src\s*:\s*"([^"]+)"/);
      const titleMatch = data.match(/<meta\sname="description"\scontent="(.+?)"/);
      const thumbMatch = data.match(/"preferred_thumbnail":{"image":{"uri":"(.+?)"/);
      var duration = data.match(/"playable_duration_in_ms":([0-9]+)/);
      if (sdMatch && sdMatch[1]) {
        const result = {
          url: videoUrl,
          duration_ms: Number(duration?.[0]?.split(':')?.[1]) || null,
          sd: parseString(sdMatch[1]),
          hd: hdMatch && hdMatch[1] ? parseString(hdMatch[1]) : '',
          title: titleMatch && titleMatch[1] ? parseString(titleMatch[1]) : (_b = (_a = data.match(/<title>(.+?)<\/title>/)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : '',
          thumbnail: thumbMatch && thumbMatch[1] ? parseString(thumbMatch[1]) : '',
        };
        resolve(result);
      } else {
        reject('Unable to fetch video information at this time. Please try again');
      }
    }).catch((err) => {
      reject(`Unable to fetch video information. Axios Error: ${err.code} - ${err.cause}`);
    });
  });
}

// Função para converter caminho relativo em absoluto
const toAbsoluteUrl = (relativeUrl) => {
  if (relativeUrl && relativeUrl.startsWith('http')) return relativeUrl;
  return new URL(relativeUrl, 'https://www.facebook.com/').href;
};

// Função para extrair áudio com ffmpeg
async function extractAudio(videoUrl, outputFile) {
  try {
    const command = `ffmpeg -i "${videoUrl}" -vn -acodec mp3 -y "${outputFile}"`;
    await execPromise(command);
    console.log(`Áudio extraído e salvo em: ${outputFile}`);
    return outputFile;
  } catch (error) {
    console.error('Erro ao extrair áudio com ffmpeg:', error.message);
    throw error;
  }
}

// Função para baixar vídeo M3U8 com ffmpeg
async function downloadM3U8Video(videoUrl, outputFile) {
  try {
    const command = `ffmpeg -i "${videoUrl}" -c copy -bsf:a aac_adtstoasc "${outputFile}"`;
    await execPromise(command);
    console.log(`Vídeo M3U8 baixado e salvo em: ${outputFile}`);
    return outputFile;
  } catch (error) {
    console.error('Erro ao baixar vídeo M3U8 com ffmpeg:', error.message);
    throw error;
  }
}

// Endpoint para download de vídeo
router.get('/video', async (req, res, next) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Passe ?url= do Facebook');

  try {
    // Construir a string de cookies a partir de FACEBOOK_AUTH
    const cookie = Object.entries(FACEBOOK_AUTH.cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    const useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';

    // Obter metadados com getFbVideoInfo
    const videoData = await getFbVideoInfo(url, cookie, useragent);

    // Adaptar o formato de videoData para o esperado pelos endpoints
    const adaptedVideoData = {
      mediaDetails: [{
        video_info: {
          variants: [
            { content_type: 'video/mp4', url: videoData.sd },
            ...(videoData.hd ? [{ content_type: 'video/mp4', url: videoData.hd }] : []),
          ],
        },
        id_str: url.match(/(?:videos\/|v=|story_fbid=|reel\/|watch\/\?v=)([\d]+)/)?.[1] || Date.now().toString(),
        type: 'video',
      }],
      title: videoData.title || `Facebook video #${url.match(/(?:videos\/|v=|story_fbid=|reel\/|watch\/\?v=)([\d]+)/)?.[1] || Date.now()}`,
      description: videoData.title || '',
      uploader: '',
      uploader_id: '',
      timestamp: null,
      thumbnail: videoData.thumbnail || '',
      duration: videoData.duration_ms ? videoData.duration_ms / 1000 : null,
    };

    const media = adaptedVideoData.mediaDetails[0];
    const videoInfo = media.video_info || {};
    const variants = videoInfo.variants || [];

    // Prioriza MP4 (HD ou SD)
    const videoVariant = variants.find(v => v.content_type === 'video/mp4');

    if (!videoVariant) {
      return res.status(404).send('Nenhuma variante de vídeo encontrada');
    }

    const videoUrl = toAbsoluteUrl(videoVariant.url);
    const startTime = Date.now();

    // Baixa MP4 diretamente (não suporta M3U8 diretamente na função getFbVideoInfo, mas pode ser estendido)
    const stream = await axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'User-Agent': 'facebookexternalhit/1.1', // Evita rate limiting
      },
    });

    res.setHeader('Content-Disposition', `attachment; filename=video_${media.id_str || Date.now()}.mp4`);
    res.setHeader('Content-Type', 'video/mp4');

    stream.data.pipe(res);
    stream.data.on('end', () => {
      console.log(`Vídeo enviado em ${(Date.now() - startTime)/1000}s`);
    });
    stream.data.on('error', (err) => {
      console.error('Erro no stream do vídeo:', err.message);
      res.status(500).send('Erro ao enviar vídeo');
    });
  } catch (err) {
  
  next(err);
  }
});

// Endpoint para download de áudio
router.get('/audio', async (req, res, next) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Passe ?url= do Facebook');

  try {
    // Construir a string de cookies a partir de FACEBOOK_AUTH
    const cookie = Object.entries(FACEBOOK_AUTH.cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    const useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';

    // Obter metadados com getFbVideoInfo
    const videoData = await getFbVideoInfo(url, cookie, useragent);

    // Adaptar o formato de videoData para o esperado pelos endpoints
    const adaptedVideoData = {
      mediaDetails: [{
        video_info: {
          variants: [
            { content_type: 'video/mp4', url: videoData.sd },
            ...(videoData.hd ? [{ content_type: 'video/mp4', url: videoData.hd }] : []),
          ],
        },
        id_str: url.match(/(?:videos\/|v=|story_fbid=|reel\/|watch\/\?v=)([\d]+)/)?.[1] || Date.now().toString(),
        type: 'video',
      }],
      title: videoData.title || `Facebook video #${url.match(/(?:videos\/|v=|story_fbid=|reel\/|watch\/\?v=)([\d]+)/)?.[1] || Date.now()}`,
      description: videoData.title || '',
      uploader: '',
      uploader_id: '',
      timestamp: null,
      thumbnail: videoData.thumbnail || '',
      duration: videoData.duration_ms ? videoData.duration_ms / 1000 : null,
    };

    const media = adaptedVideoData.mediaDetails[0];
    const videoInfo = media.video_info || {};
    const variants = videoInfo.variants || [];

    // Prioriza MP4 (HD ou SD)
    const videoVariant = variants.find(v => v.content_type === 'video/mp4');

    if (!videoVariant) {
      return res.status(404).send('Nenhuma variante de vídeo encontrada');
    }

    const videoUrl = toAbsoluteUrl(videoVariant.url);
    const startTime = Date.now();

    // Extrai áudio com ffmpeg
    const tempAudioFile = path.join(PATHS.downloadsDir, `temp_audio_${media.id_str || Date.now()}.mp3`);
    await extractAudio(videoUrl, tempAudioFile);

    res.setHeader('Content-Disposition', `attachment; filename=audio_${media.id_str || Date.now()}.mp3`);
    res.setHeader('Content-Type', 'audio/mpeg');

    const stream = (await fs.open(tempAudioFile, 'r')).createReadStream();
    stream.pipe(res);
    stream.on('end', async () => {
      console.log(`Áudio enviado em ${(Date.now() - startTime)/1000}s`);
      await fs.unlink(tempAudioFile).catch(err => console.error('Erro ao deletar arquivo temporário:', err.message));
    });
    stream.on('error', (err) => {
      console.error('Erro no stream do áudio:', err.message);
      res.status(500).send('Erro ao enviar áudio');
    });
  } catch (err) {
    next(err);
  }
});

export default router;
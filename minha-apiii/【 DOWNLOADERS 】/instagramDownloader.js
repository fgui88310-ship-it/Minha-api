// No instagramDownloader.js
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { PATHS } from '../config.js';

export async function downloadInstagramMedia(url, type = 'video') {
  const cleanUrl = url.split('?')[0];
  console.log('🔍 [DOWNLOAD] URL limpa:', cleanUrl);

  if (!fs.existsSync(PATHS.cookiesInsta)) {
    return { error: 'Arquivo de cookies não encontrado' };
  }

  const outputTemplate = path.join(PATHS.downloadsDir, '%(id)s.%(ext)s');

  // Comando yt-dlp com extração e conversão do áudio para mp3 se for audio
  let command = [
    'yt-dlp',
    `"${cleanUrl}"`,
    `--cookies "${PATHS.cookiesInsta}"`,
    `-o "${outputTemplate}"`,
    `--format "bestvideo+bestaudio/best"`,
    `--merge-output-format mp4`,
    `--no-progress`
  ];

  if (type === 'audio') {
    command.push('--extract-audio', '--audio-format', 'mp3', '--audio-quality', '192K');
  }
  
  command = command.join(' ');

  try {
    console.time('yt-dlp-download');
    execSync(command, { stdio: 'inherit', timeout: 60000 });
    console.timeEnd('yt-dlp-download');
    console.log('✅ [DOWNLOAD] Concluído com sucesso!');

    // Após o download, identifica o arquivo baixado
    // Assume que o arquivo tem o id do vídeo no nome; vamos extrair com yt-dlp info básico
    const infoJson = execSync(`yt-dlp --cookies "${PATHS.cookiesInsta}" --dump-json "${cleanUrl}"`, { encoding: 'utf8' });
    const info = JSON.parse(infoJson);
    const id = info.id;
    let filePath;

    if (type === 'audio') {
      filePath = path.join(PATHS.downloadsDir, `${id}.mp3`);
    } else {
      filePath = path.join(PATHS.downloadsDir, `${id}.mp4`);
    }

    if (!fs.existsSync(filePath)) {
      return { error: 'Arquivo não foi criado' };
    }

    return type === 'audio' ? { audio: filePath } : { video: filePath };
  } catch (error) {
    console.error('❌ [DOWNLOAD] Erro:', error.message);
    return { error: error.message };
  }
}
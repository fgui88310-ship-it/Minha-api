import ffmpeg from 'fluent-ffmpeg';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export async function convertHlsToMp3(hlsUrl, outputPath) { // <- export aqui
  return new Promise((resolve, reject) => {
    ffmpeg(hlsUrl)
      .outputOptions('-c:a mp3')
      .outputOptions('-b:a 128k')
      .outputOptions('-preset ultrafast')
      .output(outputPath)
      .on('end', () => {
        console.log('[SCRAPER] Conversão para MP3 concluída:', outputPath);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('[SCRAPER] Erro ao converter HLS para MP3:', err.message);
        reject(err);
      })
      .run();
  });
}
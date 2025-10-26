import { execSync } from 'child_process';
import fs from 'fs';
import { PATHS } from '../config.js';
export async function fetchInstagramPost(url) {
  // ✅ LIMPA URL (remove ?igsh=...)
  const cleanUrl = url.split('?')[0];
  console.log('🔍 [SCRAPER] URL limpa:', cleanUrl);
  
  if (!fs.existsSync(PATHS.cookiesInsta)) {
    console.error('❌ [COOKIES] NÃO ENCONTRADO');
    return null;
  }
  
  console.log('✅ [COOKIES] OK');

  const command = `yt-dlp --dump-json "${cleanUrl}" --no-download --cookies "${PATHS.cookiesInsta}"`;
  
  try {
    console.time('ytdlp');
    const jsonOutput = execSync(command, { encoding: 'utf8', timeout: 30000 });
    console.timeEnd('ytdlp');

    const videoInfo = JSON.parse(jsonOutput);
    
    console.log('🎯 [SUCESSO] ID:', videoInfo.id);
    console.log('📹 [TITLE]:', videoInfo.title);
    console.log('📊 [FORMATOS]:', videoInfo.formats?.length || 0);

    // ✅ FORMATO COMPATÍVEL - MAIS FLEXÍVEL
    const videoFormats = videoInfo.formats
      .filter(f => f.vcodec !== 'none' && f.url)  // Só vídeos
      .map(f => ({
        url: f.url,  // ✅ MINÚSCULO
        vcodec: f.vcodec_name || f.vcodec || 'vp09',
        acodec: f.acodec_name || f.acodec || 'none',
        quality: f.format_note || `${f.height}p` || 'HD'
      }));

    const audioFormat = videoInfo.formats
      .find(f => f.acodec !== 'none' && f.vcodec === 'none');

    console.log('✅ [VIDEOS]:', videoFormats.length);
    console.log('✅ [AUDIO]:', !!audioFormat);

    return {
      id: videoInfo.id,
      title: videoInfo.title,
      formats: videoFormats,  // ✅ Array com url minúsculo
      audio_url: audioFormat?.url || null,  // ✅ MINÚSCULO
      type: 'video',
      duration: videoInfo.duration
    };

  } catch (err) {
    console.error('💥 [ERRO]:', err.message);
    return null;
  }
}
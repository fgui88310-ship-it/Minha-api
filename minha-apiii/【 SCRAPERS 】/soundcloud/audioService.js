import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';
import { getClientId, updateClientId } from './clientService.js';
import { getHeaders } from './headerService.js';
import { convertHlsToMp3 } from '../../【 UTILS 】/ffmpegHelper.js';
import { getMp3Cache, setMp3Cache } from './cacheService.js';
import { PATHS } from '../../config.js';
export async function getAudioLink(trackData) {
  const clientId = await getClientId();
  const headers = await getHeaders();

  const transcodings = trackData.media?.transcodings || [];
  const formats = [];

  for (const t of transcodings) {
    const streamUrl = `${t.url}?client_id=${clientId}`;
    try {
      const { data } = await axios.get(streamUrl, { headers, timeout: 3000 });
      if (data?.url) {
        const type = t.format?.protocol === 'hls' ? 'hls' : 'progressive';
        formats.push({ url: data.url, type });
      }
    } catch {}
  }

  if (!formats.length) return null;

  const best = formats.find(f => f.type === 'progressive') || formats[0];
  if (best.type === 'hls') {
    const trackId = trackData.id?.toString();
    const cachedMp3 = getMp3Cache(trackId);
    if (cachedMp3) {
      return { url: `/downloads/${trackId}.mp3`, isLocal: true };
    }

    const dir = path.join(PATHS.downloadsDir);
    const file = path.join(dir, `${trackId}.mp3`);
    await convertHlsToMp3(best.url, file);
    setMp3Cache(trackId, file);

    return { url: `/downloads/${trackId}.mp3`, isLocal: true };
  }

  return { url: best.url, isLocal: false };
}

import axios from 'axios';
import { parseAppleMusicResults } from '../【 UTILS 】/appleMusicParser.js';

export async function searchAppleMusic(query, limit) {
  const searchUrl = `https://music.apple.com/us/search?term=${encodeURIComponent(query)}`;

  const { data } = await axios.get(searchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    },
    timeout: 5000,
  });

  return parseAppleMusicResults(data, limit);
}
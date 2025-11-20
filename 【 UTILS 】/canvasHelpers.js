import axios from 'axios';
import { loadImage } from 'canvas';

export async function loadBackground(ctx, width, height, url) {
  const buffer = await axios.get(url, { responseType: 'arraybuffer' });
  const img = await loadImage(buffer.data);

  ctx.globalAlpha = 0.6;
  ctx.drawImage(img, 0, 0, width, height);
  ctx.globalAlpha = 1;
}
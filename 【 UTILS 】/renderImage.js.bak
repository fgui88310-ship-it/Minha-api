import { createCanvas, loadImage } from 'canvas';
import axios from 'axios';
import { wrapText } from './wrapText.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BACKGROUND_URL } from './constants.js';

export async function renderNameImage(name, info) {
  const width = CANVAS_WIDTH;
  const height = CANVAS_HEIGHT;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fundo
  const bgBuffer = (await axios.get(BACKGROUND_URL, { responseType: 'arraybuffer' })).data;
  const bgImage = await loadImage(bgBuffer);

  ctx.globalAlpha = 0.6;
  ctx.drawImage(bgImage, 0, 0, width, height);
  ctx.globalAlpha = 1.0;

  // Retângulo escuro
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(20, 20, width - 40, height - 40, 30);
  ctx.fill();

  // Estilo do texto
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;

  const maxWidth = width - 80;
  const maxHeight = height - 40;
  const lineHeight = 40;
  const maxLines = 3;

  ctx.font = 'bold 60px Arial';
  ctx.fillText(name.toUpperCase(), width / 2, 100);

  ctx.font = 'italic 28px Georgia';
  let y = wrapText(ctx, info.significado, width / 2, 160, maxWidth, lineHeight, maxLines, maxHeight);

  ctx.font = '24px Arial';
  const lines = [
    `Gênero: ${info.genero}`,
    `Uso: ${info.uso}`,
    `Pronúncia: ${info.pronuncia}`,
    `Popularidade: ${info.popularidade.split('\n')[0]}`,
    `Categorias: ${info.categorias}`
  ];

  y += lineHeight;

  for (const line of lines) {
    y = wrapText(ctx, line, width / 2, y, maxWidth, lineHeight, maxLines, maxHeight);
    y += 10;
  }

  return canvas.toBuffer('image/png');
}
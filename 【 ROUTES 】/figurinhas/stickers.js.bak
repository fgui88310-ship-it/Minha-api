// api/endpoints/stickers.js
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { PATHS } from '../config.js';
const router = express.Router();

// Lista de pastas válidas
const STICKER_FOLDERS = [
  'figu-animais',
  'figu-anime',
  'figu-coreana',
  'figu-desenho',
  'figu-engracada',
  'figu-flork',
  'figu-meme',
  'figu-raiva',
  'figu-random',
  'figu-roblox',
];

// Função para pegar uma figurinha aleatória
async function getRandomSticker(folderName) {
  const folderPath = path.join(PATHS.downloadsDir, folderName);
  try {
    const files = await fs.readdir(folderPath);
    if (!files.length) return null;
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return path.join(folderPath, randomFile);
  } catch (err) {
    console.error(`[STICKER] Erro ao acessar pasta ${folderName}:`, err.message);
    return null;
  }
}

// Criando endpoints dinamicamente
STICKER_FOLDERS.forEach(folder => {
  router.get(`/${folder}`, async (req, res) => {
    const stickerPath = await getRandomSticker(folder);
    if (!stickerPath) return res.status(404).json({ error: 'Nenhuma figurinha encontrada' });
    res.sendFile(stickerPath);
  });
});

export default router;
// api/endpoints/name.js
import express from 'express';
import { createCanvas, loadImage } from 'canvas';
import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.get('/', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Falta ?name=' });

  const safeName = name.trim();

  try {
    // === BUSCAR INFORMAÇÕES DO NOME ===
    const url = `https://www.behindthename.com/name/${encodeURIComponent(safeName.toLowerCase())}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Extrair informações
    const genero = $('.infoname-info .masc').text() || 'Gênero não identificado';
    const uso = $('.infoname-info .usg').text() || 'Uso não identificado';
    const pronuncia = $('#infoname-info-pron').text().split('[')[0].trim() || 'Pronúncia não disponível';
    const significado = $('.namedef').text().split('[')[0].trim() || 'Significado não disponível';
    const nomesRelacionados = $('.infogroup.relblurb').text().replace(/\s+/g, ' ').trim() || 'Sem nomes relacionados';
    const popularidade = $('.popblurb .regionlink')
      .map((i, el) => {
        const region = $(el).find('.svgtitle').text();
        const rank = $(el).find('title').text().replace('Last ranked', '').trim();
        return `${region}: ${rank}`;
      })
      .get()
      .join('\n') || 'Sem dados de popularidade';
    const percepcao = $('.ratingblurb').text().replace(/\s+/g, ' ').trim() || 'Sem percepções registradas';
    const categorias = $('.tagblurb').text().replace(/\s+/g, ', ').trim() || 'Sem categorias';

    // === CONFIGURAÇÃO DO CANVAS ===
    const width = 800;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // === BAIXAR E CARREGAR IMAGEM DE FUNDO ===
    const backgroundUrl = 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // Imagem estilizada (exemplo)
    const backgroundImageResponse = await axios.get(backgroundUrl, { responseType: 'arraybuffer' });
    const backgroundImage = await loadImage(backgroundImageResponse.data);

    // Desenhar imagem de fundo com leve opacidade
    ctx.globalAlpha = 0.6;
    ctx.drawImage(backgroundImage, 0, 0, width, height);
    ctx.globalAlpha = 1.0;

    // === FUNDO SEMI-TRANSPARENTE PARA O CONTEÚDO ===
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(20, 20, width - 40, height - 40, 30);
    ctx.fill();

    // === ESTILOS DE TEXTO ===
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Título (Nome)
    ctx.font = 'bold 60px "Arial", sans-serif';
    ctx.fillText(safeName.toUpperCase(), width / 2, 100);

    // Subtítulo (Significado)
    ctx.font = 'italic 28px "Georgia", serif';
    ctx.fillText(significado, width / 2, 160);

    // Informações adicionais (layout em linhas)
    ctx.font = '24px "Arial", sans-serif';
    const infoLines = [
      `Gênero: ${genero}`,
      `Uso: ${uso}`,
      `Pronúncia: ${pronuncia}`,
      `Popularidade: ${popularidade.split('\n')[0] || 'N/A'}`,
      `Categorias: ${categorias}`,
    ];

    const lineHeight = 40;
    let yPosition = 220;
    infoLines.forEach((line) => {
      ctx.fillText(line, width / 2, yPosition);
      yPosition += lineHeight;
    });

    // === GERAR IMAGEM PNG ===
    const buffer = canvas.toBuffer('image/png');

    // === ENVIAR IMAGEM DIRETAMENTE ===
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);

  } catch (err) {
    console.error('[ERROR] Falha ao processar o nome:', err.message);
    res.status(500).json({ error: 'Erro no servidor: ' + err.message });
  }
});

export default router;
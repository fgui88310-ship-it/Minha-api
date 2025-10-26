// api/endpoints/dicionario.js
import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { palavra } = req.query;
  if (!palavra) return res.status(400).json({ error: 'Passe ?palavra= para buscar no Dicio' });

  const word = palavra.toLowerCase().replace(/\s+/g, '-');
  const url = `https://www.dicio.com.br/${encodeURIComponent(word)}/`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Extrai definições
    const definicoes = [];
    $('p.significado.textonovo').find('span.cl, span:not(.etim)').each((i, el) => {
      const texto = $(el).text().trim();
      if (texto && !texto.startsWith('Etimologia')) definicoes.push(texto);
    });

    // Extrai exemplos
    const exemplos = [];
    $('div.wrap-section h3.tit-exemplo:contains("Exemplos com a palavra")')
      .next('div.frases')
      .find('div.frase')
      .each((i, el) => exemplos.push($(el).text().trim().replace(/\s+/g, ' ')));

    // Imagem da palavra
    const imagem = $('picture img.imagem-palavra').attr('src') || `https://s.dicio.com.br/${word}.jpg`;

    if (definicoes.length === 0 && exemplos.length === 0) {
      return res.status(404).json({ error: `Nenhuma definição ou exemplo encontrado para "${palavra}"` });
    }

    res.json({
      palavra: palavra,
      definicoes: definicoes,
      exemplos: exemplos,
      imagem: imagem
    });

  } catch (error) {
    next(error);
  }
});

export default router;
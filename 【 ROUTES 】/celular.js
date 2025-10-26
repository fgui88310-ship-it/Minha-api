import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

// Cotação do dólar
const DOLAR_PARA_REAL = 5.2;

// Converte preço em dólar para reais
function converterDolarParaReal(preco) {
  const valorNumerico = parseFloat(preco.replace(/[^0-9.]/g, ''));
  if (isNaN(valorNumerico)) return 'Preço inválido';
  return `R$ ${(valorNumerico * DOLAR_PARA_REAL).toFixed(2)}`;
}

// Função para buscar celular no GSMArena
async function buscarCelular(termoBusca) {
  try {
    const baseUrl = 'https://www.gsmarena.com.in';
    const termoFormatado = termoBusca.replace(/\s+/g, '+');
    const searchUrl = `${baseUrl}/search-products?search=${termoFormatado}&section_id=`;
    
    const { data } = await axios.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);
    const celularElement = $('.product.product-2').first();
    if (!celularElement.length) return null;

    const nome = celularElement.find('.item-title a').text().trim() || 'Nome não disponível';
    const relativeLink = celularElement.find('.item-title a').attr('href');
    const link = relativeLink ? new URL(relativeLink, baseUrl).href : null;
    const imagem = celularElement.find('.item-img-wrapper-link img').attr('src') || 'Imagem não disponível';
    const preco = celularElement.find('.btn.btn-outline-primary').filter((i, el) => $(el).text().includes('$')).text().trim() || 'Preço não disponível';

    const especificacoes = {};
    celularElement.find('.par-2 p').each((i, el) => {
      const specText = $(el).html().split('<br>').map(text => cheerio.load(text).text().trim());
      specText.forEach(spec => {
        const [chave, valor] = spec.split(':').map(s => s.trim());
        if (chave && valor) {
          const traducoes = {
            'Display Size': 'Tamanho da Tela',
            'Primary Camera': 'Câmera Principal',
            'Battery Capacity': 'Capacidade da Bateria',
            'Ram': 'Memória RAM'
          };
          especificacoes[traducoes[chave] || chave] = valor;
        }
      });
    });

    return {
      Nome: nome,
      Link: link,
      Imagem: imagem,
      Preço: preco,
      PreçoEmReais: converterDolarParaReal(preco),
      Especificações: especificacoes
    };
  } catch (err) {
    console.error('Erro ao buscar celular:', err.message);
    return null;
  }
}

// Endpoint de celular
router.get('/', async (req, res, next) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Passe ?query=nome_do_celular' });

  try {
    const resultado = await buscarCelular(query);
    if (!resultado) return res.status(404).json({ error: 'Celular não encontrado' });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

export default router;
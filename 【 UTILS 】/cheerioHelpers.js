// utils/cheerioHelpers.js
import * as cheerio from 'cheerio';

export function extrairEspecificacoes($, element) {
  const especificacoes = {};
  
  element.find('.par-2 p').each((_, el) => {
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

  return especificacoes;
}
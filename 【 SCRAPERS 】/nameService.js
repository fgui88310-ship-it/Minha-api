import axios from 'axios';
import * as cheerio from 'cheerio';

export async function fetchNameInfo(name) {
  const safeName = name.trim().toLowerCase();
  const url = `https://www.behindthename.com/name/${encodeURIComponent(safeName)}`;

  const response = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
    },
    timeout: 15000
  });

  const $ = cheerio.load(response.data);

  return {
    genero: $('.infoname-info .masc').text() || 'Gênero não identificado',
    uso: $('.infoname-info .usg').text() || 'Uso não identificado',
    pronuncia: $('#infoname-info-pron').text().split('[')[0].trim() || 'Pronúncia não disponível',
    significado: $('.namedef').text().split('[')[0].trim() || 'Significado não disponível',
    nomesRelacionados: $('.infogroup.relblurb').text().replace(/\s+/g, ' ').trim() || 'Sem nomes relacionados',
    popularidade:
      $('.popblurb .regionlink')
        .map((i, el) => {
          const region = $(el).find('.svgtitle').text();
          const rank = $(el).find('title').text().replace('Last ranked', '').trim();
          return `${region}: ${rank}`;
        })
        .get()
        .join('\n') || 'Sem dados de popularidade',
    percepcao: $('.ratingblurb').text().replace(/\s+/g, ' ').trim() || 'Sem percepções registradas',
    categorias: $('.tagblurb').text().replace(/\s+/g, ', ').trim() || 'Sem categorias'
  };
}
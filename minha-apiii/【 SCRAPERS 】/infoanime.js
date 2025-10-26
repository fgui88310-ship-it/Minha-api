import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import { INFOANIME_BASE_URL } from '../config.js';

export async function searchInfoAnime(query, limit = 5) {
  const url = `${INFOANIME_BASE_URL}/pesquisa?pesq=${encodeURIComponent(query)}&pesquisar=`;
  const html = await fetchHTML(url);

  const $ = cheerio.load(html);
  const results = [];

  const sections = [
    { type: 'Anime', title: 'Anime' },
    { type: 'Mangá', title: 'Mangá' },
    { type: 'Mangá 18+', title: 'Mangá 18+' }
  ];

  for (const section of sections) {
    const links = extractLinks($, section.title, limit);
    for (const link of links) {
      const idMatch = $(link).attr('href').match(/obra=(\d+)/);
      if (!idMatch) continue;
      const id = idMatch[1];
      const details = await getInfoAnimeDetails(id, section.type);
      const title = $(link).contents().filter((_, el) => el.type === 'text').text().trim();
      results.push({
        source: 'InfoAnime',
        type: section.type,
        id,
        title,
        alt_titles: details.alt_titles,
        image: details.image,
        synopsis: details.summary,
        episodes_or_chapters: details.episodes_or_chapters,
        aired_or_published: details.season_or_published,
        genres: details.genres,
        studios_or_publishers: [details.studio_or_publisher],
        fansubs: details.fansubs,
      });
    }
  }

  return results;
}

async function fetchHTML(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`Falha ao buscar: ${res.status}`);
  return res.text();
}

function extractLinks($, sectionTitle, limit) {
  const links = [];
  const container = $('div.canto_10.bg_br_t > div[style="margin: 20px 30px"]');
  if (!container.length) return links;

  let currentSection = null;
  container.children().each((_, el) => {
    if ($(el).hasClass('titulo1') && $(el).text().trim() === sectionTitle) currentSection = sectionTitle;
    else if ($(el).hasClass('titulo1') && currentSection) currentSection = null;
    else if (currentSection && $(el).is('a[href^="dados?obra="]')) links.push(el);
  });

  return links.slice(0, limit);
}

// getInfoAnimeDetails mantém basicamente igual, mas sem logs excessivos
export async function getInfoAnimeDetails(id, type) {
  const html = await fetchHTML(`${INFOANIME_BASE_URL}/dados?obra=${id}`);
  const $ = cheerio.load(html);

  // extrai os detalhes necessários
  const genres = [];
  $('b:contains("Gênero:")').nextUntil('b').find('a').each((_, el) => genres.push($(el).text().trim()));

  const episodes_or_chapters = parseInt(html.match(/(?:Número de Episódios|Capítulos):\s*(\d+)/i)?.[1] || '0', 10);
  const season_or_published = $('b:contains("Temporada:")').next('a').text().trim() || 'Unknown';
  const studio_or_publisher = $('b:contains("Estúdio:")').next('a').text().trim() || 'Unknown';
  const summary = $('b:contains("Resumo:")').nextUntil('b').text().trim() || 'No summary available';
  const alt_titles = $('b:contains("Outros Títulos:")').nextUntil('b').text().split(',').map(t => t.trim()).filter(Boolean);

  const image = $('meta[property="og:image"]').attr('content') || null;
  const fansubs = []; // simplificado

  return { genres, episodes_or_chapters, season_or_published, studio_or_publisher, summary, alt_titles, image, fansubs };
}
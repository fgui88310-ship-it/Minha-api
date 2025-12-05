// 【 SERVICES 】/youtube-service.js — Patch 2025 v3
import axios from "axios";
import { extractVideoId } from "../【 UTILS 】/youtube-parser.js";
import {
  youtubeSearchRequest,
  youtubePlayerRequest
} from "../【 UTILS 】/youtube-fetch.js";

// Ativar logs → DEBUG=true na URL?debug
const DEBUG = false;

/** 🧠 Logs inteligentes */
function log(...args) {
  if (DEBUG) console.log(...args);
}

/** 1️⃣ Pega dados completos do player API */
async function obterDetalhesVideo(videoId) {
  const data = await youtubePlayerRequest(videoId);

  const details = data.videoDetails || {};
  const micro = data.microformat?.playerMicroformatRenderer || {};

  log("🎥 Player Title:", details.title);
  log("👀 Player Views:", details.viewCount);

  return {
    title: details.title || null,
    views: parseInt(details.viewCount ?? micro.viewCount ?? 0) || null,
    duration: parseInt(details.lengthSeconds || 0) || null,
    description: details.shortDescription || null,
    channel: details.author || null,
    channelId: details.channelId || null,
    published: micro.publishDate || null,
    thumbnails: details.thumbnail?.thumbnails || []
  };
}

/** 2️⃣ Fallbacks: oEmbed + HTML scrape */
async function preencherFallbacks(video) {
  // → oEmbed (preenche título/canal/thumbnail)
  if (!video.title || video.thumbnails.length === 0) {
    try {
      const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(video.url)}`;
      const { data } = await axios.get(url);

      video.title ||= data.title;
      video.channel ||= data.author_name;

      if (!video.thumbnails.length && data.thumbnail_url) {
        video.thumbnails = [{ url: data.thumbnail_url }];
      }

      log("🧩 oEmbed aplicado!");
    } catch (err) {
      log("⚠ oEmbed falhou:", err.message);
    }
  }

  // → Scrape da página para views
  if (!video.views) {
    try {
      const html = await axios.get(video.url).then(r => r.data);
      const match = html.match(/"viewCount":"?(\d+)"/);
      if (match) {
        video.views = parseInt(match[1]);
        log("🔎 Views por HTML!", video.views);
      }
    } catch (err) {
      log("⚠ HTML scrape falhou:", err.message);
    }
  }

  return video;
}

/** 3️⃣ Busca por query se não vier ID */
async function buscarVideoPorQuery(query) {
  const data = await youtubeSearchRequest(query);

  const sections = data.contents?.twoColumnSearchResultsRenderer
    ?.primaryContents?.sectionListRenderer?.contents || [];

  for (const section of sections) {
    const items =
      section.itemSectionRenderer?.contents ||
      section.richSectionRenderer?.content?.richShelfRenderer?.contents ||
      [];

    for (const item of items) {
      const v =
        item.videoRenderer ||
        item.compactVideoRenderer ||
        item.richItemRenderer?.content?.videoRenderer;

      if (v?.videoId) {
        log("🔍 Encontrado:", v.videoId);
        return {
          videoId: v.videoId,
          thumbs: v.thumbnail?.thumbnails || []
        };
      }
    }
  }

  return null;
}

/** 🚀 Função principal da API */
export async function fetchYouTubeData(queryOrUrl, debug = false) {
  if (debug) DEBUG = true;

  const start = Date.now();
  let videoId = extractVideoId(queryOrUrl);
  let thumbs = [];

  try {
    // Buscar se não for ID nem URL de vídeo
    if (!videoId) {
      const encontrado = await buscarVideoPorQuery(queryOrUrl);
      if (!encontrado) return null;
      videoId = encontrado.videoId;
      thumbs = encontrado.thumbs;
    }

    // Player API
    let video = await obterDetalhesVideo(videoId);
    video.videoId = videoId;
    video.url = `https://www.youtube.com/watch?v=${videoId}`;

    // Não sobrescrever thumbs existentes!
    if (!video.thumbnails?.length && thumbs?.length) {
      video.thumbnails = thumbs;
    }

    // Fallbacks finais
    video = await preencherFallbacks(video);

    // Normalização
    video.title ||= "Sem título";
    video.views ||= 0;

    return {
      ...video,
      success: true,
      searchTimeMs: Date.now() - start
    };

  } catch (err) {
    console.error("[YouTubeService] Erro:", err.message);
    return { success: false, error: err.message };
  }
}
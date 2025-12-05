// 【 SERVICES 】/youtube-service.js  ← VERSÃO CORRIGIDA 2025
import axios from "axios";
import { extractVideoId } from "../【 UTILS 】/youtube-parser.js";
import { youtubeSearchRequest } from "../【 UTILS 】/youtube-fetch.js";

// 📌 Função auxiliar (fica fora do try)
async function obterDetalhesVideo(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}&pbj=1`;
  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  const player = data[2]?.playerResponse ?? data[3]?.playerResponse;

  return {
    title: player?.videoDetails?.title || null,
    views: player?.videoDetails?.viewCount
      ? Number(player.videoDetails.viewCount)
      : null,
    duration: player?.videoDetails?.lengthSeconds
      ? Number(player.videoDetails.lengthSeconds)
      : null,
    description: player?.videoDetails?.shortDescription || null,
    channel: player?.videoDetails?.author || null,
    channelId: player?.videoDetails?.channelId || null,
    published: player?.microformat?.playerMicroformatRenderer?.publishDate || null,
  };
}

// 📌 Fallback de dados ausentes
async function fillFallbacksIfNeeded(result) {
  // oEmbed
  if (!result.title || result.thumbnails.length === 0) {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(result.url)}&format=json`;
      const r = await axios.get(oembedUrl);
      const o = r.data;

      result.title = result.title ?? o.title;
      result.channel = result.channel ?? o.author_name;
      if (!result.thumbnails.length && o.thumbnail_url) {
        result.thumbnails = [{ url: o.thumbnail_url }];
      }
    } catch {}
  }

  // Scrape da página para views
  if (!result.views) {
    try {
      const watchHtml = await axios.get(result.url).then(r => r.data);
      const m = watchHtml.match(/"viewCount":"?(\d+)"/);
      if (m) result.views = Number(m[1]);
    } catch {}
  }

  return result;
}

// 📌 FUNÇÃO PRINCIPAL
export async function fetchYouTubeData(queryOrUrl) {
  const start = Date.now();
  let videoId = extractVideoId(queryOrUrl);
  let thumbs = [];

  try {
    // → Se não veio ID → busca
    if (!videoId) {
      const data = await youtubeSearchRequest(queryOrUrl);

      const sections = data.contents?.twoColumnSearchResultsRenderer
        ?.primaryContents?.sectionListRenderer?.contents || [];

      for (const section of sections) {
        const items =
          section.itemSectionRenderer?.contents ||
          section.richSectionRenderer?.content?.richShelfRenderer?.contents ||
          [];

        for (const item of items) {
          const video =
            item.videoRenderer ||
            item.compactVideoRenderer ||
            item.richItemRenderer?.content?.videoRenderer;

          if (video?.videoId) {
            videoId = video.videoId;
            thumbs = video.thumbnail?.thumbnails || thumbs;
            break;
          }
        }
        if (videoId) break;
      }

      if (!videoId) return null;
    }

    // 2️⃣ Pega dados completos
    let result = await obterDetalhesVideo(videoId);

    result.url = `https://www.youtube.com/watch?v=${videoId}`;
    result.videoId = videoId;
    result.thumbnails = thumbs;

    // 3️⃣ Completa dados faltando
    result = await fillFallbacksIfNeeded(result);

    // 4️⃣ Normaliza
    result.title ??= "Sem título";
    result.views ??= 0;

    result.searchTimeMs = Date.now() - start;
    result.success = true;

    return result;

  } catch (err) {
    console.error("[YouTubeService] Erro:", err.message);
    return { success: false, error: err.message };
  }
}
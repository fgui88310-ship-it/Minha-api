// 【 SERVICES 】/youtube-service.js  ← VERSÃO CORRIGIDA 2025
import axios from "axios";
import { extractVideoId } from "../【 UTILS 】/youtube-parser.js";
import { youtubeSearchRequest, youtubePlayerRequest} from "../【 UTILS 】/youtube-fetch.js";

// 📌 Função auxiliar (fica fora do try)
async function obterDetalhesVideo(videoId) {
  const data = await youtubePlayerRequest(videoId);
  const player = data;

  const micro = player.microformat?.playerMicroformatRenderer;

  return {
    title: player.videoDetails?.title || "Sem título",
    views: Number(
      player.videoDetails?.viewCount ||
      micro?.viewCount ||
      0
    ),
    duration: Number(player.videoDetails?.lengthSeconds || 0),
    description: player.videoDetails?.shortDescription || "",
    channel: player.videoDetails?.author || "Desconhecido",
    channelId: player.videoDetails?.channelId || null,
    published: micro?.publishDate || null,
    thumbnails: player.videoDetails?.thumbnail?.thumbnails || []
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
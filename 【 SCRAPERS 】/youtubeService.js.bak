// 【 SERVICES 】/youtube-service.js  ← VERSÃO FINAL DEZEMBRO 2025

import { extractVideoId } from "../【 UTILS 】/youtube-parser.js";
import { youtubeSearchRequest, youtubePlayerRequest } from "../【 UTILS 】/youtube-fetch.js";

export async function fetchYouTubeData(queryOrUrl) {
  const start = Date.now();
  let videoId = extractVideoId(queryOrUrl);

  try {
    // 1. Se não for link/ID direto → busca
    if (!videoId) {
  const data = await youtubeSearchRequest(queryOrUrl);

  const sections = data.contents?.twoColumnSearchResultsRenderer?.primaryContents
    ?.sectionListRenderer?.contents || [];

  let foundId = null;

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
        foundId = video.videoId;
        break;
      }
    }

    // só sai do laço NESTE momento
    if (foundId) break;
  }

  if (!foundId) {
    return null;
  }

  videoId = foundId;
}

    // 2. Pega os detalhes reais do vídeo
    const playerData = await youtubePlayerRequest(videoId);
    // Assumindo que você já tem: const playerData = await youtubePlayerRequest(videoId);
const vd = playerData?.videoDetails || {};
const micro = playerData?.microformat?.playerMicroformatRenderer || {};
const startMs = start || Date.now();

// DEBUG: log mínimo para ver o que realmente chegou
console.log("[YouTubeService] playerData keys:", Object.keys(playerData || {}));
if (!playerData || Object.keys(playerData).length === 0) {
  console.warn("[YouTubeService] playerData vazio para", videoId);
}

// Primary result with safe fallbacks
let result = {
  success: true,
  title: vd.title ?? null,
  videoId: vd.videoId ?? videoId,
  url: `https://www.youtube.com/watch?v=${vd.videoId ?? videoId}`,
  description: vd.shortDescription ?? "",
  duration: vd.isLiveContent ? "AO VIVO" : (vd.lengthSeconds ? `${vd.lengthSeconds}s` : null),
  views: (vd.viewCount ? Number(vd.viewCount) : null),
  channel: vd.author ?? null,
  channelId: vd.channelId ?? null,
  thumbnails: (vd.thumbnail?.thumbnails || []).slice().sort((a, b) => (b.width||0)-(a.width||0)),
  published: micro.uploadDate ?? micro.publishDate ?? null,
  searchTimeMs: Date.now() - startMs,
};

// Se faltou título ou thumbs ou views, tenta fallbacks externos
async function fillFallbacksIfNeeded(res) {
  // 1) oEmbed (rápido) — pega title, author_name, thumbnail_url
  if (!res.title || !res.thumbnails.length) {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(res.url)}&format=json`;
      const r = await fetch(oembedUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (r.ok) {
        const o = await r.json();
        res.title = res.title ?? o.title;
        res.channel = res.channel ?? o.author_name;
        if (!res.thumbnails.length && o.thumbnail_url) {
          res.thumbnails = [{ url: o.thumbnail_url }];
        }
      }
    } catch (e) {
      console.warn("[YouTubeService] oEmbed falhou:", e.message);
    }
  }

  // 2) Scrape simples da página watch para viewCount (quando playerData não trouxe)
  if (res.views === null || res.views === 0) {
    try {
      const watchHtml = await (await fetch(res.url, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
      // tenta extrair "viewCount" a partir do JSON inline (regex)
      const m = watchHtml.match(/"viewCount":"?(\d+)"?/);
      if (m) res.views = Number(m[1]);
      else {
        // alternativa: procurar "viewCountText"
        const m2 = watchHtml.match(/"viewCountText":\s*{\s*"simpleText"\s*:\s*"([\d.,\s\w]+)"/);
        if (m2) {
          // remove pontos, vírgulas e texto
          const cleaned = m2[1].replace(/[^\d]/g, "");
          if (cleaned) res.views = Number(cleaned);
        }
      }
    } catch (e) {
      console.warn("[YouTubeService] scrape watch HTML falhou:", e.message);
    }
  }

  return res;
}

// Só faz fallback se realmente faltar coisa importante
if (!result.title || result.thumbnails.length === 0 || result.views === null || result.views === 0) {
  result = await fillFallbacksIfNeeded(result);
}

// normalize final defaults
result.title = result.title ?? "Sem título";
result.views = result.views ?? 0;
result.thumbnails = result.thumbnails || [];

return result;

  } catch (err) {
    console.error("[YouTubeService] Erro:", err.message);
    return { success: false, error: err.message };
  }
}
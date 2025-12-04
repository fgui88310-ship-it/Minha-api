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

      for (const section of sections) {
        const contents = section.itemSectionRenderer?.contents || 
                        section.richSectionRenderer?.content?.richShelfRenderer?.contents || [];

        for (const item of contents) {
          const video = item.videoRenderer || 
                       item.compactVideoRenderer || 
                       item.richItemRenderer?.content?.videoRenderer;

          if (video?.videoId) {
            videoId = video.videoId;
            break;
          }
        }
        if (videoId) break;
      }

      if (!videoId) return null;
    }

    // 2. Pega os detalhes reais do vídeo
    const playerData = await youtubePlayerRequest(videoId);
    const vd = playerData.videoDetails;
    const micro = playerData.microformat?.playerMicroformatRenderer;

    if (!vd) return null;

    return {
      success: true,
      title: vd.title || "Sem título",
      videoId: vd.videoId,
      url: `https://www.youtube.com/watch?v=${vd.videoId}`,
      description: vd.shortDescription || "",
      duration: vd.isLiveContent ? "AO VIVO" : `${vd.lengthSeconds}s`,
      views: Number(vd.viewCount) || 0,
      channel: vd.author || "Desconhecido",
      channelId: vd.channelId || null,
      thumbnails: vd.thumbnail?.thumbnails?.sort((a, b) => b.width - a.width) || [],
      published: micro?.uploadDate || micro?.publishDate || "Data desconhecida",
      searchTimeMs: Date.now() - start,
    };

  } catch (err) {
    console.error("[YouTubeService] Erro:", err.message);
    return { success: false, error: err.message };
  }
}
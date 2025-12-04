// 【 SERVICES 】/youtube-service.js  ← versão FUNCIONANDO AGORA MESMO

import { extractVideoId } from "../【 UTILS 】/youtube-parser.js";
import { youtubeSearchRequest, youtubePlayerRequest } from "../【 UTILS 】/youtube-fetch.js";

export async function fetchYouTubeData(queryOrUrl) {
  const start = Date.now();
  let videoId = extractVideoId(queryOrUrl);

  try {
    // 1. Se não tiver ID (é busca por texto), vai buscar
    if (!videoId) {
      const searchData = await youtubeSearchRequest(queryOrUrl);

      // ←←← AQUI ESTAVA O PROBLEMA! Caminho antigo quebrou ←←←
      // Vamos usar a mesma lógica robusta que funcionou no teste

      const sections =
        searchData.contents?.twoColumnSearchResultsRenderer?.primaryContents
          ?.sectionListRenderer?.contents || [];

      let foundVideo = null;

      for (const section of sections) {
        // Caso normal (mais comum)
        if (section.itemSectionRenderer?.contents) {
          foundVideo = section.itemSectionRenderer.contents.find(item => 
            item.videoRenderer || item.compactVideoRenderer
          );
          if (foundVideo) {
            videoId = foundVideo.videoRenderer?.videoId || foundVideo.compactVideoRenderer?.videoId;
            break;
          }
        }

        // Caso novo: aba "Vídeos" com richShelfRenderer
        if (section.richSectionRenderer?.content?.richShelfRenderer?.contents) {
          const richItems = section.richSectionRenderer.content.richShelfRenderer.contents;
          for (const rich of richItems) {
            const video = rich.richItemRenderer?.content?.videoRenderer;
            if (video?.videoId) {
              videoId = video.videoId;
              foundVideo = video;
              break;
            }
          }
          if (videoId) break;
        }
      }

      if (!videoId) {
        console.warn("[YouTubeService] Nenhum vídeo encontrado na busca:", queryOrUrl);
        return null;
      }
    }

    // 2. Agora pega os detalhes do vídeo
    const playerData = await youtubePlayerRequest(videoId);

    const details = playerData.videoDetails;
    const micro = playerData.microformat?.playerMicroformatRenderer;

    if (!details) {
      console.warn("[YouTubeService] videoDetails vazio para ID:", videoId);
      return null;
    }

    return {
      title: details.title || "Sem título",
      videoId: details.videoId,
      url: `https://www.youtube.com/watch?v=${details.videoId}`,
      description: details.shortDescription || "",
      duration: details.lengthSeconds ? `${details.lengthSeconds}s` : "Ao vivo",
      views: details.viewCount || "0",
      channel: details.author || "Canal desconhecido",
      thumbnails: details.thumbnail?.thumbnails || [],
      published: micro?.uploadDate || micro?.publishDate || "Data não encontrada",
      channelId: details.channelId || null,
      searchTimeMs: Date.now() - start,
    };

  } catch (err) {
    console.error("[YouTubeService] Erro ao buscar vídeo:", err.message);
    return null;
  }
}
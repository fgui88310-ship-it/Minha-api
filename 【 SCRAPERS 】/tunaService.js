import axios from "axios";

export async function searchTunaSounds(query, limit = 5) {
  const maxLimit = Math.min(parseInt(limit), 36);

  const params = {
    "audio-format": "mp3",
    "custom": "true",
    "published": "true",
    "size": maxLimit,
    "sort": "-trending",
    "text": query,
  };

  const headers = {
    "app-name": "MakiseAPI",
    "app-version": "1.0.0",
    "app-os": "windows",
  };

  const searchUrl = "https://api.voicemod.net/v1/content-hub/sounds/";

  const { data } = await axios.get(searchUrl, {
    params,
    headers,
    timeout: 5000,
  });

  return data.items.slice(0, maxLimit).map((item) => ({
    id: item.id || "N/A",
    titulo:
      item.name.length > 100 ? item.name.substring(0, 97) + "..." : item.name,
    imagem: item.icon?.url || "N/A",
    link: item.publicInfo?.url || "N/A",
    duracao: item.duration ? `${(item.duration / 1000).toFixed(2)}s` : "N/A",
    audio: item.audio?.url || "N/A",
    tags: item.publicInfo?.tags || [],
    categoria: item.publicInfo?.categories?.[0] || "N/A",
    proprietario: item.publicInfo?.ownerName || "N/A",
    sensivel: item.publicInfo?.sensitiveContent || false,
  }));
}
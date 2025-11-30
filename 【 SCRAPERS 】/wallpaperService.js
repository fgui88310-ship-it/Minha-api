import axios from "axios";

export async function fetchWallpapers(query = "anime", limit = 5) {
  const url = `https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(
    query
  )}&categories=111&purity=100&sorting=random&order=desc`;

  const { data } = await axios.get(url, { timeout: 8000 });

  if (!data || !data.data || data.data.length === 0) {
    return [];
  }

  return data.data.slice(0, limit).map((w) => ({
    titulo: w.id,
    link: w.url,
    imagem: w.path,
    thumb: w.thumbs.small,
    categoria: w.category,
    resolucao: w.resolution,
    favoritos: w.favorites,
  }));
}
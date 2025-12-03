import { scrapeXvideos } from "../【 UTILS 】/scraper.js";

export async function fetchVideos(query, limit = 10) {
  if (!query) throw new Error("Query is required.");

  const results = await scrapeXvideos(query, limit);

  if (!results.length) throw new Error("Nenhum vídeo encontrado");

  return results;
}
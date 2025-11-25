import { searchSoundcloud } from "../【 SCRAPERS 】/soundcloudService.js";

export async function soundcloudSearchController(req, res, next) {
  const { query, limit = 5 } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Passe ?query= para buscar músicas no SoundCloud" });
  }

  try {
    const results = await searchSoundcloud(query, limit);

    if (!results.length) {
      return res.status(404).json({ error: "Nenhuma faixa encontrada" });
    }

    res.json(results.slice(0, limit));
  } catch (err) {
    next(err);
  }
}
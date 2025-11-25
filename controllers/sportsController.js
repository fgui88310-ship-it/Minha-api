import { buscarNoticiasEsportes } from "../【 SCRAPERS 】/sportsService.js";

export async function sportsNewsController(req, res, next) {
  const { limit = 5 } = req.query;

  try {
    const noticias = await buscarNoticiasEsportes();

    const limitadas = noticias.slice(0, parseInt(limit));

    if (!limitadas.length) {
      return res
        .status(404)
        .json({ error: "Nenhuma notícia de esportes encontrada" });
    }

    res.json({
      total: limitadas.length,
      noticias: limitadas,
    });
  } catch (err) {
    next(err);
  }
}
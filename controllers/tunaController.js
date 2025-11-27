import { searchTunaSounds } from "../【 SCRAPERS 】/tuna.service.js";

export async function tunaSearchController(req, res, next) {
  const { query, limit = 5 } = req.query;

  if (!query) {
    return res.status(400).json({
      error: "Passe ?query= para buscar sons",
    });
  }

  try {
    const results = await searchTunaSounds(query, limit);

    if (!results.length) {
      return res.status(404).json({
        error: "Nenhum som encontrado para a consulta",
      });
    }

    res.json(results);
  } catch (err) {
    console.error("Erro na requisição Tuna:", err.message);
    next(err);
  }
}
// api/endpoints/cinema.js
import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const url = "https://www.adorocinema.com/filmes/agenda/";
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      timeout: 5000,
    });
    const $ = cheerio.load(data);

    let filmes = [];

    $("section.section-wrap.gd-2-cols.gd-gap-30 .gd-col-left .mdl .card.entity-card.entity-card-list").each((i, el) => {
      const title = $(el).find(".meta-title-link").text().trim();
      const releaseDate = $(el).find(".meta-body-item.meta-body-info .date").text().trim();
      const rating = $(el).find(".stareval-note").first().text().trim() || "N/A";
      const directors = $(el).find(".meta-body-item.meta-body-direction .dark-grey-link").map((i, d) => $(d).text().trim()).get().join(", ") || "Sem informação";
      const cast = $(el).find(".meta-body-item.meta-body-actor .dark-grey-link").map((i, c) => $(c).text().trim()).get().join(", ") || "Sem informação";
      const synopsis = $(el).find(".synopsis .content-txt").text().trim();

      if (title && synopsis.length > 20) {
        filmes.push({
          title,
          releaseDate,
          rating,
          directors,
          cast,
          synopsis: synopsis.slice(0, 200) + (synopsis.length > 200 ? "..." : "")
        });
      }
    });

    if (filmes.length === 0) return res.status(404).json({ error: "Nenhum filme válido encontrado." });

    res.json(filmes);

  } catch (err) {
    next(err);
  }
});

export default router;
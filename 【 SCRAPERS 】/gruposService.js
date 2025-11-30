// services/gruposService.js
import axios from "axios";
import * as cheerio from "cheerio";

export async function buscarGrupos(query, limit = 5) {
  const searchUrl = `https://gruposwhats.app/`;

  const response = await axios.get(searchUrl, { timeout: 5000 });
  const $ = cheerio.load(response.data);

  const grupos = [];

  $("div.col-group").each((i, el) => {
    if (grupos.length >= limit) return false;

    const category = $(el).find("span.card-category").text().trim();
    const name = $(el).find("h5.card-title").text().trim();
    const description = $(el).find("p.card-text").text().trim();
    const link = $(el).find("a.btn-success").attr("href");
    const image = $(el).find("img.card-img-top").attr("src");

    if (name && category && link && description) {
      grupos.push({
        name,
        category,
        description,
        groupUrl: link,
        image: image || null,
      });
    }
  });

  return grupos;
}
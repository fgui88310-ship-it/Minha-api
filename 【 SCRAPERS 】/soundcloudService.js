import axios from "axios";
import * as cheerio from "cheerio";

export async function searchSoundcloud(query, limit = 5) {
  const searchUrl = `https://soundcloud.com/search/sounds?q=${encodeURIComponent(query)}&filter.content_type=sound`;

  const { data } = await axios.get(searchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    responseType: "text",
  });

  return parseResults(data, limit);
}

function parseResults(html, limit) {
  const $ = cheerio.load(html);
  const results = [];

  $("noscript").each((i, el) => {
    if (results.length >= limit) return false;

    const $ns = cheerio.load($(el).html());

    $ns("ul li h2 a").each((j, a) => {
      if (results.length >= limit) return false;

      const title = $ns(a).text().trim();
      const url = $ns(a).attr("href");

      if (url && !url.includes("/sets/")) {
        results.push({
          title,
          url: url.startsWith("http") ? url : `https://soundcloud.com${url}`,
          artist_name: "Indisponível",
          artist_url: "Indisponível",
          duration: 0,
        });
      }
    });
  });

  return results;
}
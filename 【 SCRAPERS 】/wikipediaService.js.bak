// services/wikipediaService.js
import axios from "axios";

const WIKI_API = "https://pt.wikipedia.org/w/api.php";

export async function buscarWikipedia(query, limit = 1) {
  // 1️⃣ Buscar páginas
  const searchResponse = await axios.get(WIKI_API, {
    params: {
      action: "query",
      format: "json",
      list: "search",
      srsearch: query,
      srlimit: limit,
    },
    timeout: 5000,
  });

  const searchResults = searchResponse.data.query.search;

  if (!searchResults || searchResults.length === 0) {
    return [];
  }

  // 2️⃣ Buscar resumo + imagem de cada página
  const resultados = await Promise.all(
    searchResults.map(async (item) => {
      const pageId = item.pageid;

      const pageResponse = await axios.get(WIKI_API, {
        params: {
          action: "query",
          format: "json",
          pageids: pageId,
          prop: "extracts|pageimages",
          exintro: true,
          explaintext: true,
          redirects: 1,
          piprop: "original",
        },
        timeout: 5000,
      });

      const page = pageResponse.data.query.pages[pageId];

      return {
        titulo: page.title,
        resumo: page.extract,
        link: `https://pt.wikipedia.org/?curid=${pageId}`,
        imagem: page.original ? page.original.source : null,
      };
    })
  );

  return resultados;
}
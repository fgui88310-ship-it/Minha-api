// services/wikipediaService.js
import axios from "axios";

const WIKI_API = "https://pt.wikipedia.org/w/api.php";

// User-Agent obrigatório pela política da Wikimedia
// Veja: https://meta.wikimedia.org/wiki/User-Agent_policy
const USER_AGENT = "SuaAppWikipedia/1.0 (+https://seu-dominio.com ou seu email)";

export async function buscarWikipedia(query, limit = 1) {
  try {
    // 1️⃣ Busca
    const searchResponse = await axios.get(WIKI_API, {
      params: {
        action: "query",
        format: "json",
        list: "search",
        srsearch: query,
        srlimit: limit,
        origin: "*", // importante quando chamado do servidor
      },
      headers: {
        "User-Agent": USER_AGENT,
        "Api-User-Agent": USER_AGENT, // alguns preferem esse header
      },
      timeout: 8000,
    });

    const searchResults = searchResponse.data.query?.search || [];

    if (searchResults.length === 0) {
      return [];
    }

    // 2️⃣ Detalhes + imagem
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
            piprop: "original|name",
            pithumbsize: 600,
            origin: "*",
          },
          headers: {
            "User-Agent": USER_AGENT,
          },
          timeout: 8000,
        });

        const page = pageResponse.data.query.pages[pageId];

        return {
          titulo: page.title || "Sem título",
          resumo: page.extract || "Sem resumo disponível.",
          link: `https://pt.wikipedia.org/?curid=${pageId}`,
          imagem:
            page.original?.source ||
            page.thumbnail?.source ||
            null,
        };
      })
    );

    return resultados;
  } catch (error) {
    console.error("Erro na Wikipedia:", error.response?.status, error.message);
    throw error; // deixa o endpoint tratar
  }
}
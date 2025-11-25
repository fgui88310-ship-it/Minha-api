import { rssParser } from "../【 UTILS 】/rssParser.js";

const FEEDS = [
  "https://www.terra.com.br/esportes/rss.xml",
  "https://g1.globo.com/desc/esportes/rss2.xml",
  "https://www.uol.com.br/esporte/rss.xml",
  "https://www.lance.com.br/rss.xml",
];

function identificarFonte(url) {
  if (url.includes("terra")) return "Terra Esporte";
  if (url.includes("g1")) return "G1 Esportes";
  if (url.includes("uol")) return "UOL Esporte";
  return "Lance Esporte";
}

export async function buscarNoticiasEsportes() {
  const noticias = [];

  for (const feedUrl of FEEDS) {
    try {
      const feed = await rssParser.parseURL(feedUrl);

      feed.items.forEach((item) => {
        noticias.push({
          titulo: item.title?.trim() || "Sem título",
          resumo: item.contentSnippet
            ? item.contentSnippet.substring(0, 150) + "..."
            : "Sem resumo disponível",
          data: item.pubDate
            ? new Date(item.pubDate).toLocaleDateString("pt-BR")
            : "Data não disponível",
          link: item.link || "#",
          fonte: identificarFonte(feedUrl),
        });
      });
    } catch (err) {
      console.log(`⚠️ Erro ao ler feed ${feedUrl}: ${err.message}`);
    }
  }

  return limparOrdenar(noticias);
}

function limparOrdenar(lista) {
  // Remover duplicatas
  const unicas = lista.filter(
    (noticia, i, arr) =>
      i === arr.findIndex((n) => n.titulo === noticia.titulo)
  );

  // Ordenar por data desc
  unicas.sort((a, b) => {
    const da = new Date(a.data);
    const db = new Date(b.data);
    return db - da;
  });

  return unicas;
}
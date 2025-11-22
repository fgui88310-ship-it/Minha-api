import fetch from "node-fetch";

// Versão do client usada pelo YouTube
const CLIENT_VERSION = "2.20251120.00.00";

// Pesquisa o canal pelo termo
async function pesquisarCanalPorTexto(termo) {
  const url = "https://m.youtube.com/youtubei/v1/search?prettyPrint=false";
  const body = {
    query: termo,
    context: { client: { clientName: "WEB", clientVersion: CLIENT_VERSION } }
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const json = await r.json();

  const items = json?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
  
  for (const section of items) {
    const results = section?.itemSectionRenderer?.contents || [];
    for (const item of results) {
      if (item.channelRenderer) {
        const ch = item.channelRenderer;
        return {
          nome: ch.title?.simpleText || "Desconhecido",
          channelId: ch.channelId,
          avatar: ch.thumbnail?.thumbnails?.slice(-1)[0]?.url
        };
      }
    }
  }
  return null;
}

// Extrai informações públicas do canal
function extrairInfos(json, channelId) {
  const header = json.header?.c4TabbedHeaderRenderer
                 || json.header?.profileHeaderRenderer
                 || json.header?.channelHeaderRenderer;

  const metadata = json.metadata?.channelMetadataRenderer;

  // Avatar e Banner
  const avatar = header?.avatar?.thumbnails?.slice(-1)[0]?.url
               || metadata?.avatar?.thumbnails?.slice(-1)[0]?.url;
  const banner = header?.banner?.thumbnails?.slice(-1)[0]?.url
               || metadata?.banner?.thumbnails?.slice(-1)[0]?.url;

  // Número total de vídeos aproximado
  let totalVideos = 0;
  try {
    const tabs = json.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
    const videosTab = tabs.find(t => t.tabRenderer?.title?.toLowerCase() === "vídeos" || t.tabRenderer?.title?.toLowerCase() === "videos");
    const items = videosTab?.tabRenderer?.content?.sectionListRenderer?.contents || [];
    for (const sec of items) {
      const videoItems = sec?.itemSectionRenderer?.contents || [];
      totalVideos += videoItems.filter(v => v.videoRenderer).length;
    }
  } catch {}

  // Links fixados públicos
  let linksFixados = [];
  try {
    linksFixados = header?.channelActions?.buttons?.map(b => b?.buttonRenderer?.navigationEndpoint?.urlEndpoint?.url || null).filter(Boolean) || [];
  } catch {}

  // Visualizações totais
  const totalViews = metadata?.viewCountText?.simpleText || "Não disponível";

  return {
    nome: header?.title || metadata?.title || "Desconhecido",
    inscritos: header?.subscriberCountText?.simpleText || "Não disponível",
    descricao: metadata?.description || "Sem descrição",
    avatar,
    banner,
    totalVideos,
    totalViews,
    linksFixados,
    channelId
  };
}

// Busca perfil completo
async function buscarPerfilYoutube(termo) {
  const canal = await pesquisarCanalPorTexto(termo);
  if (!canal) return { erro: "Nenhum canal encontrado" };

  const url = "https://m.youtube.com/youtubei/v1/browse?prettyPrint=false";
  const body = { browseId: canal.channelId, context: { client: { clientName: "MWEB", clientVersion: CLIENT_VERSION } } };

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const json = await r.json();
  return extrairInfos(json, canal.channelId);
}

// =======================
// TESTE
// =======================
buscarPerfilYoutube("Jazzghost").then(console.log).catch(console.error);
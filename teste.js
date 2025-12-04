// test-youtube.js
// Rode com: node test-youtube.js

async function buscarPrimeiroVideo(query) {
  console.log(`Buscando: "${query}"\n`);

  const response = await fetch(
    "https://www.youtube.com/youtubei/v1/search?prettyPrint=false",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "x-youtube-client-name": "1",
        "x-youtube-client-version": "2.20241204.01.00", // ← MUITO IMPORTANTE manter atualizado
        "accept-language": "pt-BR,pt;q=0.9",
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20241204.01.00",
            hl: "pt",
            gl: "BR",
            utcOffsetMinutes: -180,
          },
        },
        query: query,
      }),
    }
  );

  if (!response.ok) {
    console.error("Erro na requisição:", response.status, response.statusText);
    return null;
  }

  const data = await response.json();

  // ================ NAVEGAÇÃO ATUALIZADA 2025 ================
  const sections =
    data.contents?.twoColumnSearchResultsRenderer?.primaryContents
      ?.sectionListRenderer?.contents || [];

  for (const section of sections) {
    // Caso 1: itemSectionRenderer normal (a maioria)
    if (section.itemSectionRenderer?.contents) {
      for (const item of section.itemSectionRenderer.contents) {
        const video = item.videoRenderer || item.compactVideoRenderer;
        if (video?.videoId) {
          return {
            videoId: video.videoId,
            title:
              video.title?.runs?.[0]?.text ||
              video.title?.simpleText ||
              "Sem título",
            url: `https://www.youtube.com/watch?v=${video.videoId}`,
          };
        }
      }
    }

    // Caso 2: richSectionRenderer / richShelfRenderer (nova aba "Vídeos")
    if (section.richSectionRenderer?.content?.richShelfRenderer?.contents) {
      for (const rich of section.richSectionRenderer.content.richShelfRenderer
        .contents) {
        const video = rich.richItemRenderer?.content?.videoRenderer;
        if (video?.videoId) {
          return {
            videoId: video.videoId,
            title:
              video.title?.runs?.[0]?.text ||
              video.title?.simpleText ||
              "Sem título",
            url: `https://www.youtube.com/watch?v=${video.videoId}`,
          };
        }
      }
    }
  }

  return null;
}

// ===================== TESTES =====================
async function main() {
  const testes = [
    "never gonna give you up",           // busca por texto
    "dQw4w9WgXcQ",                       // videoId direto
    "https://youtu.be/dQw4w9WgXcQ",       // link curto
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // link completo
    "lula livre",                        // busca em português
  ];

  for (const termo of testes) {
    const inicio = Date.now();
    const resultado = await buscarPrimeiroVideo(termo);
    const tempo = Date.now() - inicio;

    if (resultado) {
      console.log("ENCONTRADO em", tempo + "ms");
      console.log("Título :", resultado.title);
      console.log("Link   :", resultado.url);
      console.log("ID     :", resultado.videoId);
    } else {
      console.log("NÃO ENCONTRADO:", termo);
    }
    console.log("-".repeat(50));
  }
}

main().catch(console.error);
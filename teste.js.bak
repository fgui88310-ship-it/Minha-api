import fetch from "node-fetch";

// Pegue esses valores abrindo youtube.com no navegador logado
const COOKIE = "CONSENT=YES+cb.20250312-12-p0.pt-BR+FX+123; __Secure-3PSID=xxx; ..."; // cole tudo
const CLIENT_VERSION = "2.20251204.01.00"; // atualize sempre que parar de funcionar

const headers = {
  "Content-Type": "application/json",
  "Origin": "https://www.youtube.com",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Cookie": COOKIE,
  "X-Youtube-Client-Name": "1",
  "X-Youtube-Client-Version": CLIENT_VERSION,
};

export async function youtubeSearchRequest(query) {
  const res = await fetch(
    "https://www.youtube.com/youtubei/v1/search?key=AIzaSyAO_FJ2SlqU8QfKXiZw2Ylt0eRGJlv9ciA&prettyPrint=false",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: CLIENT_VERSION,
            hl: "pt",
            gl: "BR",
          },
        },
        query,
      }),
    }
  );

  if (!res.ok) {
    console.error("Erro:", res.status, await res.text());
    return null;
  }

  return res.json();
}

// Teste rápido
youtubeSearchRequest("never gonna give you up")
  .then(data => console.log("Funcionou! Vídeos encontrados:", data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents[0]?.itemSectionRenderer?.contents?.length || 0))
  .catch(console.error);
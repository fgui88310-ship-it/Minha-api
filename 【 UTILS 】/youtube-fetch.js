import fetch from "node-fetch";

// ===== CORREÇÃO MÍNIMA (só isso que precisava mudar) =====
const YT_KEY = "AIzaSyAO_FJ2SlqU8QfKXiZw2Ylt0eRGJlv9ciA";  // chave pública real do YouTube Web
const CLIENT_VERSION = "2.20251204.01.00";               // versão atual (dezembro 2025)

// Seu client atualizado (só mudou a versão)
const client = {
  clientName: "WEB",
  clientVersion: CLIENT_VERSION,
  hl: "pt-BR",          // adicionado (obrigatório agora)
  gl: "BR",             // adicionado (obrigatório agora)
};

// ===== CABEÇALHOS OBRIGATÓRIOS EM 2025 (coloque aqui em cima) =====
const HEADERS = {
  "Content-Type": "application/json",
  "Origin": "https://www.youtube.com",
  "Referer": "https://www.youtube.com/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "X-Youtube-Client-Name": "1",
  "X-Youtube-Client-Version": CLIENT_VERSION,
  // Cookie da sua conta logada (PEGUE NO NAVEGADOR → Application → Cookies)
  "Cookie": "CONSENT=YES+cb.2025...; __Secure-3PSID=SEU_COOKIE_AQUI; SID=...; HSID=...; SSID=...; APISID=...; SAPISID=...; __Secure-3PAPISID=..."
};

// ===== SUAS FUNÇÕES ORIGINAIS (quase iguais, só passei os headers) =====
export async function youtubeSearchRequest(query) {
  const endpoint = `https://www.youtube.com/youtubei/v1/search?key=${YT_KEY}&prettyPrint=false`;

  const body = {
    context: { client },
    query
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: HEADERS,                    // mudou aqui
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function youtubePlayerRequest(videoId) {
  const endpoint = `https://www.youtube.com/youtubei/v1/player?key=${YT_KEY}&prettyPrint=false`;

  const body = {
    context: { client },
    videoId
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: HEADERS,                    // mudou aqui
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}
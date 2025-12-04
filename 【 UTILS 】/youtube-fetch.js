// 【 UTILS 】/youtube-fetch.js  ← VERSÃO FUNCIONANDO 04/12/2025

import fetch from "node-fetch";

// Versão real de hoje (atualize semanalmente pegando no DevTools)
const CLIENT_VERSION = "2.20241204.02.00";

// Client config (obrigatório em 2025)
const client = {
  clientName: "WEB",
  clientVersion: CLIENT_VERSION,
  hl: "pt-BR",
  gl: "BR",
  timeZone: "America/Sao_Paulo",  // adicionado pra buscas locais
};

// Headers MÍNIMOS que funcionam (sem cookie pra testes)
const HEADERS = {
  "Content-Type": "application/json",
  "Origin": "https://www.youtube.com",
  "Referer": "https://www.youtube.com/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "x-youtube-client-name": "1",       // minúsculo!
  "x-youtube-client-version": CLIENT_VERSION,
  // "Cookie": "SEUS_COOKIES_REAIS_AQUI"  ← descomente SÓ se precisar de login
};

export async function youtubeSearchRequest(query) {
  // SEM chave no URL! O YouTube valida via headers agora
  const endpoint = "https://www.youtube.com/youtubei/v1/search?prettyPrint=false";

  const body = {
    context: { client },
    query,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro \( {res.status}: \){errorText}`);
  }
  return res.json();
}

export async function youtubePlayerRequest(videoId) {
  // Mesma coisa pro player
  const endpoint = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";

  const body = {
    context: { client },
    videoId,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro \( {res.status}: \){errorText}`);
  }
  return res.json();
}
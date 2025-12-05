// 【 UTILS 】/youtube-fetch.js
import fetch from "node-fetch";

const CLIENT_VERSION = "2.20241204.02.00";

const client = {
  clientName: "WEB",
  clientVersion: CLIENT_VERSION,
  hl: "pt-BR",
  gl: "BR",
  timeZone: "America/Sao_Paulo",
};

const HEADERS = {
  "Content-Type": "application/json",
  "Origin": "https://www.youtube.com",
  "Referer": "https://www.youtube.com/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "X-YouTube-Client-Name": "1",
  "X-YouTube-Client-Version": CLIENT_VERSION,
};

export async function youtubeSearchRequest(query) {
  const endpoint =
    "https://www.youtube.com/youtubei/v1/search?prettyPrint=false";

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
    throw new Error(`Erro (${res.status}): ${errorText}`);
  }

  return res.json();
}

export async function youtubePlayerRequest(videoId) {
  const endpoint =
    "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";

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
    throw new Error(`Erro (${res.status}): ${errorText}`);
  }

  return res.json();
}
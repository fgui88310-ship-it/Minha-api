import fetch from "node-fetch";

const YT_KEY = "AIzaSyA-EXEMPLO";
const client = {
  clientName: "WEB",
  clientVersion: "2.20251021.00.00"
};

export async function youtubeSearchRequest(query) {
  const endpoint = `https://www.youtube.com/youtubei/v1/search?key=${YT_KEY}`;

  const body = {
    context: { client },
    query
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function youtubePlayerRequest(videoId) {
  const endpoint = `https://www.youtube.com/youtubei/v1/player?key=${YT_KEY}`;

  const body = {
    context: { client },
    videoId
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}
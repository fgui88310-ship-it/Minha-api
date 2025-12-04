import { youtubePlayerRequest } from "./【 UTILS 】/youtube-fetch.js";

const videoId = "xLfKnR7svOU"; // do seu debug

youtubePlayerRequest(videoId)
  .then(data => {
    console.log("🔍 Keys:", Object.keys(data));
    console.log("\nVideoDetails:", data.videoDetails);
  })
  .catch(err => {
    console.error("❌ Erro:", err.message);
  });
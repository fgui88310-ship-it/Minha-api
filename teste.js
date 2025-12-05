import axios from "axios";

async function testar(videoId) {
  // Faz a requisição da página do player (a mesma que o YouTube usa internamente)
  const url = `https://www.youtube.com/youtubei/v1/player?key=AIzaSyA8eiZmM1nqFZpLH4QwM6x2Br0f9uQ3sYk`;
  const body = {
    context: { client: { clientName: "WEB", clientVersion: "2.20241201.00.00" } },
    videoId
  };

  const { data } = await axios.post(url, body, {
    headers: { "Content-Type": "application/json" },
  });

  // Extrai os blocos certos
  const details = data.videoDetails || {};
  const micro = data.microformat?.playerMicroformatRenderer || {};

  const result = {
    title: details.title,
    duration: Number(details.lengthSeconds),
    views: Number(details.viewCount),
    description: details.shortDescription,
    channel: details.author,
    channelId: details.channelId,
    published: micro.publishDate,
    thumbnails: details.thumbnail?.thumbnails || [],
  };

  console.log("✅ RESULTADO FINAL:");
  console.log(result);
}

testar("xLfKnR7svOU"); // gatos engraçados - tente não rir
import express from "express";
import { getCache, setCache } from "../../【 UTILS 】/cache.js";
import { fetchYouTubeData } from "../../【 SCRAPERS 】/youtubeService.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const { query, url } = req.query;
  const input = query || url;

  if (!input) {
    return res.status(400).json({ error: "Passe ?query= ou ?url=" });
  }

  const cacheKey = `yt:${input}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const data = await fetchYouTubeData(input);

    if (!data) {
      return res.status(404).json({ error: "Vídeo não encontrado" });
    }

    setCache(cacheKey, data);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
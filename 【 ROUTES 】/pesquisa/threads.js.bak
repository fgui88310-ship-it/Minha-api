import express from 'express';
import { scrapeSinglePost } from '../【 SCRAPERS 】/threadsScraper.js';
import { getThreadsCache, setThreadsCache } from '../【 UTILS 】/cache.js';
import { formatMediaItems } from '../【 MODULES 】/threadsFormatter.js';
import { getBasicInfo, saveToJson } from '../【 MODULES 】/libs.js';
import { isInvalid, THREADS_URL_REGEX } from '../config.js';
const router = express.Router();
router.get('/', async (req, res, next) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Passe ?url=' });

  // ✅ Validação do link
  if (!THREADS_URL_REGEX.test(url)) {
    return res.status(400).json({ error: '❌ Isso não é um link válido do Threads. Verifique e tente novamente.' });
  }

  // ✅ Usando cache existente
  const cached = getThreadsCache(url);
  if (cached) {
    console.log('[CACHE] Resultado servido do cache:', url);
    return res.json(cached);
  }

  try {
    const result = await scrapeSinglePost(url, getBasicInfo, saveToJson);

    if (isInvalid(result)) {
      console.warn('[THREADS] Post inválido ou vazio detectado:', url);
      return res.status(404).json({ error: '⚠️ Não encontrei conteúdo válido nesse post. Pode ter sido apagado ou estar privado.' });
    }

    // ✅ Monta resposta formatada
    const response = {
      postId: result.postID,
      username: result.username,
      fullName: result.fullName,
      title: result.title,
      date: result.date,
      engagement: result.engagement,
      mediaType: result.mediaType,
      medias: formatMediaItems(result)
    };

    setThreadsCache(url, response);
    res.json(response);

  } catch (err) {
    next(err);
  }
});

export default router;

import { axiosInstance as http } from '../【 SCRAPERS 】/axiosClient.js';  // <-- aqui o "as http"
import PornhubModule from '../【 MODULES 】/pornhubModule.js';

async function getVideos(query, limit = 5, page = 1) {
  try {
    const url = PornhubModule.videoUrl(query, page);
    const { data } = await http.get(url);  // agora funciona

    return PornhubModule.parseVideos(data).slice(0, limit);
  } catch (err) {
    console.error('[PornhubService] Erro de vídeo:', err.message);
    return [];
  }
}

async function getGifs(query, limit = 5, page = 1) {
  try {
    const url = PornhubModule.gifUrl(query, page);
    const { data } = await http.get(url);

    return PornhubModule.parseGifs(data).slice(0, limit);
  } catch (err) {
    console.error('[PornhubService] Erro de GIF:', err.message);
    return [];
  }
}

export default { getVideos, getGifs };
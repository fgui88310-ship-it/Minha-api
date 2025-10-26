import axios from 'axios';
import { getClientId, updateClientId } from './clientService.js';
import { getHeaders } from './headerService.js';
import { getCache, setCache } from './cacheService.js';

export async function searchTracks(query, limit = 15) {
  const clientId = await getClientId();
  const cacheKey = `q:${query}:${limit}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const url = `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(query)}&client_id=${clientId}&limit=${limit}`;
  const headers = await getHeaders();

  try {
    const { data } = await axios.get(url, { headers, timeout: 3000 });
    const results = (data.collection || []).map(track => ({
      title: track.title,
      uploader: track.user?.username,
      duration: track.duration ? track.duration / 1000 : null,
      url: track.permalink_url?.replace('m.soundcloud.com', 'soundcloud.com'),
      image: track.artwork_url?.replace('-t500x500.', '-large.') || track.user?.avatar_url,
      trackId: track.id,
      genre: track.genre,
    }));

    if (results.length === 0) {
  console.log(`Nenhum resultado encontrado para "${query}"`);
  return []; // <-- aqui
}

    setCache(cacheKey, results);
    return results;
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.log('[SOUNDCLOUD] Client ID expirado, atualizando...');
      await updateClientId();
      return await searchTracks(query, limit);
    }
    console.error('[SOUNDCLOUD] Erro na busca:', err.message);
    return { message: 'Erro na busca.' }; 
  }
}
export async function fetchTrackByUrl(url) {
  const clientId = await getClientId();
  const cacheKey = `u:${url}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const headers = await getHeaders();
  const infoUrl = `https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(url)}&client_id=${clientId}`;

  try {
    const { data } = await axios.get(infoUrl, { headers, timeout: 3000 });
    if (data.kind !== 'track') return null;
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.error('[SOUNDCLOUD] Erro ao obter metadados:', err.message);
    return null;
  }
}
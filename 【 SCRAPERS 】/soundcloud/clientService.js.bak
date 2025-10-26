import axios from 'axios';
import { DEFAULT_CLIENT_ID } from '../../config.js';

let cachedClientId = DEFAULT_CLIENT_ID;
let lastClientUpdate = 0;

export async function updateClientId() {
  try {
    const { data } = await axios.get('https://soundcloud.com/', { timeout: 3000 });
    const scripts = data.match(/<script[^>]+src="([^"]+)"/g) || [];

    for (const scriptTag of scripts.reverse()) {
      const scriptUrl = scriptTag.match(/src="([^"]+)"/)[1];
      const { data: script } = await axios.get(scriptUrl, { timeout: 3000 });
      const clientIdMatch = script.match(/client_id\s*:\s*"([0-9a-zA-Z]{32})"/);
      if (clientIdMatch) {
        cachedClientId = clientIdMatch[1];
        lastClientUpdate = Date.now();
        console.log('[SOUNDCLOUD] Novo client_id encontrado:', cachedClientId);
        return cachedClientId;
      }
    }
    throw new Error('Não foi possível extrair um novo client_id');
  } catch (err) {
    console.error('[SOUNDCLOUD] Erro ao atualizar client_id:', err.message);
    throw err;
  }
}

export async function getClientId() {
  const now = Date.now();
  if (cachedClientId && now - lastClientUpdate < 60 * 60 * 1000) {
    return cachedClientId;
  }
  return await updateClientId();
}
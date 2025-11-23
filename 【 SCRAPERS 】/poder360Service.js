import axios from 'axios';
import xml2js from 'xml2js';
import { limparHTML } from '../【 UTILS 】/htmlUtils.js';
import { PODER360_CONFIG } from '../config.js';

export async function buscarNoticiasPoder360() {
  try {
    const { FEED_URL, TIMEOUT, USER_AGENT, LIMITE_NOTICIAS } = PODER360_CONFIG;

    const { data: xml } = await axios.get(FEED_URL, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: TIMEOUT
    });

    const parser = new xml2js.Parser({ explicitArray: false });
    const parsed = await parser.parseStringPromise(xml);

    const items = parsed.rss?.channel?.item || [];
    const lista = Array.isArray(items) ? items : [items];

    return lista.slice(0, LIMITE_NOTICIAS).map(it => {
      const rawDesc = it['content:encoded'] || it.description || '';
      return {
        titulo: it.title || '',
        descricao: limparHTML(rawDesc),
        link: typeof it.link === 'object' ? it.link._ : it.link
      };
    });
  } catch (err) {
    console.error('[PODER360 SERVICE]', err.message);
    return null;
  }
}
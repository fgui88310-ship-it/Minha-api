import xml2js from 'xml2js';

export async function parseRSS(data) {
  const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
  const result = await parser.parseStringPromise(data);
  const items = result?.rss?.channel?.item || result?.feed?.entry || [];
  return Array.isArray(items) ? items : items ? [items] : [];
}
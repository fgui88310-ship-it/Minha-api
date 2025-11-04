// api/utils/fileUtils.js
import fs from 'fs/promises';
import { join } from 'path';
import { fs as fsSync, path as pathLib } from '../【 MODULES 】/libs.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PATHS } from '../config.js';
export async function saveToJson(data, filename) {
  try {
    const timestamp = Date.now();
    const jsonFilename = filename ? `${filename}_${timestamp}.json` : `threads_scrape_${timestamp}.json`;
    const cleanHtml = data.html?.replace(/[\x00-\x1F\x7F-\x9F]/g, '') || '';
    const jsonData = {
      ...data,
      html: cleanHtml,
      metadata: {
        scrapedAt: new Date().toISOString(),
        url: data.url || '',
        timestamp: timestamp,
        fileSize: cleanHtml.length,
        userAgent: data.userAgent || ''
      }
    };
    await fs.writeFile(jsonFilename, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log(`[SUCCESS] Dados salvos em: ${jsonFilename}`);
    console.log(`[INFO] Tamanho do JSON: ${Buffer.byteLength(JSON.stringify(jsonData), 'utf8')} bytes`);
    return jsonFilename;
  } catch (error) {
    console.log('[ERROR] Falha ao salvar JSON:', error.message);
    return null;
  }
}

export async function cleanupOldFiles() {
  try {
    const files = await fs.readdir(PATHS.downloadsDir);
    const now = Date.now();
    for (const file of files) {
      const filePath = join(PATHS.downloadsDir, file);
      const stats = await fs.stat(filePath);
      if (now - stats.mtimeMs > 24 * 60 * 60 * 1000) {
        await fs.unlink(filePath);
        console.log('[SCRAPER] Arquivo antigo removido:', filePath);
      }
    }
  } catch (err) {
    console.error('[SCRAPER] Erro ao limpar arquivos antigos:', err.message);
  }
}

/**
 * Lê todos os arquivos JSON de um diretório e retorna um array de objetos.
 * Ideal para cache local de dados (ex: emojis, cidades, etc.)
 */
export async function loadJsonFiles(dir) {
  try {
    const files = await fs.readdir(dir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    const data = [];

    for (const file of jsonFiles) {
      const content = await fs.readFile(join(dir, file), 'utf8');
      data.push(JSON.parse(content));
    }

    return data;
  } catch (error) {
    console.error(`[ERROR] Falha ao ler JSONs de ${dir}:`, error.message);
    return [];
  }
}
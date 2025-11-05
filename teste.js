import { loadJsonFiles } from './【 UTILS 】/fileUtils.js';
import { EMOJI_DIR } from './config.js';

const data = await loadJsonFiles(EMOJI_DIR);
console.log('📦 Resultado da leitura:', data);
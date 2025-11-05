import { loadJsonFiles } from './【 UTILS 】/fileUtils.js';
import { EMOJI_DIR } from './config.js';

const data = await loadJsonFiles(EMOJI_DIR);

console.log('📦 Emojis carregados:', data.length);
console.log('🧠 Exemplo do primeiro item:\n', data[0]);

// Teste de busca simples
const emoji = '🥲';
const encontrado = data.find(e => e.emoji === emoji);
console.log(`\n🎯 Busca por "${emoji}":`, encontrado ? '✅ Encontrado' : '❌ Não encontrado');
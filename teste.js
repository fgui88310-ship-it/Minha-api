import { PinterestClient } from './【 UTILS 】/pinterestClient.js';
import { PinterestCache } from './【 UTILS 】/cache.js';

// Limpa cache antigo pra forçar nova busca
const cache = new PinterestCache();

const client = new PinterestClient();

// Lista de queries para testar (coloque as que estão falhando pra você)
const queriesParaTestar = [
  "flores bonitas",
  "carro vermelho",
  "gato fofo",
  "wallpaper 4k",
  "aesthetic girl",
  "tatuagem minimalista",
  // adicione aqui exatamente a query que não está funcionando pra você
  "SEU_QUERY_QUE_NAO_FUNCIONA"
];

async function diagnosticar(query) {
  console.log(`\n🔍 Testando query: "${query}"`);
  console.log('='.repeat(60));

  try {
    // 1. Mostra headers que estão sendo enviados (importante!)
    console.log('Headers sendo enviados:');
    console.log(client.getHeaders?.() || client.headers || 'não disponível');

    // 2. Força uma busca nova (sem cache)
    const start = Date.now();
    const imagens = await client.search(query);
    const tempo = Date.now() - start;

    console.log(`⏱️  Tempo de resposta: ${tempo}ms`);
    console.log(`📊 Quantidade de imagens retornadas: ${imagens.length}`);

    if (imagens.length > 0) {
      console.log('✅ Primeiras 5 URLs:');
      imagens.slice(0, 5).forEach((url, i) => {
        console.log(`   \( {i + 1}. \){url}`);
      });
    } else {
      console.log('❌ Nenhuma imagem encontrada');
      
      // 3. Mostra a resposta raw (se o client permitir)
      if (client.lastResponse) {
        console.log('\n📄 Última resposta completa (JSON):');
        console.log(JSON.stringify(client.lastResponse, null, 2).slice(0, 1000) + '...');
      }

      if (client.lastError) {
        console.log('\n🚨 Erro capturado:');
        console.log(client.lastError);
      }
    }
  } catch (err) {
    console.log('💥 Erro crítico na busca:');
    console.error(err.message || err);
  }

  console.log('='.repeat(60));
}

// Roda o diagnóstico para todas as queries
async function rodarTodosOsTestes() {
  console.log('🛠️  INICIANDO DIAGNÓSTICO DO PINTEREST CLIENT\n');
  
  for (const q of queriesParaTestar) {
    await diagnosticar(q);
    // Pequena pausa pra não ser bloqueado
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('🏁 Diagnóstico concluído!');
}

rodarTodosOsTestes();
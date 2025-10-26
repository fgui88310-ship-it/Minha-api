// Se estiver usando Node.js 18+ o fetch já vem embutido
// Se estiver usando versão anterior, instale node-fetch: npm install node-fetch

const url = 'https://space-apis.dscp.shop/api/canvas/music-card?thumbnail=https://files.catbox.moe/htf7ke.jpg&music_name=Yuxinze&artist_name=Apis&time_end=3:00&cor=azul&api_key=933b3d66a7';

async function fetchPriceHistory() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Dados recebidos:', data);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
}

fetchPriceHistory();
.../0/minha-apiii $ node test.js
Erro ao buscar dados: SyntaxError: Unexpected token '�', "�PNG

"... is not valid JSON
    at JSON.parse (<anonymous>)
    at parseJSONFromBytes (node:internal/deps/undici/undici:6221:19)
    at successSteps (node:internal/deps/undici/undici:6202:27)
    at readAllBytes (node:internal/deps/undici/undici:5164:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
.../0/minha-apiii $
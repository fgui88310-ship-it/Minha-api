import got from 'got';
import * as cheerio from 'cheerio';
import fs from 'fs/promises'; // Para salvar HTML de depuração

const BASE_URL = 'https://play.google.com';

async function pesquisarNaPlayStore(termo, opcoes = {}) {
  try {
    // Configurações padrão
    const config = {
      term: termo,
      lang: 'pt-BR',
      country: 'br',
      num: 5,
      price: 'all',
      ...opcoes
    };

    // Monta a URL de busca
    const priceMap = { all: 0, free: 1, paid: 2 };
    const url = `${BASE_URL}/store/search?q=${encodeURIComponent(config.term)}&c=apps&hl=${config.lang}&gl=${config.country}&price=${priceMap[config.price] || 0}`;

    console.log(`Buscando "${config.term}" na Play Store...`);
    console.log(`URL: ${url}`);

    // Faz a requisição com cabeçalhos mobile
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay de 1s
    const response = await got(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      },
      timeout: { request: 10000 }
    });

    // Salva o HTML para depuração
    await fs.writeFile('response.html', response.body);
    console.log('HTML salvo em response.html para depuração');

    // Extrai dados usando cheerio
    const $ = cheerio.load(response.body);
    const scripts = $('script').filter((_, el) => $(el).html().includes('AF_initDataCallback'));

    console.log(`Scripts encontrados: ${scripts.length}`);
    if (scripts.length === 0) {
      console.log('Nenhum script AF_initDataCallback encontrado.');
      return [];
    }

    let apps = [];
    for (let i = 0; i < scripts.length; i++) {
      const scriptData = scripts.eq(i).html();
      const dataMatch = scriptData.match(/data:([\s\S]*?), sideChannel: {}}/);
      if (!dataMatch) {
        console.log(`Script ${i} sem dados válidos`);
        continue;
      }

      let data;
      try {
        data = JSON.parse(dataMatch[1]);
      } catch (e) {
        console.log(`Erro ao parsear JSON do script ${i}: ${e.message}`);
        continue;
      }

      // Tenta múltiplos caminhos para encontrar a lista de apps
      const possiblePaths = [
        [1, 0, 0], // ds:1
        [0, 0, 0], // ds:0
        [2, 0, 0], // ds:2
        [1, 0, 1, 0, 0], // Caminho mais profundo
        [0, 0, 1, 0, 0]  // Alternativa
      ];

      let appList = null;
      for (const path of possiblePaths) {
        const candidate = path.reduce((obj, key) => obj?.[key], data);
        if (Array.isArray(candidate)) {
          appList = candidate;
          console.log(`Lista de apps encontrada no caminho: ${JSON.stringify(path)}`);
          break;
        }
      }

      if (!appList) {
        console.log(`Nenhuma lista de apps encontrada no script ${i}`);
        continue;
      }

      // Mapeia os resultados
      appList.forEach((app, index) => {
        if (index >= config.num) return;
        const appData = {
          title: app[2] || 'N/A',
          appId: app[12]?.[0] || 'N/A',
          url: app[9]?.[4]?.[2] ? `${BASE_URL}${app[9][4][2]}` : 'N/A',
          developer: app[4]?.[0]?.[0]?.[0] || 'N/A',
          priceText: app[7]?.[0]?.[3]?.[2]?.[1]?.[0]?.[2] || 'Grátis',
          scoreText: app[6]?.[0]?.[2]?.[1]?.[0] || 'Sem nota',
          score: app[6]?.[0]?.[2]?.[1]?.[1] || 'N/A',
        };
        apps.push(appData);
      });

      if (apps.length > 0) break; // Sai do loop se encontrou apps
    }

    // Exibe os resultados
    if (apps.length === 0) {
      console.log('Nenhum app encontrado.');
      return [];
    }

    console.log(`\nResultados da busca por "${termo}" (${apps.length} apps):`);
    apps.forEach((app, index) => {
      console.log(`\nApp ${index + 1}:`);
      console.log(`- Título: ${app.title}`);
      console.log(`- ID: ${app.appId}`);
      console.log(`- URL: ${app.url}`);
      console.log(`- Desenvolvedor: ${app.developer}`);
      console.log(`- Preço: ${app.priceText}`);
      console.log(`- Nota: ${app.scoreText} (${app.score})`);
    });

    return apps;
  } catch (erro) {
    console.error('Erro ao realizar a busca:', erro.message);
    return [];
  }
}

// Exemplo: Buscar "whatsapp" com 5 resultados
pesquisarNaPlayStore('whatsapp')
  .then(() => console.log('Busca concluída!'))
  .catch((erro) => console.error('Falha na busca:', erro.message)); 

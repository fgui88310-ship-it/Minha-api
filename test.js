import axios from 'axios';

// Lista de URLs de negócios/sites a serem testados
const businessUrls = [
  'https://pt.memedroid.com/',
  'https://example.com/',
  'https://another-site.com/',
  // Adicione mais URLs de negócios aqui
];

// Lista de User-Agents para rotacionar
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
];

// Função para obter um User-Agent aleatório
const getRandomUserAgent = () => {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

// Função para testar uma única URL
const testUrl = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.google.com/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Connection': 'keep-alive',
      },
      timeout: 10000, // Timeout de 10 segundos
    });

    // Se a requisição for bem-sucedida (status 200), o site não bloqueou
    return {
      url,
      status: response.status,
      blocked: false,
      message: 'Requisição bem-sucedida',
    };
  } catch (err) {
    // Verifica se o erro indica bloqueio (ex.: 403, 429, etc.)
    const status = err.response ? err.response.status : 'N/A';
    const blocked = [403, 429, 503].includes(status); // Status comuns para bloqueios
    return {
      url,
      status,
      blocked,
      message: blocked
        ? `Bloqueado (Status: ${status})`
        : `Erro: ${err.message}`,
    };
  }
};

// Função principal para testar todas as URLs
const testAllBusinesses = async () => {
  console.log('Iniciando testes de bloqueio de requisições...\n');
  
  const results = [];
  
  // Testa cada URL sequencialmente com um pequeno delay para evitar sobrecarga
  for (const url of businessUrls) {
    console.log(`Testando: ${url}`);
    const result = await testUrl(url);
    results.push(result);
    
    // Delay de 1 segundo entre requisições para evitar bloqueios por taxa
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Exibe os resultados
  console.log('\nResultados dos testes:');
  results.forEach((result) => {
    console.log(`URL: ${result.url}`);
    console.log(`Status: ${result.status}`);
    console.log(`Bloqueado: ${result.blocked ? 'Sim' : 'Não'}`);
    console.log(`Mensagem: ${result.message}`);
    console.log('---');
  });

  // Filtra e exibe apenas os sites que não bloquearam
  const nonBlocked = results.filter((result) => !result.blocked);
  console.log('\nSites que NÃO bloquearam as requisições:');
  if (nonBlocked.length > 0) {
    nonBlocked.forEach((result) => {
      console.log(`- ${result.url} (Status: ${result.status})`);
    });
  } else {
    console.log('Nenhum site acessado sem bloqueio.');
  }

  return results;
};

// Executa o teste
testAllBusinesses()
  .then(() => console.log('Testes concluídos.'))
  .catch((err) => console.error('Erro ao executar testes:', err.message));
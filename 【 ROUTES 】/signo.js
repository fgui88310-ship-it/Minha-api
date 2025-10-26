import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import NodeCache from 'node-cache';
import UserAgent from 'user-agents';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache de 1 hora

// Mapeamento de signos
const signosMap = {
  aries: 'aries',
  touro: 'touro',
  gemeos: 'gemeos',
  cancer: 'cancer',
  leao: 'leao',
  virgem: 'virgem',
  libra: 'libra',
  escorpiao: 'escorpiao',
  sagitario: 'sagitario',
  capricornio: 'capricornio',
  aquario: 'aquario',
  peixes: 'peixes',
  'áries': 'aries',
  'gêmeos': 'gemeos',
  'câncer': 'cancer',
  'leão': 'leao',
  'escorpião': 'escorpiao',
  'sagitário': 'sagitario',
  'capricórnio': 'capricornio',
  'aquário': 'aquario'
};

// Função para limpar texto
function cleanText(text, type) {
  if (!text) return 'Informação não disponível';
  let cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/(\n\s*){2,}/g, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
  if (['previsao', 'caracteristicas', 'descricao', 'compatibilidade', 'emocionais', 'ambiente'].includes(type)) {
    cleaned = cleaned.replace(/(Consulte o Oráculo grátis|Fazer meu Mapa Astral|Teste sua compatibilidade|Saiba mais sobre você|🧠\s*Por que confiar nesta leitura\?.*?(?=\n|$))/gi, '');
  }
  console.log(`[cleanText] Tipo: ${type}, Saída: ${cleaned.substring(0, 100) || 'N/A'}...`);
  return cleaned || 'Informação não disponível';
}

// Função para scraping da previsão semanal
async function scrapePrevisaoSemanal(signoSlug) {
  const url = `https://www.somostodosum.com.br/horoscopo/signo/${signoSlug}.html`;
  console.log(`[scrapePrevisaoSemanal] Fazendo requisição para ${url}`);

  // Verifica cache
  const cacheKey = `previsao_${signoSlug}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`[scrapePrevisaoSemanal] Retornando dados do cache para ${signoSlug}`);
    return cached;
  }

  // Configuração do User-Agent e headers
  const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
  const headers = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8',
    'Referer': 'https://www.google.com/',
    'Connection': 'keep-alive',
  };

  let html;
  try {
    const retry = async (fn, retries = 3, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await fn();
        } catch (err) {
          if (i === retries - 1) throw err;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };
    const response = await retry(() => axios.get(url, { headers, timeout: 30000 }));
    html = response.data;
    console.log(`[scrapePrevisaoSemanal] HTML recebido (tamanho: ${html.length} caracteres)`);
  } catch (err) {
    console.error(`[scrapePrevisaoSemanal] Erro ao acessar: ${err.message} (Status: ${err.response?.status || 'N/A'})`);
    throw new Error(`Erro ao acessar página: ${err.message}`);
  }

  const $ = cheerio.load(html, { decodeEntities: true });

  // Previsão Semanal
  let previsaoText = '';
  const previsaoContainer = $('article.all-browsers').first();
  console.log(`[Previsão] Container encontrado: ${previsaoContainer.length > 0 ? 'Sim' : 'Não'}`);
  if (previsaoContainer.length) {
    const stopElement = $('b:contains("Personalidade")').first();
    const rawText = previsaoContainer
      .contents()
      .filter((i, el) => {
        const $el = $(el);
        return (
          el.type === 'text' ||
          ($el.is('br, p, strong, span, div, i') &&
            !$el.is('a, script, style, aside') &&
            !$el.find('a, script, style, div[id*="banner"], aside').length)
        );
      })
      .map((i, el) => (el.type === 'text' ? $(el).text() : $(el).is('br') ? '\n' : $(el).text()))
      .get()
      .join('')
      .split(stopElement.length ? stopElement.text() : '$$$')[0];
    previsaoText = cleanText(rawText, 'previsao');
  }
  console.log(`[Previsão] Texto final: ${previsaoText.substring(0, 50)}...`);

  const result = { previsaoSemanal: previsaoText };
  cache.set(cacheKey, result);
  console.log(`[scrapePrevisaoSemanal] Dados salvos no cache para ${signoSlug}`);
  return result;
}

// Função para montar características fixas
function getCaracteristicas(signoSlug) {
  const caracteristicas = {
    aries: {
      nascimento: '20/03 a 20/04',
      elemento: 'Fogo',
      planeta_regente: 'Marte',
      pedras_de_poder_e_protecao: 'Cornalina, Jaspe Vermelho, Ametista',
      pontos_positivos: 'Iniciativa, coragem, ambição, liderança, entusiasmo, audácia, criatividade, desejo de independência',
      pontos_negativos: 'Agressividade, impulsividade, espírito mutável, falta de perseverança, intromissão',
      saude: 'Dores de cabeça, erupções no rosto e na cabeça, vertigens, nevralgias, congestão cerebral, encefalite, meningite, ferimentos, golpes, queimaduras, inflamações, febres elevadas, acidentes',
      compatibilidade: 'Melhores combinações: Leão, Sagitário, Gêmeos. Evite conflitos com Câncer e Capricórnio. Sendo impetuosos, arianos se apaixonam rápido, com ardor, mas podem se desinteressar se o parceiro não acompanhar seu entusiasmo. Cultive paciência para relacionamentos duradouros.',
      descricao_geral: 'O ariano é a personificação da sinceridade, expressando sentimentos de forma intensa e passional. Como o fogo, essa intensidade pode ser fugaz, mas também pode se manifestar em explosões de raiva ou impaciência, nem sempre compreendidas. Sua coragem para enfrentar desafios é admirável, mas decisões impulsivas podem trazer problemas.',
      caracteristicas_emocionais: 'Sinceros e intensos, arianos expressam emoções com paixão, mas essa intensidade pode levar a explosões de raiva ou impaciência. A coragem é seu ponto forte, enfrentando desafios com ousadia, mas a impulsividade pode gerar decisões precipitadas.',
      ambiente_ideal: 'Ambientes dinâmicos e vibrantes, com espaço para ação e liberdade. Para o ariano, o quarto ideal é prático, com decoração minimalista e cores quentes, refletindo sua energia. Ele adormece e acorda rapidamente, sempre com disposição.',
    },
    touro: {
      nascimento: '21/04 a 20/05',
      elemento: 'Terra',
      planeta_regente: 'Vênus',
      pedras_de_poder_e_protecao: 'Quartzo Rosa, Esmeralda, Malaquita',
      pontos_positivos: 'Lealdade, paciência, determinação, sensualidade, praticidade',
      pontos_negativos: 'Teimosia, possessividade, resistência à mudança',
      saude: 'Atenção à garganta, pescoço e tireoide',
      compatibilidade: 'Melhores combinações: Virgem, Capricórnio, Câncer. Evite tensões com Leão e Aquário. Touro busca relações estáveis, mas sua possessividade pode gerar conflitos. Paciência e diálogo são essenciais.',
      descricao_geral: 'Touro valoriza estabilidade, conforto e prazeres sensoriais. É confiável, prático e aprecia beleza e segurança. Sua teimosia, porém, pode dificultar adaptações a mudanças ou novas ideias.',
      caracteristicas_emocionais: 'Estável e carinhoso, Touro é leal, mas pode ser possessivo. Busca segurança emocional e valoriza gestos concretos de afeto, sendo menos impulsivo que outros signos.',
      ambiente_ideal: 'Ambientes confortáveis, com decoração elegante, tecidos macios e cores terrosas. Um quarto taurino deve ser acolhedor, com elementos que estimulem os sentidos, como aromas suaves e iluminação quente.',
    },
    gemeos: {
      nascimento: '21/05 a 20/06',
      elemento: 'Ar',
      planeta_regente: 'Mercúrio',
      pedras_de_poder_e_protecao: 'Ágata, Citrino, Olho de Tigre',
      pontos_positivos: 'Comunicatividade, versatilidade, curiosidade, inteligência',
      pontos_negativos: 'Inconstância, dispersão, superficialidade',
      saude: 'Cuidado com pulmões, sistema nervoso e mãos',
      compatibilidade: 'Melhores combinações: Libra, Aquário, Áries. Evite conflitos com Virgem e Peixes. Gêmeos se encanta com novidades, mas pode perder o interesse rapidamente. Relacionamentos precisam de estímulo intelectual.',
      descricao_geral: 'Gêmeos é curioso, comunicativo e adora novidades. Sua mente ágil o torna versátil, mas a dispersão pode dificultar foco e comprometimento em projetos ou relações.',
      caracteristicas_emocionais: 'Leve e adaptável, Gêmeos é emocionalmente versátil, mas pode parecer instável. Busca conexões baseadas em diálogo e troca de ideias, evitando emoções muito intensas.',
      ambiente_ideal: 'Ambientes estimulantes, com livros, tecnologia e espaço para interação. Um quarto geminiano é funcional, com cores claras e elementos que inspirem criatividade.',
    },
    cancer: {
      nascimento: '21/06 a 22/07',
      elemento: 'Água',
      planeta_regente: 'Lua',
      pedras_de_poder_e_protecao: 'Pérola, Pedra da Lua, Quartzo Leitoso',
      pontos_positivos: 'Sensibilidade, lealdade, intuição, proteção',
      pontos_negativos: 'Humor instável, apego excessivo, insegurança',
      saude: 'Atenção ao estômago, sistema digestivo e peito',
      compatibilidade: 'Melhores combinações: Escorpião, Peixes, Touro. Evite tensões com Áries e Libra. Câncer busca segurança emocional, mas o apego pode gerar dependência. Confiança é essencial.',
      descricao_geral: 'Câncer é protetor, intuitivo e profundamente emocional. Valoriza laços familiares e segurança, mas seu humor pode oscilar, influenciado pela Lua.',
      caracteristicas_emocionais: 'Muito sensível, Câncer busca segurança emocional e laços profundos. Pode ser reservado até sentir confiança, mas é extremamente leal e acolhedor.',
      ambiente_ideal: 'Ambientes acolhedores, com cores suaves, fotos de família e elementos nostálgicos. Um quarto canceriano é um refúgio, com almofadas e iluminação suave.',
    },
    leao: {
      nascimento: '23/07 a 22/08',
      elemento: 'Fogo',
      planeta_regente: 'Sol',
      pedras_de_poder_e_protecao: 'Âmbar, Olho de Tigre, Citrino',
      pontos_positivos: 'Carisma, generosidade, confiança, liderança',
      pontos_negativos: 'Arrogância, necessidade de atenção, teimosia',
      saude: 'Cuidado com o coração, coluna e sistema circulatório',
      compatibilidade: 'Melhores combinações: Áries, Sagitário, Libra. Evite conflitos com Touro e Escorpião. Leão ama com intensidade, mas precisa de admiração. Equilibre ego e afeto.',
      descricao_geral: 'Leão é confiante, carismático e adora ser o centro das atenções. Sua energia vibrante inspira, mas a necessidade de validação pode gerar conflitos.',
      caracteristicas_emocionais: 'Apaixonado e expressivo, Leão busca admiração e demonstra afeto com generosidade. Pode ser dramático, mas é leal e protetor com quem ama.',
      ambiente_ideal: 'Ambientes vibrantes, com cores quentes, espelhos e decoração ousada. Um quarto leonino reflete sua personalidade, com elementos que destacam seu brilho.',
    },
    virgem: {
      nascimento: '23/08 a 22/09',
      elemento: 'Terra',
      planeta_regente: 'Mercúrio',
      pedras_de_poder_e_protecao: 'Sodalita, Jade, Amazonita',
      pontos_positivos: 'Organização, perfeccionismo, dedicação, praticidade',
      pontos_negativos: 'Crítica excessiva, ansiedade, rigidez',
      saude: 'Atenção ao sistema digestivo e intestinos',
      compatibilidade: 'Melhores combinações: Touro, Capricórnio, Câncer. Evite tensões com Gêmeos e Sagitário. Virgem é leal, mas sua crítica pode afastar. Valorize a paciência.',
      descricao_geral: 'Virgem é meticuloso, analítico e dedicado ao serviço. Sua atenção aos detalhes é incomparável, mas o perfeccionismo pode gerar ansiedade.',
      caracteristicas_emocionais: 'Reservado, Virgem é leal e atencioso, mas pode reprimir emoções por medo de vulnerabilidade. Busca relações estáveis e práticas.',
      ambiente_ideal: 'Ambientes organizados, com decoração minimalista e cores neutras. Um quarto virginiano é funcional, com tudo em seu lugar e espaço para reflexão.',
    },
    libra: {
      nascimento: '23/09 a 22/10',
      elemento: 'Ar',
      planeta_regente: 'Vênus',
      pedras_de_poder_e_protecao: 'Quartzo Rosa, Turmalina, Safira',
      pontos_positivos: 'Diplomacia, charme, equilíbrio, sociabilidade',
      pontos_negativos: 'Indecisão, dependência, evitamento de conflitos',
      saude: 'Cuidado com rins, sistema urinário e lombar',
      compatibilidade: 'Melhores combinações: Gêmeos, Aquário, Leão. Evite conflitos com Câncer e Capricórnio. Libra busca harmonia, mas precisa superar a indecisão.',
      descricao_geral: 'Libra busca harmonia, beleza e equilíbrio. É diplomático e sociável, mas sua indecisão pode atrasar decisões importantes.',
      caracteristicas_emocionais: 'Romântico e sociável, Libra evita conflitos e valoriza parcerias. Pode sacrificar suas necessidades para agradar, buscando equilíbrio emocional.',
      ambiente_ideal: 'Ambientes elegantes, com cores pastéis, arte e simetria. Um quarto libriano é harmonioso, com decoração refinada e toques românticos.',
    },
    escorpiao: {
      nascimento: '23/10 a 21/11',
      elemento: 'Água',
      planeta_regente: 'Plutão, Marte',
      pedras_de_poder_e_protecao: 'Granada, Obsidiana, Topázio',
      pontos_positivos: 'Intensidade, determinação, lealdade, intuição',
      pontos_negativos: 'Ciúmes, vingança, controle excessivo',
      saude: 'Atenção ao sistema reprodutivo e intestinos',
      compatibilidade: 'Melhores combinações: Câncer, Peixes, Capricórnio. Evite tensões com Leão e Aquário. Escorpião ama intensamente, mas precisa controlar ciúmes.',
      descricao_geral: 'Escorpião é intenso, misterioso e leal. Sua profundidade emocional e determinação o tornam magnético, mas o desejo de controle pode gerar conflitos.',
      caracteristicas_emocionais: 'Profundo e apaixonado, Escorpião guarda emoções intensas e valoriza confiança. Pode ser reservado, mas é extremamente leal.',
      ambiente_ideal: 'Ambientes privados, com cores escuras, velas e decoração introspectiva. Um quarto escorpiano é um santuário, com toques de mistério.',
    },
    sagitario: {
      nascimento: '22/11 a 21/12',
      elemento: 'Fogo',
      planeta_regente: 'Júpiter',
      pedras_de_poder_e_protecao: 'Turquesa, Sodalita, Lápis-lazúli',
      pontos_positivos: 'Otimismo, liberdade, aventura, sinceridade',
      pontos_negativos: 'Impulsividade, falta de tato, exagero',
      saude: 'Cuidado com quadris, fígado e coxas',
      compatibilidade: 'Melhores combinações: Áries, Leão, Libra. Evite conflitos com Virgem e Peixes. Sagitário busca liberdade, mas precisa de parceiros que respeitem seu espaço.',
      descricao_geral: 'Sagitário é aventureiro, otimista e amante da liberdade. Sua busca por conhecimento e experiências pode levar a exageros ou falta de foco.',
      caracteristicas_emocionais: 'Entusiasta, Sagitário é emocionalmente desapegado, valorizando liberdade acima de tudo. Sua sinceridade pode ser mal interpretada.',
      ambiente_ideal: 'Ambientes abertos, com elementos de viagem, cores vibrantes e espaço para movimento. Um quarto sagitariano reflete sua paixão por aventuras.',
    },
    capricornio: {
      nascimento: '22/12 a 20/01',
      elemento: 'Terra',
      planeta_regente: 'Saturno',
      pedras_de_poder_e_protecao: 'Ônix, Turmalina Negra, Quartzo Fumê',
      pontos_positivos: 'Disciplina, ambição, responsabilidade, lealdade',
      pontos_negativos: 'Rigidez, pessimismo, frieza',
      saude: 'Atenção aos ossos, joelhos e dentes',
      compatibilidade: 'Melhores combinações: Touro, Virgem, Escorpião. Evite tensões com Áries e Libra. Capricórnio valoriza compromisso, mas pode ser reservado emocionalmente.',
      descricao_geral: 'Capricórnio é disciplinado, ambicioso e focado em metas. Sua determinação é inabalável, mas a rigidez pode dificultar relações pessoais.',
      caracteristicas_emocionais: 'Reservado, Capricórnio é leal e confiável, mas pode parecer frio. Valoriza segurança e estabilidade emocional, evitando vulnerabilidades.',
      ambiente_ideal: 'Ambientes estruturados, com decoração sóbria, cores escuras e móveis funcionais. Um quarto capricorniano é prático e elegante.',
    },
    aquario: {
      nascimento: '21/01 a 19/02',
      elemento: 'Ar',
      planeta_regente: 'Urano, Saturno',
      pedras_de_poder_e_protecao: 'Ametista, Água-marinha, Turquesa',
      pontos_positivos: 'Originalidade, independência, visão, humanitarismo',
      pontos_negativos: 'Distância emocional, teimosia, imprevisibilidade',
      saude: 'Cuidado com tornozelos, circulação e sistema nervoso',
      compatibilidade: 'Melhores combinações: Gêmeos, Libra, Áries. Evite conflitos com Touro e Escorpião. Aquário valoriza liberdade, mas precisa equilibrar desapego.',
      descricao_geral: 'Aquário é inovador, visionário e valoriza a liberdade. Sua originalidade inspira, mas a distância emocional pode dificultar conexões profundas.',
      caracteristicas_emocionais: 'Independente, Aquário pode parecer emocionalmente distante, mas é leal e idealista. Busca conexões baseadas em ideias e causas.',
      ambiente_ideal: 'Ambientes modernos, com tecnologia, cores vivas e espaço colaborativo. Um quarto aquariano é excêntrico, com toques futuristas.',
    },
    peixes: {
      nascimento: '20/02 a 20/03',
      elemento: 'Água',
      planeta_regente: 'Netuno, Júpiter',
      pedras_de_poder_e_protecao: 'Ametista, Água-marinha, Fluorita',
      pontos_positivos: 'Empatia, intuição, criatividade, compaixão',
      pontos_negativos: 'Escapismo, sensibilidade excessiva, falta de limites',
      saude: 'Atenção aos pés, sistema linfático e imunidade',
      compatibilidade: 'Melhores combinações: Câncer, Escorpião, Capricórnio. Evite tensões com Gêmeos e Sagitário. Peixes busca conexões profundas, mas precisa de limites claros.',
      descricao_geral: 'Peixes é sonhador, intuitivo e profundamente empático. Sua sensibilidade o torna criativo, mas o escapismo pode dificultar enfrentar a realidade.',
      caracteristicas_emocionais: 'Muito sensível, Peixes é conectado espiritualmente e valoriza laços profundos. Pode absorver emoções alheias, precisando de proteção emocional.',
      ambiente_ideal: 'Ambientes calmos, com cores suaves, elementos aquáticos e decoração espiritual. Um quarto pisciano é um refúgio para sonhos e introspecção.',
    },
  };

  return caracteristicas[signoSlug] || {};
}

// Função para obter dados de todos os signos
async function getAllSignosData() {
  const signos = Object.values(signosMap).filter((v, i, a) => a.indexOf(v) === i); // Remove duplicatas
  const result = {};

  for (const signoSlug of signos) {
    try {
      const previsao = await scrapePrevisaoSemanal(signoSlug);
      const caracteristicas = getCaracteristicas(signoSlug);
      result[signoSlug] = {
        img: `https://www.somostodosum.com.br/horoscopo/img/${signoSlug}.png`,
        previsaoSemanal: previsao.previsaoSemanal,
        caracteristicas,
      };
      console.log(`[getAllSignosData] Dados processados para ${signoSlug}`);
    } catch (err) {
      console.error(`[getAllSignosData] Erro ao processar ${signoSlug}: ${err.message}`);
      result[signoSlug] = { error: `Erro ao obter dados: ${err.message}` };
    }
  }

  return result;
}

// Endpoints
router.get('/', (req, res) => res.json(Object.keys(signosMap)));

router.get('/all', async (req, res, next) => {
  try {
    const data = await getAllSignosData();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:signo', async (req, res, next) => {
  let { signo } = req.params;
  signo = signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const slug = signosMap[signo];
  if (!slug) return res.status(404).json({ error: 'Signo não encontrado.' });

  try {
    const previsao = await scrapePrevisaoSemanal(slug);
    const caracteristicas = getCaracteristicas(slug);
    const data = {
      img: `https://www.somostodosum.com.br/horoscopo/img/${slug}.png`,
      previsaoSemanal: previsao.previsaoSemanal,
      caracteristicas,
    };
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
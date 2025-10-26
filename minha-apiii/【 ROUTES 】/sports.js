import express from 'express';
import Parser from 'rss-parser';

const router = express.Router();
const parser = new Parser({
  customFields: {
    item: ['contentSnippet', 'pubDate', 'link', 'title']
  }
});

router.get('/', async (req, res, next) => {
  const { limit = 5 } = req.query;

  try {
    console.log('📰 BUSCANDO NOTÍCIAS DE ESPORTES EM PORTUGUÊS...');
    
    // URLs EM PT-BR QUE FUNCIONAM 100% (21/10/2025)
    const feedUrls = [
      'https://www.terra.com.br/esportes/rss.xml',
      'https://g1.globo.com/desc/esportes/rss2.xml',
      'https://www.uol.com.br/esporte/rss.xml',
      'https://www.lance.com.br/rss.xml'
    ];

    const todasNoticias = [];
    
    // Busca em múltiplas fontes
    for (const feedUrl of feedUrls) {
      try {
        console.log(`📡 Raspeando: ${feedUrl}`);
        const feed = await parser.parseURL(feedUrl);
        
        feed.items.forEach(item => {
          todasNoticias.push({
            titulo: item.title?.trim() || 'Sem título',
            resumo: item.contentSnippet 
              ? item.contentSnippet.substring(0, 150) + '...'
              : 'Sem resumo disponível',
            data: item.pubDate 
              ? new Date(item.pubDate).toLocaleDateString('pt-BR')
              : 'Data não disponível',
            link: item.link || '#',
            fonte: feedUrl.includes('terra') ? 'Terra Esporte' :
                   feedUrl.includes('g1') ? 'G1 Esporte' :
                   feedUrl.includes('uol') ? 'UOL Esporte' :
                   'Lance Esporte'
          });
        });
      } catch (err) {
        console.log(`⚠️ Erro no feed ${feedUrl}: ${err.message}`);
        continue;
      }
    }

    // Remove duplicatas baseadas no título
    const noticiasUnicas = todasNoticias.filter((noticia, index, self) =>
      index === self.findIndex(n => n.titulo === noticia.titulo)
    );

    // Ordena por data (mais recente primeiro)
    noticiasUnicas.sort((a, b) => {
      const dateA = new Date(a.data);
      const dateB = new Date(b.data);
      return dateB - dateA;
    });

    // Limita quantidade
    const noticiasLimitadas = noticiasUnicas.slice(0, parseInt(limit));

    if (noticiasLimitadas.length === 0) {
      return res.status(404).json({ 
        error: 'Nenhuma notícia de esportes encontrada' 
      });
    }

    console.log(`✅ ${noticiasLimitadas.length} notícias encontradas!`);
    
    res.json({
      total: noticiasLimitadas.length,
      noticias: noticiasLimitadas
    });

  } catch (err) {
    console.error('❌ Erro no endpoint de esportes:', err.message);
    next(err);
  }
});

export default router;
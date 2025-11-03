// routes/brasileirao.js
import express from 'express';
import { fetchTabelaBrasileirao } from '../../【 SCRAPERS 】/brasileiraoService.js';
import { formatTabela } from '../../【 UTILS 】/formatTabela.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { limit = 20 } = req.query;

  try {
    const tabelaCompleta = await fetchTabelaBrasileirao(); // já retorna o array
    const tabela = formatTabela(tabelaCompleta, Number(limit));

    res.json({
      serie: 'A',
      campeonato: 'Brasileirão Série A',
      atualizado_em: new Date().toLocaleString('pt-BR'),
      fonte: 'Gazeta Esportiva (via Bronxys)',
      total_times: tabelaCompleta.length,
      tabela,
    });
  } catch (err) {
    console.error('Erro na rota /tabela:', err.message);
    res.status(500).json({
      error: 'Falha ao carregar a tabela do Brasileirão',
      detalhes: err.message,
    });
  }
});

export default router;
// api/endpoints/brasileirao.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

// API Bronxys (funciona com a key que você passou)
const API_BASE = 'https://api.bronxyshost.com.br/api-bronxys/tabela_camp';
const API_KEY = 'juniornerd_ISM'; // SUA KEY

router.get('/', async (req, res, next) => {
  const { serie = 'a', limit = 20 } = req.query;

  // Valida série
  const seriesValidas = ['a', 'b', 'c', 'd'];
  if (!seriesValidas.includes(serie.toLowerCase())) {
    return res.status(400).json({ error: 'Série inválida. Use a, b, c ou d' });
  }

  try {
    const url = `${API_BASE}?apikey=${API_KEY}&serie=${serie.toLowerCase()}`;
    const { data } = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    // Valida resposta
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ error: 'Tabela vazia ou série não encontrada' });
    }

    // Limita resultados
    const tabela = data.slice(0, parseInt(limit));

    // Formata como você quer (igual ao exemplo do bot)
    const resposta = tabela.map((v, i) => ({
      posicao: v.posicao || (i + 1),
      time: v.time,
      sigla: v.sigla,
      pontos: v.pontos,
      jogos: v.jogos,
      vitorias: v.vitorias,
      empates: v.empates,
      derrotas: v.derrotas,
      gols_pro: v.gols_pro,
      gols_contra: v.gols_contra,
      saldo_gols: v.gols_pro - v.gols_contra,
      aproveitamento: v.aproveitamento || ((v.pontos / (v.jogos * 3)) * 100).toFixed(2) + '%',
    }));

    res.json({
      serie: serie.toUpperCase(),
      atualizado_em: new Date().toLocaleString('pt-BR'),
      total_times: data.length,
      tabela: resposta,
    });
  } catch (err) {
    console.error('Erro na API Bronxys:', err.message);
    next(err);
  }
});

export default router;
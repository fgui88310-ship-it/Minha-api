// 【 UTILS 】/formatTabela.js
export function formatTabela(tabela, limit) {
  return tabela
    .slice(0, limit)
    .map((time, index) => ({
      posicao: Number(time.position),
      time: time.team,
      escudo: time.shield,
      pontos: Number(time.points),
      jogos: Number(time.games),
      vitorias: Number(time.wins),
      empates: Number(time.draws),
      derrotas: Number(time.losses),
      gols_pro: Number(time.goalsFor),
      gols_contra: Number(time.goalsAgainst),
      saldo_gols: Number(time.goalDifference),
      aproveitamento: `${time.efficiency}%`,
      zona: getZonaClassificacao(time.classification, Number(time.position)),
    }));
}

function getZonaClassificacao(classification, posicao) {
  if (classification === 'table__green') return 'Libertadores';
  if (classification === 'table__orange') return 'Sul-Americana / Pré-Libertadores';
  if (classification === 'table__red') return 'Rebaixamento';
  if (posicao <= 6) return 'Libertadores';
  if (posicao <= 12) return 'Sul-Americana';
  if (posicao >= 17) return 'Rebaixamento';
  return 'Meio de tabela';
}
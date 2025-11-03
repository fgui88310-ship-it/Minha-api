export function formatTabela(data, limit) {
  return data.slice(0, parseInt(limit)).map((v, i) => ({
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
    aproveitamento:
      v.aproveitamento ||
      ((v.pontos / (v.jogos * 3)) * 100).toFixed(2) + '%',
  }));
}
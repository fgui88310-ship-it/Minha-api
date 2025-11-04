/**
 * Extrai e organiza informações dos filmes a partir do HTML carregado
 * @param {CheerioStatic} $ 
 * @returns {Array} lista de filmes formatada
 */
export function parseFilmes($) {
  const filmes = [];

  $('section.section-wrap.gd-2-cols.gd-gap-30 .gd-col-left .mdl .card.entity-card.entity-card-list').each((_, el) => {
    const title = $(el).find('.meta-title-link').text().trim();
    const releaseDate = $(el).find('.meta-body-item.meta-body-info .date').text().trim();
    const rating = $(el).find('.stareval-note').first().text().trim() || 'N/A';
    const directors = $(el).find('.meta-body-item.meta-body-direction .dark-grey-link')
      .map((_, d) => $(d).text().trim()).get().join(', ') || 'Sem informação';
    const cast = $(el).find('.meta-body-item.meta-body-actor .dark-grey-link')
      .map((_, c) => $(c).text().trim()).get().join(', ') || 'Sem informação';
    const synopsis = $(el).find('.synopsis .content-txt').text().trim();

    if (title && synopsis.length > 20) {
      filmes.push({
        title,
        releaseDate,
        rating,
        directors,
        cast,
        synopsis: synopsis.slice(0, 200) + (synopsis.length > 200 ? '...' : ''),
      });
    }
  });

  return filmes;
}
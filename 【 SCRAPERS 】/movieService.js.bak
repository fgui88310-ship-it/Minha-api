import axios from 'axios';

export async function searchMovies(query, limit) {
  const apiKey = "ddfcb99fae93e4723232e4de755d2423";
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=pt-BR&page=1`;
  const { data } = await axios.get(url, { timeout: 5000 });
  if (!data.results || data.results.length === 0) throw new Error('Nenhum filme encontrado');

  return data.results.slice(0, limit).map(f => ({
    id: f.id,
    titulo: f.title,
    original_title: f.original_title,
    overview: f.overview || "Sem descrição disponível",
    poster: f.poster_path ? `https://image.tmdb.org/t/p/w500${f.poster_path}` : null,
    backdrop: f.backdrop_path ? `https://image.tmdb.org/t/p/w780${f.backdrop_path}` : null,
    release_date: f.release_date,
    vote_average: f.vote_average,
    vote_count: f.vote_count,
    popularity: f.popularity,
    adult: f.adult
  }));
}
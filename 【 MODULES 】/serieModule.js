const API_KEY = 'ddfcb99fae93e4723232e4de755d2423';

const SerieModule = {
  searchUrl(query, page = 1) {
    return `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&page=${page}`;
  },

  posterUrl(path) {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
  },

  backdropUrl(path) {
    return path ? `https://image.tmdb.org/t/p/w780${path}` : null;
  }
};

export default SerieModule;

import * as cheerio from 'cheerio';

const PornhubModule = {
  firstpage: 1,

  videoUrl(query, page = 1) {
    return `https://www.pornhub.com/video/search?search=${encodeURIComponent(query)}&page=${page}`;
  },

  gifUrl(query, page = 1) {
    return `https://www.pornhub.com/gifs/search?search=${encodeURIComponent(query)}&page=${page}`;
  },

  parseVideos(html) {
    const $ = cheerio.load(html);
    const videos = $('ul.videos.search-video-thumbs li');

    return videos.map((i, el) => {
      const li = $(el);
      const a = li.find('a').eq(0);
      const thumb = li.find('img').attr('data-mediumthumb') || '';

      return {
        titulo: a.text().trim(),
        link: 'https://pornhub.com' + a.attr('href'),
        duracao: li.find('.duration').text(),
        miniatura: thumb.replace(/\([^)]*\)/g, '')
      };
    }).get();
  },

  parseGifs(html) {
    const $ = cheerio.load(html);
    const gifs = $('ul.gifs.gifLink li');

    return gifs.map((i, el) => {
      const tag = $(el).find('a');
      return {
        titulo: tag.find('span').text(),
        link: `https://dl.phncdn.com${tag.attr('href')}.gif`,
        webm: tag.find('video').attr('data-webm')
      };
    }).get();
  }
};

export default PornhubModule;
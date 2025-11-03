import * as cheerio from 'cheerio';

export function parseAppleMusicResults(html, limit = 5) {
  const $ = cheerio.load(html);
  const results = [];

  $('li.shelf-grid__list-item').each((i, el) => {
    if (results.length >= limit) return false;

    const trackLockup = $(el).find('.track-lockup');
    const title = trackLockup.find('.track-lockup__title a').text().trim();

    const artists = [];
    const artistUrls = [];
    trackLockup.find('.track-lockup__subtitle a').each((i, artistEl) => {
      const artistName = $(artistEl).text().trim();
      const artistUrl = $(artistEl).attr('href');
      if (artistName) artists.push(artistName);
      if (artistUrl) artistUrls.push(artistUrl);
    });

    const songUrl = trackLockup.find('.track-lockup__title a').attr('href');

    if (title && artists.length > 0) {
      results.push({
        title,
        artistInfo: {
          name: artists.join(', '),
          url: artistUrls[0] || '',
        },
        songUrl: songUrl || '',
      });
    }
  });

  return results;
}
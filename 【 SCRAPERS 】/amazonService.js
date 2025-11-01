import axios from 'axios';

export async function fetchAmazonSearchHTML(query) {
  const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
  const { data } = await axios.get(searchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    timeout: 5000,
  });
  return data;
}
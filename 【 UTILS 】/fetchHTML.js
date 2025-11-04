import axios from 'axios';
import { DEFAULT_HEADERS } from '../config.js';

export async function fetchHTML(url, timeout = 15000) {
  const { data } = await axios.get(url, {
    headers: DEFAULT_HEADERS,
    timeout
  });
  return data;
}
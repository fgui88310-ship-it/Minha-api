import axios from 'axios';
import { formatClimaData } from '../【 UTILS 】/formatClima.js';

export async function getClimaData(cidade) {
  const url = `https://wttr.in/${encodeURIComponent(cidade)}?format=j1`;
  const { data } = await axios.get(url);
  return formatClimaData(data, cidade);
}
import axios from 'axios';
import http from 'http';
import https from 'https';
import { CONFIG } from '../config.js';

export const axiosInstance = axios.create({
  baseURL: CONFIG.API.BASE_URL,
  timeout: CONFIG.API.TIMEOUT,
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  headers: CONFIG.API.HEADERS
});
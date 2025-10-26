// Bibliotecas externas
import axios from 'axios';
import http from 'http';
import https from 'https';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { spawn } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';
import * as cheerio from 'cheerio';
import rateLimit from 'express-rate-limit';

// Utils internas
import constants from '../【 UTILS 】/constants.js';
const { USER_AGENTS } = constants;
import { downloadMedia } from '../【 UTILS 】/mediaDownloader.js';
import { setCache, getCache, setMp3Cache, getMp3Cache, setThreadsCache, getThreadsCache } from '../【 UTILS 】/cache.js';
import { saveToJson, cleanupOldFiles } from '../【 UTILS 】/fileUtils.js';
import { parseHtml, getBasicInfo } from '../【 UTILS 】/htmlParser.js';

// Exportando tudo
export {
  axios,
  http,
  https,
  fs,
  fsSync,
  path,
  pipeline,
  spawn,
  ffmpeg,
  cheerio,
  USER_AGENTS,
  setCache,
  getCache,
  setMp3Cache,
  getMp3Cache,
  setThreadsCache,
  getThreadsCache,
  rateLimit,
  saveToJson,
  cleanupOldFiles,
  parseHtml,
  getBasicInfo
};
import NodeCache from 'node-cache';

const dataCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const mp3Cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

export const getCache = (key) => dataCache.get(key);
export const setCache = (key, value) => dataCache.set(key, value);
export const getMp3Cache = (key) => mp3Cache.get(key);
export const setMp3Cache = (key, value) => mp3Cache.set(key, value);
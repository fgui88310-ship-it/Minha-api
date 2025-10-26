console.log('carregado l metadinha') 
import express from 'express';
const router = express.Router();

const METADINHAS = [
  { metadinha: 1, links: ["https://files.catbox.moe/dde3nr.jpg","https://files.catbox.moe/8k63pm.jpg"] },
  { metadinha: 2, links: ["https://files.catbox.moe/ulgqrz.jpg","https://files.catbox.moe/3i9m6r.jpg"] },
  { metadinha: 3, links: ["https://files.catbox.moe/bhrczc.jpg","https://files.catbox.moe/fn8gkc.jpg"] },
  { metadinha: 4, links: ["https://files.catbox.moe/jr61il.jpg","https://files.catbox.moe/j21vc2.jpg"] },
  { metadinha: 5, links: ["https://files.catbox.moe/5vz8ld.jpg","https://files.catbox.moe/wt1rvb.jpg"] },
  { metadinha: 6, links: ["https://files.catbox.moe/jhz069.jpg","https://files.catbox.moe/zzx4ek.jpg"] },
  { metadinha: 7, links: ["https://files.catbox.moe/pc1gkp.jpg","https://files.catbox.moe/nl3l0p.jpg"] },
];
console.log("METADINHAS") 
// Endpoint que retorna uma metadinha aleatória
router.get('/', (req, res, next) => {
  try { 
  const randomIndex = Math.floor(Math.random() * METADINHAS.length);
  res.json([METADINHAS[randomIndex]]);
  } catch (err) {
  next(err);
  }
});
console.log("1") 

// Endpoint que retorna todas as metadinhas
router.get('/all', (req, res) => {
  try { 
  res.json(METADINHAS);
  } catch (err) { 
  next(err);
  }
});
console.log("retornado") 
export default router;
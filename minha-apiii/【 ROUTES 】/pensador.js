import express from 'express';
import { fetchFrasesPensador } from '../【 SCRAPERS 】/scrapePensador.js';
import { maxFrases } from '../config.js';
const router = express.Router();

/**
 * Endpoint: /api/pensador?query=Amor&limit=5
 * Returns up to `limit` phrases from Pensador related to the query term.
 */
router.get('/', async (req, res, next) => {
  try {
    const { query, limit } = req.query;
    if (!query) return res.status(400).json({ error: 'Passe ?query=' });
    
    const frases = await fetchFrasesPensador(query, maxFrases);

    res.json({
      termo: query,
      quantidade: frases.length,
      frases,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
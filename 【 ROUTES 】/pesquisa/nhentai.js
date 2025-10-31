import express from 'express';
import { limit } from '../../config.js';
import { validateQueryParams } from '../../【 VALIDATORS 】/nhentaiValidator.js';
import { searchDoujin } from '../../【 SCRAPERS 】/nhentaiService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { query, page = '1', limit: max = '10', pages = '1' } = req.query;

  let params;
  try {
    params = validateQueryParams(query, page, max, pages);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    const tasks = Array.from({ length: params.pages }, (_, i) =>
      limit(() => searchDoujin(query, params.page + i))
    );

    const results = (await Promise.all(tasks)).flat();

    if (!results.length)
      return res.status(404).json({ error: 'Nenhum doujinshi encontrado.' });

    res.json(results.slice(0, params.max));
  } catch (err) {
    next(err);
  }
});

export default router;
import express from 'express';
import { getClimaData } from '../../【 SCRAPERS 】/climaService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { cidade } = req.query;
  if (!cidade) {
    return res.status(400).json({ error: 'Passe ?cidade=NomeDaCidade' });
  }

  try {
    const dados = await getClimaData(cidade);
    res.json(dados);
  } catch (err) {
    next(err);
  }
});

export default router;
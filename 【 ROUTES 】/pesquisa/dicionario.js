import express from 'express';
import { buscarPalavra } from '../../【 SCRAPERS 】/dicionarioService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { palavra } = req.query;

  if (!palavra)
    return res.status(400).json({ error: 'Passe ?palavra= para buscar no Dicio' });

  try {
    const resultado = await buscarPalavra(palavra);
    if (!resultado)
      return res.status(404).json({ error: `Nenhuma definição ou exemplo encontrado para "${palavra}"` });

    res.json(resultado);
  } catch (error) {
    next(error);
  }
});

export default router;
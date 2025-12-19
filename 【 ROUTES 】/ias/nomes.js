// src/routes/nomes.js
import express from 'express';
import { gerar } from '../../controllers/nomesController.js';  // Note: .js, não .py

const router = express.Router();

router.get('/', gerar);
// Exemplo de uso: GET /api/nomes?quantidade=10&temperature=1.2

export default router;
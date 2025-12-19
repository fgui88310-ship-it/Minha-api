import express from 'express';
import { gptController } from '../../controllers/gptController.js';

const router = express.Router();

router.get('/', gptController);

export default router;


import express from 'express';
import { 
  translatePostController,
  translateGetController
} from '../../controllers/translatorController.js';

const router = express.Router();

router.post('/', translatePostController);
router.get('/', translateGetController);

export default router;
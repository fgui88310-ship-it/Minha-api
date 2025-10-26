import express from 'express';
import { transformations } from '../【 UTILS 】/transformations.js';
import { onlyEmojisRegex, MIN_LENGTH, MAX_LENGTH } from '../config.js';
import { validateRequiredFields, validateText } from '../【 VALIDATORS 】/nickgen.js';

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
  const requiredFields = ['text'];

  const missingError = validateRequiredFields(req.query, requiredFields);
  if (missingError) return res.status(400).json({ error: missingError });

  const text = String(req.query.text);
  const textError = validateText(text, onlyEmojisRegex, MIN_LENGTH, MAX_LENGTH);
  if (textError) return res.status(400).json({ error: textError });

  const results = transformations.map(t => ({
    name: t.name,
    result: [...text].map(t.map).join('')
  }));

  res.json(results);
  } catch (err) {
  next(err);
  }
});

export default router;
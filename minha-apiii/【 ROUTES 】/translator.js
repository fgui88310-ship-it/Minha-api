// api/endpoints/translator.js
import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Função de tradução (baseada no seu exemplo)
async function translate(text, from = 'auto', to = 'en') {
    const url = `https://translate.google.com/translate_a/single?client=at&dt=t&dj=1`;
    const body = new URLSearchParams({ sl: from, tl: to, q: text }).toString();
    
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
        body
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const { sentences } = await res.json();
    return sentences
        .filter(s => s.trans)
        .map(s => s.trans)
        .join('');
}

router.post('/', async (req, res, next) => {
    const { text, from = 'auto', to = 'en' } = req.body;

    // Validações
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ 
            error: 'Parâmetros obrigatórios: text (string)' 
        });
    }

    if (!from || !to) {
        return res.status(400).json({ 
            error: 'Parâmetros obrigatórios: from e to' 
        });
    }

    try {
        const translatedText = await translate(text, from, to);
        
        res.json({
            success: true,
            original: {
                text: text,
                lang: from
            },
            translated: {
                text: translatedText,
                lang: to
            }
        });
    } catch (err) {
        next(err);
    }
});

// Endpoint GET alternativo (mais simples)
router.get('/', async (req, res, next) => {
    const { text, from = 'auto', to = 'en' } = req.query;

    if (!text) {
        return res.status(400).json({ 
            error: 'Parâmetro obrigatório: ?text=' 
        });
    }

    try {
        const translatedText = await translate(text, from, to);
        
        res.json({
            success: true,
            original: text,
            translated: translatedText,
            from,
            to
        });
    } catch (err) {
        next(err);
    }
});

export default router;
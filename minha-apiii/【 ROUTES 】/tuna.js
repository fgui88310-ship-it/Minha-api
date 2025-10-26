// routes/tuna.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { query, limit = 5 } = req.query;
  if (!query) return res.status(400).json({ error: 'Passe ?query= para buscar sons' });

  try {
    const searchUrl = 'https://api.voicemod.net/v1/content-hub/sounds/';
    const params = {
      'audio-format': 'mp3',
      'custom': 'true',
      'published': 'true',
      'size': parseInt(limit) > 36 ? 36 : parseInt(limit), // Tuna API limits to 36 items
      'sort': '-trending',
      'text': query,
    };

    const headers = {
      'app-name': 'MakiseAPI',
      'app-version': '1.0.0',
      'app-os': 'windows',
    };

    const { data } = await axios.get(searchUrl, {
      params,
      headers,
      timeout: 5000,
    });

    const sons = data.items.slice(0, parseInt(limit)).map((item) => ({
      id: item.id || 'N/A',
      titulo: item.name.length > 100 ? item.name.substring(0, 97) + '...' : item.name,
      imagem: item.icon?.url || 'N/A',
      link: item.publicInfo?.url || 'N/A',
      duracao: item.duration ? `${(item.duration / 1000).toFixed(2)}s` : 'N/A',
      audio: item.audio?.url || 'N/A',
      tags: item.publicInfo?.tags || [],
      categoria: item.publicInfo?.categories?.[0] || 'N/A',
      proprietario: item.publicInfo?.ownerName || 'N/A',
      sensivel: item.publicInfo?.sensitiveContent || false,
    }));

    if (sons.length === 0) {
      return res.status(404).json({ error: 'Nenhum som encontrado para a consulta' });
    }

    res.json(sons);
  } catch (err) {
    console.error('Erro na requisição:', err.message);
    next(err);
  }
});

export default router;
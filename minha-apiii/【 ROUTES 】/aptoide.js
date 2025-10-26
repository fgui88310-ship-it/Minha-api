import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * Endpoint: /api/aptoide?query=WhatsApp
 * Retorna: nome, versão, tamanho e link de download do app
 */
router.get('/', async (req, res, next) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Passe ?query= para buscar o app.' });
  }

  try {
    const url = `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(query)}&trusted=true`;
    const { data } = await axios.get(url, { timeout: 5000 });

    if (!data?.datalist?.list?.length) {
      return res.status(404).json({ error: 'Nenhum app encontrado.' });
    }

    const app = data.datalist.list[0]; // Pega o primeiro resultado
    const shortLink = await axios.get(
      `https://tinyurl.com/api-create.php?url=${app.file.path_alt}`
    );

    res.json({
      nome: app.name,
      pacote: app.package,
      versão: app.file.vername,
      tamanhoMB: (app.file.size / 1048576).toFixed(1) + ' MB',
      imagem: app.graphic || app.icon,
      download: shortLink.data, // 🔗 apenas o link curto
    });
  } catch (err) {
    next(err);
  }
});

export default router;
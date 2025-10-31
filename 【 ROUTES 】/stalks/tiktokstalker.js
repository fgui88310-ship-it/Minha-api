// api/endpoints/tiktok.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * GET /api/tiktok?username=paulinholokooficial
 * Retorna dados públicos do perfil do TikTok
 */
router.get('/', async (req, res, next) => {
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Passe ?username= para buscar o perfil' });
  }

  try {
    // URL da API interna do TikTok (não oficial, mas funciona em 2025)
    const apiUrl = `https://www.tiktok.com/api/user/detail/?uniqueId=${encodeURIComponent(username)}&device_id=1234567890`;

    const { data } = await axios.get(apiUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://www.tiktok.com/',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      timeout: 8000,
    });

    // Verifica se o usuário existe
    if (data.statusCode !== 0 || !data.userInfo?.user) {
      return res.status(404).json({ error: 'Usuário não encontrado ou perfil privado' });
    }

    const u = data.userInfo.user;
    const s = data.userInfo.stats;

    // === Extração avançada ===
    const emailMatch = u.signature?.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
    const email = emailMatch.length > 0 ? emailMatch.join(', ') : null;

    const linkMatch = u.signature?.match(/https?:\/\/[^\s\)]+/g) || [];
    const bioLinks = linkMatch.length > 0 ? linkMatch : null;

    const createDate = u.createTime
      ? new Date(u.createTime * 1000).toLocaleDateString('pt-BR')
      : null;

    const profileUrl = `https://www.tiktok.com/@${u.uniqueId}`;
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`;

    // === Montagem do objeto de resposta ===
    const profile = {
      nome: u.nickname,
      username: u.uniqueId,
      id: u.id,
      secUid: u.secUid,
      url: profileUrl,
      qrCode,
      avatar: u.avatarLarger || u.avatarThumb,
      bio: u.signature?.trim() || null,
      email: email,
      linksNaBio: bioLinks,
      seguidores: s.followerCount,
      seguindo: s.followingCount,
      likes: s.heartCount,
      videos: s.videoCount,
      verificado: u.verified,
      criadoEm: createDate,
      regiao: u.region || null,
      temLoja: u.commerceUserInfo?.isCommerce || false,
      tipoConta: u.isADVirtual ? 'Anúncio Virtual' : u.ttSeller ? 'Vendedor' : 'Pessoal',
      privado: u.privateAccount,
    };

    res.json(profile);
  } catch (err) {
    // Rate limit, bloqueio ou erro de rede
    if (err.response?.status === 429) {
      return res.status(429).json({ error: 'Muitas requisições. Tente novamente mais tarde.' });
    }
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNABORTED') {
      return res.status(503).json({ error: 'Erro de conexão com o TikTok' });
    }
    next(err);
  }
});

export default router;
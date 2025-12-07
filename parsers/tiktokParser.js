export function parseTikTokUser(data) {
  const u = data.userInfo.user;
  const s = data.userInfo.stats;

  const emailMatch = u.signature?.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
  const linkMatch = u.signature?.match(/https?:\/\/[^\s\)]+/g) || [];

  return {
    nome: u.nickname,
    username: u.uniqueId,
    id: u.id,
    secUid: u.secUid,
    url: `https://www.tiktok.com/@${u.uniqueId}`,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://www.tiktok.com/@${u.uniqueId}`)}`,
    avatar: u.avatarLarger || u.avatarThumb,
    bio: u.signature?.trim() || null,
    email: emailMatch.length > 0 ? emailMatch.join(', ') : null,
    linksNaBio: linkMatch.length > 0 ? linkMatch : null,
    seguidores: s.followerCount,
    seguindo: s.followingCount,
    likes: s.heartCount,
    videos: s.videoCount,
    verificado: u.verified,
    criadoEm: u.createTime ? new Date(u.createTime * 1000).toLocaleDateString('pt-BR') : null,
    regiao: u.region || null,
    temLoja: u.commerceUserInfo?.isCommerce || false,
    tipoConta: u.isADVirtual ? 'Anúncio Virtual' : u.ttSeller ? 'Vendedor' : 'Pessoal',
    privado: u.privateAccount
  };
}
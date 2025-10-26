export function parseVideoData(media) {
  return {
    creator: 'Guilherme',
    type: media.images ? 'image' : 'video',
    mime: media.images ? '' : 'video/mp4',
    urls: media.images ? media.images : [media.play].filter(Boolean),
    audio: media.music_info?.play || media.music || '',
    title: media.title || 'Sem título',
    is_private: !!media.is_private,
    views: media.play_count || 0,
    likes: media.digg_count || 0,
    taken_at_timestamp: media.create_time || 0
  };
}

export function getTikTokId(url) {
  const match = url.match(/(?:vm\.tiktok\.com\/[a-zA-Z0-9]+|tiktok\.com\/@[\w.-]+\/video\/(\d+))/);
  return match ? match[1] : null;
}
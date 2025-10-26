// api/utils/htmlParser.js
import { cheerio } from '../【 MODULES 】/libs.js';
export function decodeHtmlEntities(str) {
  const entities = {
    '&#064;': '@',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'"
  };
  return str.replace(/&#?\w+;/g, match => entities[match] || match);
}

export function parseRelativeTimestamp(relativeTime) {
  const now = new Date();
  const match = relativeTime.match(/(\d+)([smhdw])/i);
  if (!match) return now.toISOString();
  const [_, value, unit] = match;
  const num = parseInt(value);
  if (unit.toLowerCase() === 's') now.setSeconds(now.getSeconds() - num);
  if (unit.toLowerCase() === 'm') now.setMinutes(now.getMinutes() - num);
  if (unit.toLowerCase() === 'h') now.setHours(now.getHours() - num);
  if (unit.toLowerCase() === 'd') now.setDate(now.getDate() - num);
  if (unit.toLowerCase() === 'w') now.setDate(now.getDate() - num * 7);
  return now.toISOString();
}

export function extractMediaItems($, url) {
  const mediaItems = [];
  let mediaType = 'Sem mídia';
  let carouselFound = false;

  const carouselSelectors = [
    '.MediaScrollContainer',
    '[role="tabpanel"]',
    '.MediaCarousel',
    'div.MediaContainer',
    '#u_0_1_dL',
    '.x1iyjqo2',
    '[data-testid="carousel-container"]',
    '.x1n2onr6'
  ];

  const singleMediaSelectors = [
    '.SingleInnerMediaContainer > img',
    '.SoloMediaContainer > img',
    '.SingleInnerMediaContainerVideo video',
    '.SingleInnerMediaContainer audio source',
    '.SoloMediaContainer audio source',
    'img[src*="scontent"], img[src*="fbcdn"], img[src*="instagram.fna.fbcdn"]',
    'video[src*="scontent"], video[src*="fbcdn"], video[src*="instagram.fna.fbcdn"]',
    'audio[src*="scontent"], audio[src*="fbcdn"], audio[src*="instagram.fna.fbcdn"] source',
    '[data-testid="post-media"] img, [data-testid="post-media"] video, [data-testid="post-media"] audio source',
    '[data-testid="voice-clip"] audio source'
  ];

  for (const selector of carouselSelectors) {
    const container = $(selector);
    if (container.length > 0) {
      console.log(`[DEBUG] Carrossel encontrado com seletor: ${selector}`);
      carouselFound = true;

      container.find('.MediaScrollImageContainer, [data-testid="carousel-item"], .x78zum5').each((i, mediaContainer) => {
        const img = $(mediaContainer).find('img').first();
        if (img.length) {
          const src = img.attr('src') || img.attr('data-src');
          if (src && (src.includes('scontent') || src.includes('fbcdn') || src.includes('instagram.fna.fbcdn')) &&
              !src.includes('profile') && !src.includes('stp=dst-jpg_s100x100') &&
              (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png') || src.includes('.webp'))) {
            const formatMatch = src.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
            const format = formatMatch ? formatMatch[1].toLowerCase() : 'jpg';
            const width = parseInt(img.attr('width') || img.attr('data-width') || '1080');
            const height = parseInt(img.attr('height') || img.attr('data-height') || '1350');
            mediaItems.push({
              type: 'image',
              url: src,
              format: format,
              width: width,
              height: height,
              alt: img.attr('alt') || '',
              index: i + 1,
              container: selector
            });
            console.log(`[DEBUG] Imagem carrossel ${i + 1}: ${src.substring(0, 60)}... (formato: ${format})`);
          }
        }

        const video = $(mediaContainer).find('video').first();
        if (video.length) {
          let src = video.attr('src') || video.find('source').first().attr('src');
          if (src && (src.includes('.mp4') || src.includes('.mov') || src.includes('video')) &&
              (src.includes('scontent') || src.includes('fbcdn') || src.includes('instagram.fna.fbcdn'))) {
            const formatMatch = src.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
            const format = formatMatch ? formatMatch[1].toLowerCase() : 'mp4';
            const width = parseInt(video.attr('width') || '640');
            const height = parseInt(video.attr('height') || '1136');
            mediaItems.push({
              type: 'video',
              url: src,
              format: format,
              width: width,
              height: height,
              index: i + 1,
              container: selector
            });
            console.log(`[DEBUG] Vídeo carrossel ${i + 1}: ${src.substring(0, 60)}... (formato: ${format})`);
          }
        }

        const audio = $(mediaContainer).find('audio source, [data-testid="voice-clip"] source').first();
        if (audio.length) {
          const src = audio.attr('src');
          if (src && src.includes('.m4a') && (src.includes('scontent') || src.includes('fbcdn') || src.includes('instagram.fna.fbcdn'))) {
            const format = 'm4a';
            mediaItems.push({
              type: 'audio',
              url: src,
              format: format,
              duration: parseInt(audio.attr('duration') || 0),
              index: i + 1,
              container: selector,
              isVoice: audio.closest('[data-testid="voice-clip"]').length > 0
            });
            console.log(`[DEBUG] Áudio carrossel ${i + 1} (voz: ${audio.closest('[data-testid="voice-clip"]').length > 0}): ${src.substring(0, 60)}... (formato: ${format})`);
          }
        }
      });
      break;
    }
  }

  if (!carouselFound && mediaItems.length === 0) {
    console.log('[DEBUG] Nenhum carrossel, tentando mídia única...');
    for (const selector of singleMediaSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        elements.each((i, el) => {
          let src = $(el).attr('src') || $(el).attr('data-src') || $(el).find('source').attr('src');
          const tagName = $(el).prop('tagName').toLowerCase();
          let type = 'image';
          if (tagName === 'video' || $(el).parent().is('video')) type = 'video';
          if (tagName === 'audio' || $(el).parent().is('audio') || $(el).closest('[data-testid="voice-clip"]').length) type = 'audio';

          if (src && (src.includes('scontent') || src.includes('fbcdn') || src.includes('instagram.fna.fbcdn')) &&
              !src.includes('profile') && !src.includes('stp=dst-jpg_s100x100')) {
            const formatMatch = src.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
            const format = formatMatch ? formatMatch[1].toLowerCase() : (type === 'video' ? 'mp4' : type === 'audio' ? 'm4a' : 'jpg');
            if (type === 'image' && !(format === 'jpg' || format === 'jpeg' || format === 'png' || format === 'webp')) return;
            if (type === 'video' && !(format === 'mp4' || format === 'mov')) return;
            if (type === 'audio' && format !== 'm4a') return;

            mediaItems.push({
              type: type,
              url: src,
              format: format,
              width: type === 'image' ? parseInt($(el).attr('width') || '1080') : type === 'video' ? parseInt($(el).attr('width') || '640') : undefined,
              height: type === 'image' ? parseInt($(el).attr('height') || '1350') : type === 'video' ? parseInt($(el).attr('height') || '1136') : undefined,
              alt: type === 'image' ? $(el).attr('alt') || '' : '',
              index: 1,
              container: selector,
              isVoice: type === 'audio' && $(el).closest('[data-testid="voice-clip"]').length > 0
            });
            console.log(`[DEBUG] Mídia única (${type}): ${src.substring(0, 60)}... (formato: ${format})`);
          }
        });
        if (mediaItems.length > 0) break;
      }
    }
  }

  if (mediaItems.length === 0) {
    const ogImage = $('meta[property="og:image"]').attr('content');
    const ogVideo = $('meta[property="og:video"]').attr('content');
    const ogAudio = $('meta[property="og:audio"]').attr('content');

    if (ogImage && (ogImage.includes('scontent') || ogImage.includes('fbcdn') || ogImage.includes('instagram.fna.fbcdn'))) {
      const formatMatch = ogImage.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
      const format = formatMatch ? formatMatch[1].toLowerCase() : 'jpg';
      mediaItems.push({
        type: 'image',
        url: ogImage,
        format: format,
        index: 1,
        container: 'og:image'
      });
    }
    if (ogVideo && (ogVideo.includes('scontent') || ogVideo.includes('fbcdn') || ogVideo.includes('instagram.fna.fbcdn'))) {
      const formatMatch = ogVideo.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
      const format = formatMatch ? formatMatch[1].toLowerCase() : 'mp4';
      mediaItems.push({
        type: 'video',
        url: ogVideo,
        format: format,
        index: 1,
        container: 'og:video'
      });
    }
    if (ogAudio && ogAudio.includes('.m4a')) {
      mediaItems.push({
        type: 'audio',
        url: ogAudio,
        format: 'm4a',
        index: 1,
        container: 'og:audio',
        isVoice: true
      });
    }
  }

  if (mediaItems.length > 0) {
    if (mediaItems.length > 1) {
      const imageCount = mediaItems.filter(item => item.type === 'image').length;
      const videoCount = mediaItems.filter(item => item.type === 'video').length;
      const audioCount = mediaItems.filter(item => item.type === 'audio').length;
      const voiceCount = mediaItems.filter(item => item.isVoice).length;

      let desc = `Carrossel de ${mediaItems.length} itens`;
      if (imageCount > 0 || videoCount > 0 || audioCount > 0) {
        desc += ` (`;
        if (imageCount > 0) desc += `${imageCount} img${imageCount > 1 ? 's' : ''}`;
        if (videoCount > 0) desc += `${imageCount > 0 ? ' + ' : ''}${videoCount} vídeo${videoCount > 1 ? 's' : ''}`;
        if (audioCount > 0) desc += `${(imageCount > 0 || videoCount > 0) ? ' + ' : ''}${audioCount} áudio${audioCount > 1 ? 's' : ''}${voiceCount > 0 ? ' (voz)' : ''}`;
        desc += ')';
      }
      mediaType = desc;
    } else {
      const singleItem = mediaItems[0];
      mediaType = singleItem.type === 'video' ? 'Vídeo' :
                  singleItem.type === 'audio' ? `Áudio${singleItem.isVoice ? ' (voz)' : ''}` :
                  'Imagem';
    }
  }

  console.log(`[DEBUG] Extração de mídia concluída: ${mediaItems.length} itens, tipo: ${mediaType}`);
  return { mediaItems, mediaType };
}

export function parseHtml(html, url) {
  try {
    if (html.length < 500) {
      return getBasicInfo(url);
    }

    const $ = cheerio.load(html, { decodeEntities: true, xmlMode: false });
    const result = getBasicInfo(url);
    result.debug = {
      htmlLength: html.length,
      hasBarcelona: html.includes('BarcelonaEmbedHelper'),
      hasThreads: html.includes('THXBarcelonaTextPostEmbedPostController'),
      blockedContent: false,
      parsedAt: new Date().toISOString()
    };

    if (html.includes('BarcelonaEmbedHelper') || html.includes('THXBarcelonaTextPostEmbedPostController')) {
      const nameSelectors = [
        'div.NameContainer span',
        'span:contains("@")',
        'a[href*="/@"] span',
        '.username',
        '[data-testid="user-name"]'
      ];

      let foundUser = false;
      for (const selector of nameSelectors) {
        const elements = $(selector);
        elements.each((i, el) => {
          const text = $(el).text().trim();
          if (text && text.length > 0) {
            if (text.includes('@')) {
              const parts = text.split('(');
              if (parts.length > 1) {
                result.fullName = parts[0].trim();
                result.username = parts[1].replace('@', '').replace(')', '').trim();
              } else {
                result.username = text.replace('@', '');
                result.fullName = result.username;
              }
            } else {
              result.fullName = text;
            }
            foundUser = true;
            return false;
          }
        });
        if (foundUser) break;
      }

      const textSelectors = [
        'span.BodyTextContainer span',
        'div[dir="auto"] span',
        'div.TextContentContainer span span',
        '.post-text',
        '[data-testid="post-text"]'
      ];

      let foundText = false;
      for (const selector of textSelectors) {
        const elements = $(selector);
        elements.each((i, el) => {
          const text = $(el).text().trim();
          if (text && text.length > 1 && text.length < 500 &&
              !text.includes('View on Threads') &&
              !text.match(/^\d+\s*(replies?|likes?)/i)) {
            result.title = decodeHtmlEntities(text).substring(0, 200) +
                           (text.length > 200 ? '...' : '');
            foundText = true;
            result.debug.textFound = true;
            result.debug.textLength = text.length;
            return false;
          }
        });
        if (foundText) break;
      }

      const timeSelectors = ['span.Timestamp', '.timestamp', '[data-testid="timestamp"]'];
      for (const selector of timeSelectors) {
        const elements = $(selector);
        elements.each((i, el) => {
          const text = $(el).text().trim();
          if (text && text.match(/^\d+[smhdw]/)) {
            result.date = parseRelativeTimestamp(text);
            result.debug.timestampFound = text;
            return false;
          }
        });
      }

      const { mediaItems, mediaType } = extractMediaItems($, url);
      result.mediaItems = mediaItems;
      result.mediaType = mediaType;
      result.debug.mediaType = mediaType;
      result.debug.mediaCount = mediaItems.length;
      result.debug.carouselFound = mediaItems.some(item => item.container);

      const actionBar = $('div.ActionBarContainer');
      if (actionBar.length > 0) {
        const icons = actionBar.find('span.ActionBarIcon');
        if (icons.length >= 2) {
          const likesSpan = $(icons[0]).find('span.ActionBarCount');
          result.engagement.likes = likesSpan.length ? parseInt(likesSpan.text().trim()) || 0 : 0;
          const repliesSpan = $(icons[1]).find('span.ActionBarCount');
          result.engagement.replies = repliesSpan.length ? parseInt(repliesSpan.text().trim()) || 0 : 0;
          console.log('[DEBUG] Engajamento via ActionBar:', result.engagement);
          result.debug.engagementMethod = 'action_bar_selectors';
        } else {
          console.log('[DEBUG] Não encontrou ActionBarIcons suficientes');
        }
      } else {
        console.log('[DEBUG] Não encontrou ActionBarContainer, usando seletores antigos');
      }

      const engagementSelectors = [
        'div.MetadataContainer',
        'span.x1lliihq.x1plvlek',
        '.engagement',
        '[data-testid="engagement"]'
      ];

      for (const selector of engagementSelectors) {
        const elements = $(selector);
        elements.each((i, el) => {
          const text = $(el).text().trim();
          console.log('[DEBUG] Candidato a engajamento:', text);
          
          let match = text.match(/(\d+(?:,\d+)?)\s*(replies?|respostas?)\s*[·•]\s*(\d+(?:,\d+)?)\s*(likes?|curtidas?)/i);
          if (match) {
            result.engagement.replies = parseInt(match[1].replace(/,/g, '')) || 0;
            result.engagement.likes = parseInt(match[3].replace(/,/g, '')) || 0;
            console.log('[DEBUG] Engajamento COMPLETO:', result.engagement);
            result.debug.engagementMethod = 'selector_complete';
            return false;
          }
          
          match = text.match(/(\d+(?:,\d+)?)\s*(likes?|curtidas?)/i);
          if (match) {
            result.engagement.replies = 0;
            result.engagement.likes = parseInt(match[1].replace(/,/g, '')) || 0;
            console.log('[DEBUG] Engajamento SÓ LIKES:', result.engagement);
            result.debug.engagementMethod = 'selector_likes_only';
            return false;
          }
        });
        if (result.engagement.likes > 0) break;
      }

      if (result.engagement.likes === 0) {
        const fullMatch = html.match(/(\d+(?:,\d+)?)\s*(replies?|respostas?)\s*[·•]\s*(\d+(?:,\d+)?)\s*(likes?|curtidas?)/i);
        if (fullMatch) {
          result.engagement.replies = parseInt(fullMatch[1].replace(/,/g, '')) || 0;
          result.engagement.likes = parseInt(fullMatch[3].replace(/,/g, '')) || 0;
          result.debug.engagementMethod = 'regex_complete';
        } else {
          const likesMatch = html.match(/(\d+(?:,\d+)?)\s*(likes?|curtidas?)/i);
          if (likesMatch) {
            result.engagement.replies = 0;
            result.engagement.likes = parseInt(likesMatch[1].replace(/,/g, '')) || 0;
            result.debug.engagementMethod = 'regex_likes_only';
          }
        }
      }
    } else {
      const ogImage = $('meta[property="og:image"]').attr('content');
      const ogVideo = $('meta[property="og:video"]').attr('content');
      const description = $('meta[property="og:description"]').attr('content') ||
                         $('meta[name="description"]').attr('content');

      if (ogVideo) {
        result.mediaItems.push({ type: 'video', url: ogVideo, index: 1 });
        result.mediaType = 'Vídeo';
        result.debug.ogVideoFound = true;
      } else if (ogImage) {
        result.mediaItems.push({ type: 'image', url: ogImage, index: 1 });
        result.mediaType = 'Imagem';
        result.debug.ogImageFound = true;
      }

      if (description && description.length > 10) {
        result.title = decodeHtmlEntities(description).substring(0, 200);
        result.debug.metaDescriptionFound = true;
      }
    }

    return result;
  } catch (error) {
    console.log('[ERROR] Erro no parseHtml:', error.message);
    return getBasicInfo(url);
  }
}

export function getBasicInfo(url) {
  const cleanUrl = url.split('?')[0];
  return {
    title: 'Conteúdo não disponível',
    mediaType: 'Sem mídia',
    mediaItems: [],
    postID: cleanUrl.split('/post/')[1]?.split('/')[0] || 'Código não encontrado',
    username: cleanUrl.split('/@')[1]?.split('/post/')[0] || 'unknown',
    fullName: 'Não encontrado',
    date: new Date().toISOString(),
    engagement: { replies: 0, likes: 0 }
  };
}
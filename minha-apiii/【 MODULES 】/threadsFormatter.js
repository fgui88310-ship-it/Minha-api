// api/modules/threadsFormatter.js
export const formatMediaItems = (result) => {
  const isCarousel = result.mediaItems?.length > 1;
  const isSingleMedia = result.mediaItems?.length === 1 && result.mediaItems[0]?.url?.startsWith('http');

  return result.mediaItems.map((item, index) => ({
    type: item.type,
    url: item.url,
    format: item.format || item.url.split('.').pop().split('?')[0],
    width: item.width || null,
    height: item.height || null,
    alt: item.alt || '',
    index: item.index || index + 1,
    isCarousel,
    isSingle: isSingleMedia,
    isVoice: item.isVoice || false
  }));
};
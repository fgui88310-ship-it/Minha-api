export function getShortcode(url) {
  const match = url.match(/\/(?:p|reel|tv)\/([^/?#&]+)/);
  return match ? match[1] : null;
}

export function isEmpty(value) {
  return value === undefined || value === null || value === '';
}
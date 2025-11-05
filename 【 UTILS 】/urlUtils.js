export function isValidUrl(url) {
  try {
    new URL(url);
    return url.includes('estadao.com.br') || url.includes('estadao.com');
  } catch {
    return false;
  }
}
export function isValidUrl(url) {
  const pattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
  return pattern.test(url);
}
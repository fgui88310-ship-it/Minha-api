export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "Indisponível";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function parseISO8601Duration(durationStr) {
  if (!durationStr) return 0;
  const match = durationStr.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  return (hours * 3600) + (minutes * 60) + seconds;
}
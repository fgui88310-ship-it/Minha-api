export function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines, maxHeight) {
  const words = text.split(' ');
  let line = '';
  const lines = [];
  let currentY = y;
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && lineCount < maxLines) {
      lines.push(line.trim());
      line = words[n] + ' ';
      lineCount++;
      currentY += lineHeight;
    } else {
      line = testLine;
    }

    if (lineCount >= maxLines || currentY + lineHeight > maxHeight) {
      lines.push(line.trim() + '...');
      break;
    }
  }

  if (line && lineCount < maxLines) {
    lines.push(line.trim());
  }

  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });

  return currentY + (lines.length * lineHeight);
}
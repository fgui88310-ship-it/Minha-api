import translate from 'translate-google';

export async function translateText(text, to = 'pt') {
  return await translate(text, { to });
}
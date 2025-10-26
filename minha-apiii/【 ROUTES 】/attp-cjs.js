// endpoints/attp-cjs.js
const Jimp = require('jimp');
console.log(Jimp) 
module.exports = async function generateATTp(text = 'ATTp') {
  try {
    // Cria buffer vazio para imagem transparente 512x512
    const emptyBuffer = Buffer.alloc(512 * 512 * 4); // RGBA 0
    const image = await Jimp.read(emptyBuffer);
    const textImage = await Jimp.read(emptyBuffer);

    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);

    const colors = [0xFF0044FF, 0x00FFEEFF, 0xFFEA00FF, 0x8A2BE2FF, 0x00FF6AFF];
    const color = colors[Math.floor(Math.random() * colors.length)];

    await textImage.print(
      font,
      0,
      0,
      {
        text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      512,
      512
    );

    textImage.color([{ apply: 'mix', params: [color, 100] }]);
    image.composite(textImage, 0, 0);

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    return buffer; // retorna o PNG transparente
  } catch (err) {
    console.error(err);
    throw err;
  }
};

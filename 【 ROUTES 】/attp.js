/*import { Router } from 'express';
import * as Jimp from 'jimp';
import { FONT_SANS_64_WHITE } from '@jimp/plugin-print';

const router = Router();

router.get('/', async (req, res, next) => {
  const { text = 'ATTp' } = req.query;

  try {
    const image = await new Jimp.Jimp({ width: 512, height: 512, background: 0x00000000 });
    const textImage = await new Jimp.Jimp({ width: 512, height: 512, background: 0x00000000 });

    // Carrega a fonte diretamente do plugin
    const font = await Jimp.loadFont(FONT_SANS_64_WHITE);

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
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

export default router;
*/
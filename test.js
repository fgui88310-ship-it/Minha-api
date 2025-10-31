// test.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname no ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://meme-api.com/gimme/MemesBrasil/20';

async function scrapeMemes() {
  try {
    console.log('Puxando memes do r/MemesBrasil...');

    const { data } = await axios.get(API_URL);
    const memes = data.memes.filter(m => m.url.match(/\.(jpg|png|gif|webp)$/i));

    console.log(`Encontrados ${memes.length} memes!`);
    fs.writeFileSync('memes_br.json', JSON.stringify(memes, null, 2));

    await downloadMemes(memes.slice(0, 10));
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

async function downloadMemes(memes) {
  const dir = path.join(__dirname, 'memes_br');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  for (let i = 0; i < memes.length; i++) {
    const m = memes[i];
    const ext = path.extname(m.url.split('?')[0]) || '.jpg';
    const safeTitle = m.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    const filename = path.join(dir, `${String(i+1).padStart(2, '0')}_${safeTitle}${ext}`);

    try {
      const res = await axios({
        url: m.url,
        method: 'GET',
        responseType: 'stream'
      });
      fs.writeFile('html', res, 'utf8', (err) => {
  if (err) {
    console.error("Erro ao criar o arquivo:", err);
    return;
  }
  console.log(`Arquivo "html" criado com sucesso!`);
});
      const writer = fs.createWriteStream(filename);
      res.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log(`Baixado: ${path.basename(filename)}`);
      await new Promise(r => setTimeout(r, 700));
    } catch (err) {
      console.log(`Falha: ${m.url}`);
    }
  }
  console.log('Download concluído! Veja a pasta memes_br/');
}

scrapeMemes();

console.log("fui") 
import express from 'express';
import { downloadInstagramMedia } from '../【 DOWNLOADERS 】/instagramDownloader.js';
import fs from 'fs';
import path from 'path';
const router = express.Router();

router.get('/download', async (req, res, next) => {
  try {
    console.log('🚀 [API] Iniciando download...');
    
    const { url, type = 'video', apikey } = req.query;
    
    // ✅ VALIDA URL
    if (!url) {
      console.log('❌ [API] URL não fornecida');
      return res.status(400).json({ error: 'Passe ?url=' });
    }

    // ✅ VALIDA APIKEY (OPCIONAL)
    if (apikey !== 'SuaKey') {
      console.log('❌ [API] API Key inválida');
      return res.status(401).json({ error: 'API Key inválida' });
    }

    console.log('🎵 [API] Download:', { url: url.substring(0, 50) + '...', type });

    // ✅ DOWNLOAD
    const result = await downloadInstagramMedia(url, type);
    
    if (result.error) {
      console.log('❌ [API] Erro no download:', result.error);
      return res.status(404).json({ error: result.error });
    }

    // ✅ DETERMINA ARQUIVO
    const filePath = result.video || result.audio;
    
    if (!filePath) {
      console.log('❌ [API] Nenhum arquivo encontrado');
      return res.status(400).json({ error: 'Arquivo não encontrado' });
    }

    // ✅ VERIFICA SE ARQUIVO EXISTE
    if (!fs.existsSync(filePath)) {
      console.log('❌ [API] Arquivo não existe:', filePath);
      return res.status(404).json({ error: 'Arquivo não foi criado' });
    }

    console.log('📤 [ENVIANDO] Tentando:', filePath);

    // ✅ ENVIA ARQUIVO COM CALLBACK
    const fileName = path.basename(filePath);
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('💥 [ERRO SEND] Falha ao enviar:', err.message);
        res.status(500).json({ error: 'Falha ao enviar arquivo' });
      } else {
        console.log('✅ [BAIXADO!] MP3/MP4 enviado com sucesso!');
      }
    });

  } catch (err) {
    next(err);
  }
});

// Adicione este novo endpoint no seu router

router.get('/', async (req, res, next) => {
  try {
    console.log('🔍 [API] Buscando metadados do story...');

    const { url, apikey } = req.query;

    // Validações
    if (!url) {
      return res.status(400).json({ error: 'Parâmetro ?url= é obrigatório' });
    }

    if (apikey !== 'SuaKey') {
      return res.status(401).json({ error: 'API Key inválida' });
    }

    // Chama a função que busca os metadados
    const result = await getInstagramStoryMetadata(url);

    if (result.error) {
      console.log('❌ [API] Erro ao buscar metadados:', result.error);
      return res.status(404).json({ error: result.error });
    }

    // Retorna os dados com estrutura limpa
    res.json({
      developer: "SeuNomeOuBot",
      status: true,
      data: result.data.map(item => ({
        thumbnail: item.thumbnail,
        url: item.url,
        filename: item.filename || null
      }))
    });

  } catch (err) {
    next(err);
  }
});

export default router;

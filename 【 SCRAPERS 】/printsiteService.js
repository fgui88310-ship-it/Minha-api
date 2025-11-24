import { axiosInstance } from '../【 UTILS 】/axiosClient.js';
import PrintsiteModule from '../【 MODULES 】/printsiteModule.js';

async function captureScreenshot(url) {
  try {
    const apiUrl = PrintsiteModule.screenshotUrl(url);

    const response = await axiosInstance.get(apiUrl, {
      responseType: 'arraybuffer', // importante para imagens binárias
      timeout: 30000, // opcional: aumentar timeout para screenshots
    });

    const contentType = response.headers['content-type'];

    if (!contentType || !contentType.startsWith('image/')) {
      console.warn('[PrintsiteService] Resposta não é uma imagem:', contentType);
      return { error: 'Nenhum screenshot válido retornado pelo serviço' };
    }

    return {
      contentType,
      data: response.data, // ArrayBuffer com os bytes da imagem
    };
  } catch (err) {
    const message = err.response 
      ? `Status \( {err.response.status}: \){err.message}`
      : err.message;

    console.error('[PrintsiteService] Erro ao capturar screenshot:', message);

    return { 
      error: 'Erro ao capturar screenshot',
      details: process.env.NODE_ENV === 'development' ? message : undefined
    };
  }
}

export default { captureScreenshot };
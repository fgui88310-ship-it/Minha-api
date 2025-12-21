import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Rota para gerar nomes
router.get('/', async (req, res) => {
  try {
    const { quantidade = 1, temperature = 1.0 } = req.query;
    
    const params = JSON.stringify({
      quantidade: parseInt(quantidade),
      temperature: parseFloat(temperature)
    });
    
    // Executar script Python
    const pythonProcess = spawn('python3', [
      path.join(__dirname,'gerador_nomes.py'),
      params
    ]);
    
    let result = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.error('[GERADOR] Erro Python:', data.toString());
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ 
          error: 'Erro ao gerar nomes',
          detalhes: error 
        });
      }
      
      try {
        const parsedResult = JSON.parse(result);
        res.json(parsedResult);
      } catch (parseError) {
        console.error('[GERADOR] Erro ao parsear JSON:', parseError);
        res.status(500).json({ 
          error: 'Erro no formato da resposta',
          raw: result 
        });
      }
    });
    
  } catch (error) {
    console.error('[GERADOR] Erro na rota:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota com parâmetros na URL (similar às stickers)
// Rota com parâmetros na URL (similar às stickers) - VERSÃO CORRIGIDA
router.get('/:quantidade', async (req, res) => {
  const quantidade = req.params.quantidade;
  const { temperature = 1.0 } = req.query;
  
  // Redireciona para a lógica da rota principal '/'
  // Passa os parâmetros via query string
  const queryParams = new URLSearchParams({
    quantidade: quantidade,
    temperature: temperature
  }).toString();
  
  // Simula um novo request para a rota '/'
  req.url = `/?${queryParams}`;
  req.query.quantidade = quantidade;
  req.query.temperature = temperature;
  
  // Usa o mesmo handler da rota '/'
  router.handle(req, res);
});

export default router;

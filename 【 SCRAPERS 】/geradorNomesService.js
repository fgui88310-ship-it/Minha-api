// src/services/geradorNomesService.js
import { PythonShell } from 'python-shell';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Para obter o diretório atual em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Caminho correto para o script Python
const PYTHON_SCRIPT = join(__dirname, '../python/gerador_nomes.py');

export const gerarNomes = (quantidade = 1, temperature = 1.0) => {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'text',
      pythonOptions: ['-u'],
      args: [JSON.stringify({ quantidade, temperature })]
    };

    PythonShell.run(PYTHON_SCRIPT, options, (err, results) => {
      if (err) return reject(err);
      try {
        const output = JSON.parse(results[results.length - 1]);
        resolve(output.nomes);
      } catch (e) {
        reject(e);
      }
    });
  });
};

// Exportação padrão se preferir
// export default { gerarNomes };
// server.js
import app from './app.js';
import { cleanupOldFiles } from './【 UTILS 】/fileUtils.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Rodando em http://localhost:${PORT}`);
});

// Limpeza periódica
setInterval(cleanupOldFiles, 60 * 60 * 1000);

// Shutdown gracioso
process.on('SIGTERM', () => {
  console.log('Encerrando servidor...');
  server.close(() => {
    console.log('Servidor fechado.');
    process.exit(0);
  });
});
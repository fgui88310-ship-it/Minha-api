import fs from 'fs';
import { execSync } from 'child_process';
import os from 'os';

export async function checkDiskSpace(dir = '/storage/emulated/0') {
  try {
    // ✅ MÉTODO 1: Comando 'df' (FUNCIONA NO ANDROID)
    const dfOutput = execSync(`df "${dir}"`, { encoding: 'utf8' });
    const lines = dfOutput.split('\n');
    const line = lines[1]?.trim().split(/\s+/);
    
    if (line && line.length >= 4) {
      const totalBytes = parseInt(line[1]) * 1024; // KB -> Bytes
      const usedBytes = parseInt(line[2]) * 1024;
      const freeBytes = parseInt(line[3]) * 1024;
      
      const freeSpaceMB = freeBytes / (1024 * 1024);
      const freeSpaceGB = freeSpaceMB / 1024;
      
      console.log(`[DISK] Espaço livre em ${dir}: ${freeSpaceMB.toFixed(2)} MB (${freeSpaceGB.toFixed(2)} GB)`);
      return freeSpaceMB > 50;
    }
    
    // ✅ MÉTODO 2: Fallback para diretório raiz
    return checkRootSpace();
    
  } catch (err) {
    console.error('[ERROR] Falha ao verificar espaço (usando fallback):', err.message);
    return checkRootSpace();
  }
}

// ✅ FALLBACK: Verifica espaço na raiz
function checkRootSpace() {
  try {
    // Comando para raiz do Android
    const output = execSync('df /storage/emulated/0', { encoding: 'utf8' });
    const lines = output.split('\n');
    const line = lines[1]?.trim().split(/\s+/);
    
    if (line && line.length >= 4) {
      const freeBytes = parseInt(line[3]) * 1024;
      const freeSpaceMB = freeBytes / (1024 * 1024);
      console.log(`[DISK] Fallback - Espaço livre: ${freeSpaceMB.toFixed(2)} MB`);
      return freeSpaceMB > 50;
    }
  } catch (e) {
    console.log('[DISK] Usando fallback simples: assumindo espaço suficiente');
  }
  
  // ✅ SEMPRE RETORNA TRUE se não conseguir verificar
  return true;
}

// ✅ VERSÃO SYNC (caso precise)
export function checkDiskSpaceSync(dir = '/storage/emulated/0') {
  try {
    const dfOutput = execSync(`df "${dir}"`, { encoding: 'utf8' });
    const lines = dfOutput.split('\n');
    const line = lines[1]?.trim().split(/\s+/);
    
    if (line && line.length >= 4) {
      const freeBytes = parseInt(line[3]) * 1024;
      const freeSpaceMB = freeBytes / (1024 * 1024);
      console.log(`[DISK] Espaço livre SYNC: ${freeSpaceMB.toFixed(2)} MB`);
      return freeSpaceMB > 50;
    }
  } catch (err) {
    console.log('[DISK] Erro SYNC, assumindo OK');
  }
  
  return true;
}

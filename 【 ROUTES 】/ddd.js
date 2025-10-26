// api/endpoints/ddd.js
import fs from 'fs';
import path from 'path';
import express from 'express';
const router = express.Router();
import { CACHE, CACHE_DDD } from '../config.js';
// ========== CONFIG CACHE ==========
// ✅ DEPOIS (CORRETO)

// ========== NORMALIZAR NOMES ==========
function normalizarNome(nome) {
    return nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

// ========== EXTRAIR SIGLA DO ESTADO ==========
function extractAcronymFromCity(state) {
    // Mapeia nome completo → sigla
    const mapaEstado = {
        'São Paulo': 'SP', 'Rio de Janeiro': 'RJ', 'Minas Gerais': 'MG', 'Bahia': 'BA',
        'Paraná': 'PR', 'Rio Grande do Sul': 'RS', 'Pernambuco': 'PE', 'Ceará': 'CE',
        'Pará': 'PA', 'Santa Catarina': 'SC', 'Goiás': 'GO', 'Maranhão': 'MA',
        'Espírito Santo': 'ES', 'Paraíba': 'PB', 'Amazonas': 'AM', 'Mato Grosso': 'MT',
        'Rio Grande do Norte': 'RN', 'Piauí': 'PI', 'Alagoas': 'AL', 'Distrito Federal': 'DF',
        'Mato Grosso do Sul': 'MS', 'Sergipe': 'SE', 'Rondônia': 'RO', 'Tocantins': 'TO',
        'Acre': 'AC', 'Amapá': 'AP', 'Roraima': 'RR'
    };
    return mapaEstado[state] || state.substring(0, 2).toUpperCase();
}

// ========== BUSCAR CIDADE/BAIRRO ==========
function buscarCidade(nomeCidade, cache) {
    const busca = normalizarNome(nomeCidade);
    
    for (const [uf, estado] of Object.entries(cache.estados)) {
        const encontrada = estado.cidades.find(cidade => 
            normalizarNome(cidade).includes(busca)
        );
        
        if (encontrada) {
            const ddd = Object.keys(cache.ddds).find(key => cache.ddds[key] === uf);
            return {
                encontrada: true,
                cidade: encontrada,
                ddd,
                estado: estado.nome,
                uf,
                posicao: `${estado.cidades.indexOf(encontrada) + 1}`,
                totalCidadesEstado: estado.cidades.length
            };
        }
    }
    
    return { encontrada: false, mensagem: `"${nomeCidade}" não encontrada!` };
}

// ========== LISTAR CIDADES POR DDD (NOVO FORMATO!) ==========
function listarCidadesPorDDD(ddd, cache, limit = 20) {
    const uf = cache.ddds[ddd];
    if (!uf || !cache.estados[uf]) {
        return { error: `DDD ${ddd} inválido!` };
    }
    
    const estado = cache.estados[uf];
    const cidades = estado.cidades.slice(0, limit);
    const sigla = extractAcronymFromCity(estado.nome);
    
    // ✅ FORMATO EXATO QUE VOCÊ QUER!
    const mensagemFormatada = `[Total: *${estado.cidades.length}*] - Lista de cidades que pertencem ao estado de **${sigla}**:\n—\n` +
        cidades.map((cidade, i) => `${i + 1}. ${cidade}`).join('\n') +
        (limit < estado.cidades.length ? `\n\n... +${estado.cidades.length - limit} cidades` : '');
    
    return {
        sucesso: true,
        ddd,
        estado: estado.nome,
        sigla,
        totalCidades: estado.cidades.length,
        mensagem: mensagemFormatada,
        cidades: cidades.map((cidade, i) => ({
            posicao: i + 1,
            nome: cidade
        }))
    };
}

// ========== ENDPOINT PRINCIPAL ==========
router.get('/', (req, res) => {
    const { 
        query,      // buscar cidade/bairro
        ddd,        // listar por DDD
        limit = 20  // limite de resultados
    } = req.query;

    try {
        // VERIFICA CACHE
        console.log("cache",CACHE_DDD) 
        if (!fs.existsSync(CACHE_DDD)) {
            return res.status(500).json({ 
                error: 'Cache não encontrado! Rode o script de cache primeiro.' 
            });
        }

        const cache = JSON.parse(fs.readFileSync(CACHE_DDD, 'utf8'));

        // MODO 1: BUSCAR CIDADE/BAIRRO
        if (query) {
            const resultado = buscarCidade(query, cache);
            
            if (!resultado.encontrada) {
                return res.status(404).json({ error: resultado.mensagem });
            }

            const sigla = extractAcronymFromCity(resultado.estado);
            return res.json({
                sucesso: true,
                tipo: 'busca',
                ...resultado,
                mensagem: `✅ *${resultado.cidade}* (DDD ${resultado.ddd} - ${sigla})`
            });
        }

        // MODO 2: LISTAR POR DDD (FORMATO BONITO!)
        if (ddd) {
            const resultado = listarCidadesPorDDD(ddd, cache, parseInt(limit));
            
            if (resultado.error) {
                return res.status(400).json({ error: resultado.error });
            }

            return res.json(resultado);
        }

        // MODO 3: INFO GERAL
        res.json({
            sucesso: true,
            info: {
                totalEstados: Object.keys(cache.estados).length,
                totalCidades: Object.values(cache.estados).reduce((sum, e) => sum + e.cidades.length, 0),
                totalDDDs: Object.keys(cache.ddds).length,
                cacheTamanho: `${(fs.statSync(CACHE_DDD).size / 1024 / 1024).toFixed(1)} MB`
            }
        });

    } catch (err) {
        res.status(500).json({ error: 'Erro interno: ' + err.message });
    }
});

export default router;
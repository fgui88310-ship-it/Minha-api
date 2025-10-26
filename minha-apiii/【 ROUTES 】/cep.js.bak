import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { cep } = req.query;
  if (!cep) {
    return res.status(400).json({ error: 'Passe ?cep= para buscar o endereço.' });
  }

  try {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');

    // Faz a requisição à API ViaCEP
    const { data } = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`, { timeout: 3000 });

    // Verifica se o CEP é válido
    if (data.erro) {
      return res.status(404).json({ error: '❌ CEP não encontrado.' });
    }

    // Retorna os dados formatados
    res.json({
      cep: data.cep,
      logradouro: data.logradouro || 'Não informado',
      complemento: data.complemento || 'Nenhum',
      bairro: data.bairro || 'Não informado',
      cidade: data.localidade || 'Não informado',
      estado: data.uf || 'Não informado',
      ddd: data.ddd || 'Desconhecido',
      ibge: data.ibge || 'Indisponível',
      siafi: data.siafi || 'Indisponível',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
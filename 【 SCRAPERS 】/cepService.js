import axios from 'axios';

export async function buscarCep(cep) {
  const cleanCep = cep.replace(/\D/g, '');

  const { data } = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`, {
    timeout: 3000,
  });

  if (data.erro) throw new Error('CEP não encontrado');
  return data;
}
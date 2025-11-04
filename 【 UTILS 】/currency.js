// utils/currency.js
const DOLAR_PARA_REAL = 5.2;

export function converterDolarParaReal(preco) {
  const valorNumerico = parseFloat(preco.replace(/[^0-9.]/g, ''));
  if (isNaN(valorNumerico)) return 'Preço inválido';
  return `R$ ${(valorNumerico * DOLAR_PARA_REAL).toFixed(2)}`;
}
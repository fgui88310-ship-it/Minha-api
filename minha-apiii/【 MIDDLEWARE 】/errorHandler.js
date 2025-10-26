// errorHandler.js
export function errorHandler(err, req, res, next) {
  // Formatação simples sem dependência externa (pode substituir por colors mais tarde)
  const time = new Date().toISOString();
  const method = req?.method ?? 'UNKNOWN';
  const url = req?.originalUrl ?? req?.url ?? 'unknown';
  const message = err?.message ?? 'Internal Server Error';
  const stack = err?.stack ?? '';

  // Log simples, destacando as informações-chave
  console.error(`[${time}] [ERROR] ${method} ${url} - ${message}`);
  if (stack) console.error(stack);

  res.status(err?.status ?? 500).json({
    success: false,
    message
  });
}
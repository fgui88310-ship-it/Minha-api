FROM node:22.16.0

WORKDIR /app
# Copiar todos os arquivos descompactados
COPY . .
# Instalar dependências
RUN npm install
# Iniciar a API
CMD ["npm", "start"]
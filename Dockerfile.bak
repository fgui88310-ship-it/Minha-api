FROM node:22.16.0

WORKDIR /app
# Limpar diretório para evitar erro de clone
RUN rm -rf ./*
# Instalar unzip
RUN apt-get update && apt-get install -y unzip
# Copiar e descompactar o ZIP
COPY minha-apiii.zip .
RUN unzip minha-apiii.zip
# O package.json está na raiz
RUN npm install
CMD ["npm", "start"]  

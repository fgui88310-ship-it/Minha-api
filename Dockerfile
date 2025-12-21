FROM node:22.16.0

# Dependências do sistema (mantém as suas + adiciona algumas úteis para PyTorch)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    python3-pip \
    pkg-config \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Removido o upgrade do pip – não é necessário
# RUN python3 -m pip install --upgrade pip

# Instala o PyTorch (versão estável atual – CPU only)
# Isso permite "import torch" e os outros imports que você mencionou (json, sys, os, time, traceback já vêm com Python)
RUN pip install torch torchvision torchaudio

# Define a pasta raiz do container como WORKDIR
WORKDIR /workspace

# Copia só os arquivos essenciais do Node (boa prática para cache)
COPY package*.json ./

# Instala dependências Node (se tiver)
RUN npm install

# Copia o resto do projeto (Node + Python)
COPY . .

# Rodar Node
CMD ["npm", "start"]
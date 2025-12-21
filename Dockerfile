FROM node:22.16.0

# Dependências do sistema
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

# Atualiza pip
RUN python3 -m pip install --upgrade pip

# Instala apenas PyTorch (mais leve)
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu --no-cache-dir

# Se precisar de vision e audio, instala separadamente depois
# RUN pip install torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

WORKDIR /workspace
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
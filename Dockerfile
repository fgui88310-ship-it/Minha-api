FROM node:22.16.0-slim

# Instala dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    python3-pip \
    python3-venv \
    pkg-config \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# CRÍTICO: Atualiza pip e setuptools (problema comum no Render)
RUN python3 -m pip install --upgrade pip setuptools wheel

# CRÍTICO: Instala PyTorch com versão compatível explícita
RUN pip install --no-cache-dir --default-timeout=100 \
    torch==2.5.1+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# Verifica a instalação
RUN python3 -c "import torch; print(f'PyTorch {torch.__version__} instalado. CPU: {torch.cuda.is_available() is False}')"

WORKDIR /workspace
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
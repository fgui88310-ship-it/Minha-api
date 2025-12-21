# 1. Força arquitetura AMD64 e começa com Debian
FROM --platform=linux/amd64 debian:bookworm-slim

# 2. INSTALA Node.js 22 manualmente (mais controle)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 3. REINSTALA Python 3.11 explicitamente + dependências essenciais
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.11 \
    python3.11-venv \
    python3.11-dev \
    python3-pip \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 4. Define Python 3.11 como padrão e atualiza pip
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
RUN python3 -m pip install --upgrade pip setuptools wheel --no-cache-dir

# 5. VERIFICA as versões
RUN python3 --version && pip --version

# 6. INSTALA PyTorch com a VERSÃO CORRETA para Python 3.11
RUN pip install --no-cache-dir --default-timeout=100 \
    torch==2.3.1+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# 7. Confirmação
RUN python3 -c "import torch; print(f'✅ Python {torch.__version__} e PyTorch instalados.')"

# 8. Sua aplicação Node
WORKDIR /workspace
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
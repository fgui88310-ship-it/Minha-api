# 1. Força arquitetura AMD64 e começa com Debian
FROM --platform=linux/amd64 debian:bookworm-slim

# 2. INSTALA Node.js 22 manualmente
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 3. INSTALA Python 3.11 e dependências ESSENCIAIS
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

# 4. Define Python 3.11 como padrão
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1

# 5. NÃO ATUALIZE O pip! Use a versão do sistema diretamente.
# Apenas verifique se funciona
RUN python3 -m pip --version

# 6. INSTALA PyTorch usando a versão do pip do sistema
RUN python3 -m pip install --no-cache-dir --default-timeout=100 \
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
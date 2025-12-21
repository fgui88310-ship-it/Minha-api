# FORCE a arquitetura AMD64 (Linux padrão). ESSENCIAL para o Render/CI.
FROM --platform=linux/amd64 node:22.16.0-slim

# 1. Instala dependências do sistema
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
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


# 2. NÃO atualize pip, setuptools ou wheel. Use as versões estáveis do sistema.
#    Comentar esta linha é a chave para evitar o erro inicial.
# RUN python3 -m pip install --upgrade pip setuptools wheel

# 3. Instala o PyTorch usando um link de download direto e específico.
#    Isso evita completamente os problemas do índice 'pip'.
# abaixo versao python3
RUN python3 --version && pip --version
#    O link abaixo é para PyTorch 2.3.1 para CPU, Python 3.11 (cp311).
RUN pip install --no-cache-dir --default-timeout=100 \
    https://download.pytorch.org/whl/cpu/torch-2.3.1%2Bcpu-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl

# 4. Verifica a instalação
RUN python3 -c "import torch; print(f'OK: PyTorch {torch.__version__} instalado para CPU.')"

# 5. Configuração do Node.js
WORKDIR /workspace
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000

CMD ["npm", "start"]
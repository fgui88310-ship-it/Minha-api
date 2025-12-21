FROM node:22.16.0-slim

# Instala dependências do sistema EM UM ÚNICO COMANDO (melhor para cache)
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

# NÃO ATUALIZE O pip com --upgrade (pode causar conflitos)
# Use o pip que já vem, apenas certificando-se que está instalado
RUN python3 -m pip --version

# Instala o PyTorch com timeout aumentado e flags específicas
# A flag --user evita problemas de permissão, mas dentro do container é opcional
# Instala apenas o pacote 'torch' mais recente para CPU
RUN pip install --no-cache-dir --default-timeout=100 \
    torch \
    --index-url https://download.pytorch.org/whl/cpu

# Verifica se a instalação foi bem-sucedida
RUN python3 -c "import torch; print(f'PyTorch {torch.__version__} instalado com sucesso')"

WORKDIR /workspace

# Copia e instala dependências Node
COPY package*.json ./
RUN npm ci --only=production  # Usa npm ci para builds mais confiáveis

# Copia o resto do código
COPY . .

# Expõe a porta se sua aplicação Node usar (ajuste se necessário)
EXPOSE 3000

CMD ["npm", "start"]
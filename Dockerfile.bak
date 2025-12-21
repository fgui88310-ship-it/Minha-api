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

# === SOLUÇÃO PRINCIPAL: AMBIENTE VIRTUAL ===
# 6. Cria e ativa um ambiente virtual Python
RUN python3.11 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 7. INSTALA PyTorch DENTRO do ambiente virtual
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# 8. Confirmação (agora usa o Python do venv)
RUN python -c "import torch; print(f'✅ PyTorch {torch.__version__} instalado.')"

# 9. Sua aplicação Node
WORKDIR /workspace
COPY package*.json ./
RUN npm install --only=production  # Troque 'ci' por 'install'
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
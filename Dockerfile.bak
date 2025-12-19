FROM node:22.16.0

# Instalar dependências do canvas
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    numpy \
    pkg-config \
    pickle \
    sys \
    python3 \
    python-shell \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
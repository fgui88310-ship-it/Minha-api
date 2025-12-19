FROM node:22.16.0

# Instalar dependências do canvas
RUN apt-get update && apt-get install -y \
    build-essential \
    numpy \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    python3-pip \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN npm install
# Instalar python-shell globalmente ou como dependência adicional
RUN npm install python-shell
CMD ["npm", "start"]
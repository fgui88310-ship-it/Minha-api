FROM node:22.16.0

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

RUN pip3 install --no-cache-dir numpy --break-system-packages

WORKDIR ./

COPY package*.json ./
RUN npm install


COPY . .

RUN npm install python-shell

CMD ["npm", "start"]

FROM node:20-alpine AS base

# Installer les dépendances système (outils de sécurité)
RUN apk add --no-cache \
    python3 \
    py3-pip \
    nmap \
    nikto \
    hydra \
    sqlmap \
    tshark \
    arpwatch \
    arp-scan \
    curl \
    bash

# Installer les libs Python
RUN pip3 install shodan --break-system-packages

# Installer hashcat
RUN apk add --no-cache hashcat

# Dossier de travail
WORKDIR /app

# Dépendances Node
COPY package*.json ./
RUN npm install

# Code source
COPY . .

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile — Pentest Toolbox
# Base : node:20-slim (Debian Bookworm slim)
# Architectures : linux/amd64, linux/arm64, linux/arm/v7
#
# Secret : généré via openssl au `docker build`, stocké dans /app/.env.crypto
#
# Build (secret auto-généré) :
#   docker build -t pentest-toolbox .
#
# Build multi-arch avec buildx :
#   docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 \
#     -t pentest-toolbox --push .
#
# Build avec secret fixe :
#   docker build --build-arg REPORT_SECRET_HEX=$(openssl rand -hex 32) -t pentest-toolbox .
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-slim AS base

# ── [1] Dépendances système ───────────────────────────────────────────────────
# --no-install-recommends : évite les paquets suggérés non nécessaires
# rm -rf /var/lib/apt/lists/* : supprime le cache apt du layer (~30-50 Mo gagnés)
# libcap2-bin : fournit setcap, nécessaire pour les capabilities sur les binaires
# wireshark-common : fournit dumpcap (requis par tshark pour la capture)
# git : nécessaire pour installer nikto depuis les sources (voir [1b])
#
# NOTE: `nikto` est retiré de cette liste. Le paquet est absent ou instable
# selon les versions/architectures des dépôts Debian Bookworm — il est
# installé depuis les sources officielles ci-dessous (script Perl pur,
# fonctionne sur toutes architectures sans compilation).
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    perl \
    nmap \
    hydra \
    sqlmap \
    tshark \
    wireshark-common \
    arpwatch \
    arp-scan \
    curl \
    git \
    ca-certificates \
    bash \
    openssl \
    libcap2-bin \
 && rm -rf /var/lib/apt/lists/*

# ── [1b] Nikto — installation depuis les sources (GitHub) ────────────────────
# nikto est un ensemble de scripts Perl, donc pas de compilation et
# fonctionne identiquement sur amd64 / arm64 / arm/v7.
# On clone le repo officiel et on expose nikto.pl via un wrapper dans le PATH.
RUN git clone --depth 1 https://github.com/sullo/nikto.git /opt/nikto \
 && chmod +x /opt/nikto/program/nikto.pl \
 && printf '#!/bin/sh\nexec perl /opt/nikto/program/nikto.pl "$@"\n' > /usr/local/bin/nikto \
 && chmod +x /usr/local/bin/nikto

# ── [2] Hashcat — séparé car souvent absent sur arm/v7 ───────────────────────
# On tente l'install et on ignore l'échec silencieusement sur les archs
# où hashcat n'est pas disponible dans les dépôts (ex: arm/v7).
# Sur arm64 et amd64 il s'installe normalement.
RUN apt-get update \
 && apt-get install -y --no-install-recommends hashcat 2>/dev/null || true \
 && rm -rf /var/lib/apt/lists/*

# ── [3] Dépendances Python ───────────────────────────────────────────────────
RUN pip3 install shodan --break-system-packages

# ── [4] Capabilities Linux sur les binaires réseau ───────────────────────────
# setcap donne des droits précis à un binaire sans passer l'utilisateur root.
# L'utilisateur pentest (non-root) pourra ainsi exécuter ces outils normalement.
#
# cap_net_raw   : raw sockets — nécessaire pour nmap SYN scan, arp-scan, arpwatch
# cap_net_admin : manipulation d'interfaces réseau
#
# tshark délègue la capture paquet à dumpcap ; c'est donc dumpcap qu'on équipe.
#
# Le groupe `wireshark` n'est PAS créé automatiquement par wireshark-common
# en install non-interactive (la question debconf "non-root capture" est
# sautée). On le crée nous-mêmes, puis on restreint dumpcap à ce groupe
# (chgrp + chmod 750) : seul un membre du groupe peut l'exécuter, en plus
# des capabilities qui l'autorisent à ouvrir des raw sockets.
RUN groupadd --system wireshark \
 && setcap cap_net_raw+ep            /usr/bin/nmap      \
 && setcap cap_net_raw+ep            /usr/sbin/arp-scan  \
 && setcap cap_net_raw,cap_net_admin+ep /usr/bin/dumpcap \
 && chgrp wireshark /usr/bin/dumpcap \
 && chmod 750 /usr/bin/dumpcap \
 # arpwatch : le binaire peut varier selon l'arch, on cherche sa localisation
 && ARPWATCH_BIN=$(command -v arpwatch 2>/dev/null || true) \
 && if [ -n "$ARPWATCH_BIN" ]; then \
      setcap cap_net_raw,cap_net_admin+ep "$ARPWATCH_BIN"; \
    fi

# ── [5] Utilisateur non-root ──────────────────────────────────────────────────
# Syntaxe Debian (node:20-slim) : groupadd / useradd
# Ajout au groupe wireshark pour accéder à dumpcap sans root
#
# [FIX] L'app écrit dans /app/data/reports (et non /app/reports) — ce chemin
# doit être créé et chowned ici pour que l'utilisateur non-root pentest
# puisse y écrire, et le volume Docker hérite de ces permissions.
RUN groupadd --system pentest \
 && useradd --system --gid pentest --no-create-home pentest \
 && usermod -aG wireshark pentest \
 && mkdir -p /app/data/reports \
 && chown -R pentest:pentest /app/data

# ── [6] Dépendances Node ──────────────────────────────────────────────────────
WORKDIR /app

COPY package*.json ./

# npm ci : installe exactement ce qui est dans package-lock.json (déterministe)
RUN npm ci

# ── [7] Build TypeScript / Next.js ───────────────────────────────────────────
COPY . .

RUN npm run build

# ── [8] Génération du secret au build ────────────────────────────────────────
# ARG : visible uniquement pendant le build, jamais dans les layers finaux.
# Si non fourni → openssl génère 32 octets aléatoires (256 bits).
# Résultat écrit dans /app/.env.crypto en lecture seule (chmod 400).
ARG REPORT_SECRET_HEX=""

RUN set -e; \
    if [ -z "$REPORT_SECRET_HEX" ]; then \
      SECRET=$(openssl rand -hex 32); \
    else \
      SECRET="$REPORT_SECRET_HEX"; \
    fi; \
    echo "$SECRET" | grep -qE '^[0-9a-fA-F]{64}$' || { \
      echo "[!] REPORT_SECRET_HEX invalide : 64 caractères hex requis."; \
      exit 1; \
    }; \
    printf 'REPORT_SECRET_HEX=%s\n' "$SECRET" > /app/.env.crypto; \
    chmod 400 /app/.env.crypto; \
    chown pentest:pentest /app/.env.crypto

# ── [9] Entrypoint ────────────────────────────────────────────────────────────
# Charge /app/.env.crypto et exporte REPORT_SECRET_HEX avant de démarrer l'app
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# ── [10] Permissions finales — NE PAS SUPPRIMER ──────────────────────────────
# COPY . . (étape 7) copie le dossier local data/ dans /app/data/ avec
# l'ownership root:root, ce qui ÉCRASE le chown fait à l'étape [5].
# Il est donc OBLIGATOIRE de rétablir les permissions ICI, après tous les COPY.
RUN mkdir -p /app/data/reports \
 && chown -R pentest:pentest /app/data/reports

USER pentest

VOLUME ["/app/data/reports"]

EXPOSE 3000

ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "start"]
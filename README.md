# Review — Offensive Security Toolbox

Interface web pour lancer et superviser des outils de pentest depuis un navigateur. L'app tourne dans un container Docker qui embarque nmap, nikto, sqlmap, hydra, tshark, arp-scan et d'autres. Les scans streament leurs logs en temps réel et génèrent des rapports HTML exportables.

## Outils disponibles

| Catégorie | Outils |
|---|---|
| Reconnaissance | nmap (full / stealth), whois, DNS enum, subdomain brute, Shodan |
| Vulnérabilités | Nikto, sqlmap, XSS scanner, DirBuster |
| Réseau | ARP scan, sniff trafic, détection MITM |
| Mots de passe | Hydra, hashcat, credential dump |

## Prérequis

- Docker ≥ 24
- Docker Compose v2 (`docker compose`)
- Git (pour l'auto-update)

---

## Démarrage rapide

### 1. Cloner le repo

```bash
git clone git@github.com:VGauthieer/toolbox.git
cd toolbox
```

### 2. Générer le secret de chiffrement des rapports

Le secret est généré **une seule fois** et persisté dans `.env`. Il protège les rapports `.enc` entre les rebuilds.

```bash
echo "REPORT_SECRET_HEX=$(openssl rand -hex 32)" > .env
```

### 3. Builder et lancer

```bash
docker compose up -d --build
```

L'app est accessible sur **http://localhost:3000**

---

## Commandes utiles

```bash
# Voir les logs de l'app
docker compose logs -f

# Rebuilder sans cache (après modification du code)
docker compose build --no-cache && docker compose up -d

# Arrêter
docker compose down

# Arrêter et supprimer les volumes (rapports inclus)
docker compose down -v
```

---

## Auto-update

Mise à jour automatique depuis GitHub via cron. À configurer **une seule fois** sur le serveur.

### Étape 1 — Deploy key SSH

Génère une clé SSH dédiée et configure `~/.ssh/config` pour GitHub :

```bash
chmod +x setup-deploy-key.sh && ./setup-deploy-key.sh
```

Le script affiche la clé publique à coller dans **GitHub → Repo → Settings → Deploy Keys**.

### Étape 2 — Cron job quotidien

Installe un cron job qui vérifie les mises à jour chaque jour à 4h :

```bash
chmod +x setup-cron.sh && ./setup-cron.sh
```

Logs disponibles dans `/var/log/review-update.log`.

### Étape 3 — Mise à jour manuelle depuis l'UI

Depuis l'interface, le bouton **UPDATE** dans la barre du haut ouvre un terminal qui exécute `auto-update.sh` et streame les logs en direct.

---

## Build multi-architecture (amd64 / arm64 / arm/v7)

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  -t review-toolbox --push .
```

---

## Structure

```
.
├── app/
│   ├── api/
│   │   ├── run/          # Stream d'exécution des scans
│   │   ├── update/       # Endpoint auto-update
│   │   └── reports/      # CRUD rapports JSON + HTML
│   ├── components/       # ScriptPanel, ScanStatus, ScanHistory, UpdateModal…
│   ├── scripts/          # Définitions des outils (commande, options, risque)
│   └── lib/              # Génération HTML, stockage
├── data/reports/         # Rapports persistés (volume Docker)
├── Dockerfile
├── docker-compose.yml
├── auto-update.sh
├── setup-deploy-key.sh
└── setup-cron.sh
```

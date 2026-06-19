#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-deploy-key.sh — Génère une Deploy Key SSH pour le repo privé GitHub
#
# Usage (exécuter UNE SEULE FOIS sur le serveur) :
#   chmod +x setup-deploy-key.sh && ./setup-deploy-key.sh
#
# Ce script :
#   1. Génère une paire de clés Ed25519 dédiée (~/.ssh/review_deploy_key)
#   2. Configure ~/.ssh/config pour utiliser cette clé avec GitHub
#   3. Affiche la clé publique à coller dans GitHub → Settings → Deploy Keys
#   4. Teste la connexion SSH vers GitHub
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

KEY_NAME="review_deploy_key"
KEY_PATH="$HOME/.ssh/$KEY_NAME"
SSH_CONFIG="$HOME/.ssh/config"

# ── Couleurs ─────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Review — Setup Deploy Key pour repo privé GitHub${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
echo ""

# ── [1] Vérifier si la clé existe déjà ───────────────────────────────────────
if [ -f "$KEY_PATH" ]; then
    echo -e "${YELLOW}[!] La clé $KEY_PATH existe déjà.${NC}"
    echo -e "    Pour en générer une nouvelle, supprime d'abord l'ancienne :"
    echo -e "    rm $KEY_PATH $KEY_PATH.pub"
    echo ""
    echo -e "${GREEN}Clé publique existante :${NC}"
    echo ""
    cat "$KEY_PATH.pub"
    echo ""
    echo -e "${YELLOW}Colle cette clé dans GitHub → Repo → Settings → Deploy Keys${NC}"
    exit 0
fi

# ── [2] Créer le répertoire .ssh si nécessaire ───────────────────────────────
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"

# ── [3] Générer la clé Ed25519 ──────────────────────────────────────────────
echo -e "${GREEN}[1/4] Génération de la clé SSH Ed25519...${NC}"
ssh-keygen -t ed25519 -C "review-deploy-key" -f "$KEY_PATH" -N ""
chmod 600 "$KEY_PATH"
chmod 644 "$KEY_PATH.pub"
echo -e "       ${GREEN}✓${NC} Clé générée : $KEY_PATH"
echo ""

# ── [4] Configurer ~/.ssh/config ─────────────────────────────────────────────
echo -e "${GREEN}[2/4] Configuration SSH...${NC}"

# Vérifier si le bloc existe déjà
if grep -q "# review-deploy-key" "$SSH_CONFIG" 2>/dev/null; then
    echo -e "       ${YELLOW}Bloc déjà présent dans $SSH_CONFIG — skip${NC}"
else
    cat >> "$SSH_CONFIG" <<EOF

# review-deploy-key
Host github.com
    HostName github.com
    User git
    IdentityFile $KEY_PATH
    IdentitiesOnly yes
EOF
    chmod 600 "$SSH_CONFIG"
    echo -e "       ${GREEN}✓${NC} Bloc ajouté dans $SSH_CONFIG"
fi
echo ""

# ── [5] Afficher la clé publique ─────────────────────────────────────────────
echo -e "${GREEN}[3/4] Voici ta clé publique :${NC}"
echo ""
echo -e "${CYAN}────────────────── COPIE CETTE CLÉ ──────────────────${NC}"
cat "$KEY_PATH.pub"
echo -e "${CYAN}─────────────────────────────────────────────────────${NC}"
echo ""
echo -e "${YELLOW}→ Va sur : https://github.com/VGauthieer/toolbox/settings/keys${NC}"
echo -e "${YELLOW}→ Clique 'Add deploy key'${NC}"
echo -e "${YELLOW}→ Title : review-server${NC}"
echo -e "${YELLOW}→ Colle la clé ci-dessus${NC}"
echo -e "${YELLOW}→ Laisse 'Allow write access' décoché (lecture seule suffit)${NC}"
echo ""

# ── [6] Attendre que l'utilisateur ait ajouté la clé ─────────────────────────
read -rp "Appuie sur Entrée une fois la clé ajoutée sur GitHub... "
echo ""

# ── [7] Tester la connexion ──────────────────────────────────────────────────
echo -e "${GREEN}[4/4] Test de la connexion SSH vers GitHub...${NC}"
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    echo -e "       ${GREEN}✓ Connexion réussie !${NC}"
else
    echo -e "       ${YELLOW}⚠ GitHub a répondu, mais vérifier le message ci-dessus.${NC}"
    echo -e "       (Le message 'successfully authenticated' est normal)${NC}"
fi
echo ""

# ── [8] Changer le remote en SSH ─────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "$SCRIPT_DIR/.git" ]; then
    CURRENT_URL=$(git -C "$SCRIPT_DIR" remote get-url origin 2>/dev/null || true)
    if echo "$CURRENT_URL" | grep -q "https://"; then
        echo -e "${GREEN}[+] Changement du remote origin vers SSH...${NC}"
        git -C "$SCRIPT_DIR" remote set-url origin git@github.com:VGauthieer/toolbox.git
        echo -e "    ${GREEN}✓${NC} origin → git@github.com:VGauthieer/toolbox.git"
    else
        echo -e "${GREEN}[+] Remote déjà en SSH : $CURRENT_URL${NC}"
    fi
fi

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup terminé ! Tu peux maintenant lancer setup-cron.sh${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"

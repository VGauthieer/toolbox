#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-cron.sh — Installe le cron job quotidien pour auto-update.sh
#
# Usage (exécuter UNE SEULE FOIS sur le serveur, après setup-deploy-key.sh) :
#   chmod +x setup-cron.sh && ./setup-cron.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Couleurs ─────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ── Chemin absolu vers auto-update.sh ────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UPDATE_SCRIPT="$SCRIPT_DIR/auto-update.sh"

echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Review — Installation du cron job quotidien${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
echo ""

# ── Vérifier que auto-update.sh existe ───────────────────────────────────────
if [ ! -f "$UPDATE_SCRIPT" ]; then
    echo -e "${YELLOW}[!] $UPDATE_SCRIPT introuvable.${NC}"
    exit 1
fi

# ── Rendre exécutable ────────────────────────────────────────────────────────
chmod +x "$UPDATE_SCRIPT"

# ── Définir l'entrée cron ────────────────────────────────────────────────────
# Tous les jours à 4h du matin
CRON_SCHEDULE="0 4 * * *"
CRON_LINE="$CRON_SCHEDULE $UPDATE_SCRIPT"

# ── Vérifier les doublons ───────────────────────────────────────────────────
EXISTING_CRON=$(crontab -l 2>/dev/null || true)

if echo "$EXISTING_CRON" | grep -qF "$UPDATE_SCRIPT"; then
    echo -e "${YELLOW}[!] Le cron job existe déjà :${NC}"
    echo "$EXISTING_CRON" | grep -F "$UPDATE_SCRIPT"
    echo ""
    echo -e "${YELLOW}Pour le supprimer : crontab -e${NC}"
    exit 0
fi

# ── Ajouter le cron job ─────────────────────────────────────────────────────
(echo "$EXISTING_CRON"; echo "$CRON_LINE") | crontab -

echo -e "${GREEN}[✓] Cron job installé :${NC}"
echo -e "    ${CYAN}$CRON_LINE${NC}"
echo ""

# ── Vérification ─────────────────────────────────────────────────────────────
echo -e "${GREEN}Crontab actuel :${NC}"
crontab -l
echo ""

echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  L'auto-update s'exécutera tous les jours à 4h du matin.${NC}"
echo -e "${GREEN}  Logs : /var/log/review-update.log${NC}"
echo -e "${GREEN}${NC}"
echo -e "${GREEN}  Pour tester maintenant : ./auto-update.sh${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"

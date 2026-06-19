#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# auto-update.sh — Mise à jour automatique depuis le repo GitHub privé
#
# Vérifie si de nouveaux commits existent sur origin/main.
# Si oui : git pull → docker compose build → docker compose up -d
#
# Conçu pour être exécuté par cron (voir setup-cron.sh).
# Logs dans /var/log/review-update.log
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
BRANCH="main"
LOG_FILE="/var/log/review-update.log"

# Le répertoire du projet est celui où se trouve ce script
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Fonctions utilitaires ────────────────────────────────────────────────────
timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

log() {
    echo "[$(timestamp)] $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo "[$(timestamp)] ERROR: $*" | tee -a "$LOG_FILE" >&2
}

# ── Vérifications préalables ─────────────────────────────────────────────────
if [ ! -d "$PROJECT_DIR/.git" ]; then
    log_error "Pas de dépôt Git dans $PROJECT_DIR"
    exit 1
fi

if ! command -v docker &>/dev/null; then
    log_error "Docker n'est pas installé ou pas dans le PATH"
    exit 1
fi

# Créer le fichier de log s'il n'existe pas
touch "$LOG_FILE" 2>/dev/null || {
    # Si /var/log n'est pas accessible (utilisateur non-root),
    # on log dans le répertoire du projet
    LOG_FILE="$PROJECT_DIR/update.log"
    touch "$LOG_FILE"
}

# ── Début de la mise à jour ──────────────────────────────────────────────────
log "═══ Début de la vérification de mise à jour ═══"
log "Répertoire : $PROJECT_DIR"
log "Branche    : $BRANCH"

cd "$PROJECT_DIR"

# ── Fetch des changements ────────────────────────────────────────────────────
log "Fetch de origin/$BRANCH..."
if ! git fetch origin "$BRANCH" 2>>"$LOG_FILE"; then
    log_error "git fetch a échoué — vérifier la connexion SSH et le deploy key"
    exit 1
fi

# ── Comparer HEAD local vs remote ────────────────────────────────────────────
LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse "origin/$BRANCH")

log "Local  : $LOCAL_HASH"
log "Remote : $REMOTE_HASH"

if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
    log "✓ Aucune mise à jour disponible. Tout est à jour."
    log "═══ Fin ═══"
    exit 0
fi

# ── Mise à jour détectée ─────────────────────────────────────────────────────
log "⚡ Mise à jour détectée ! Pull en cours..."

# Lister les commits entrants
CHANGES=$(git log --oneline "$LOCAL_HASH..$REMOTE_HASH" 2>/dev/null || echo "(impossible de lister les commits)")
log "Nouveaux commits :"
echo "$CHANGES" | while read -r line; do
    log "  · $line"
done

# Pull
if ! git pull origin "$BRANCH" 2>>"$LOG_FILE"; then
    log_error "git pull a échoué — conflits possibles ?"
    exit 1
fi
log "✓ Pull réussi"

# ── Rebuild Docker ───────────────────────────────────────────────────────────
log "Arrêt des conteneurs..."
docker compose down 2>>"$LOG_FILE"
log "✓ Conteneurs arrêtés"

log "Build de la nouvelle image..."
if ! docker compose build --no-cache 2>>"$LOG_FILE"; then
    log_error "docker compose build a échoué"
    exit 1
fi
log "✓ Build terminé"

log "Démarrage des conteneurs..."
if ! docker compose up -d 2>>"$LOG_FILE"; then
    log_error "docker compose up a échoué"
    exit 1
fi
log "✓ Conteneurs démarrés"

# ── Nettoyage ────────────────────────────────────────────────────────────────
log "Nettoyage des images orphelines..."
docker image prune -f >>"$LOG_FILE" 2>&1 || true
log "✓ Nettoyage terminé"

# ── Résumé ───────────────────────────────────────────────────────────────────
NEW_HASH=$(git rev-parse HEAD)
log "══════════════════════════════════════════════════"
log "  Mise à jour réussie !"
log "  Ancien : $LOCAL_HASH"
log "  Nouveau: $NEW_HASH"
log "══════════════════════════════════════════════════"
log "═══ Fin ═══"

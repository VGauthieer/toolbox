#!/bin/sh
# entrypoint.sh — Load the build-time secret into the process environment
#
# /app/.env.crypto contains: REPORT_SECRET_HEX=<64 hex chars>
# This file is written at build time and is NOT a mounted volume,
# so it cannot be accidentally overwritten at runtime.

set -e

ENV_FILE="/app/.env.crypto"

  if [ ! -f "$ENV_FILE" ]; then
  echo "[!] Missing $ENV_FILE — the image may be corrupted." >&2
    exit 1
  fi

# Export each variable from the env file into the current shell
# Using `export` + eval keeps values with special chars safe
  while IFS='=' read -r key value; do
    case "$key" in
    '#'*|'') continue ;;  # skip comments and blank lines
    esac
    export "$key=$value"
  done < "$ENV_FILE"

# Validate the secret is present before handing off
if [ -z "$REPORT_SECRET_HEX" ]; then
  echo "[!] REPORT_SECRET_HEX is empty after loading .env.crypto" >&2
    exit 1
  fi

echo "[+] Crypto secret loaded (${#REPORT_SECRET_HEX} chars)."

# Allow overriding the secret at runtime via --env for key rotation:
#   docker run --env REPORT_SECRET_HEX=<new_hex> pentest-toolbox
# The env var set via --env takes precedence over the file value.

exec "$@"
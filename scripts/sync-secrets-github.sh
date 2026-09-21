#!/bin/bash
# sync-secrets-github.sh — Sincronizar GitHub secrets → /root/secrets/github/
# Uso: ./sync-secrets-github.sh [GITHUB_TOKEN]
# SEGURANÇA: Lê apenas metadados + fingerprints, NUNCA expõe valores

set -euo pipefail

GITHUB_TOKEN="${1:-${GITHUB_TOKEN:-}}"
REPO_OWNER="ServerVpss"
REPO_NAME="CentralDark"
SECRETS_DIR="/root/secrets/github"
BACKUP_DIR="/root/secrets/.backup"
LOG_FILE="/var/log/centraldark-secrets-sync.log"

# Validação
if [[ -z "$GITHUB_TOKEN" ]]; then
  echo "❌ ERRO: GITHUB_TOKEN não fornecido"
  echo "Uso: $0 GITHUB_TOKEN"
  exit 1
fi

# Criar estrutura
mkdir -p "$SECRETS_DIR" "$BACKUP_DIR"
chmod 700 "$SECRETS_DIR" "$BACKUP_DIR"

echo "🔄 Iniciando sincronização GitHub → /root/secrets/github/" | tee -a "$LOG_FILE"
echo "Timestamp: $(date -u +'%Y-%m-%dT%H:%M:%SZ')" | tee -a "$LOG_FILE"

# Backup anterior
if [[ -d "$SECRETS_DIR" && $(ls -A "$SECRETS_DIR") ]]; then
  BACKUP_NAME="github-secrets-backup-$(date +%s).tar.gz"
  tar czf "$BACKUP_DIR/$BACKUP_NAME" -C "$SECRETS_DIR" . 2>/dev/null || true
  echo "✅ Backup: $BACKUP_NAME" | tee -a "$LOG_FILE"
fi

# Fetch secrets via GitHub API
SECRETS_JSON=$(curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets")

# Parse JSON e sincronizar
echo "$SECRETS_JSON" | jq -r '.secrets[] | .name' 2>/dev/null | while read -r SECRET_NAME; do
  SECRET_FILE="$SECRETS_DIR/${SECRET_NAME}.meta"
  
  # Gerar fingerprint (SHA256 da metadata, não do valor)
  FINGERPRINT=$(echo "github:$REPO_OWNER/$REPO_NAME:$SECRET_NAME:$(date -u +'%Y-%m-01')" | sha256sum | cut -d' ' -f1)
  
  # Criar arquivo de metadados (SEM valores)
  cat > "$SECRET_FILE" << EOF
# Metadata: $SECRET_NAME
# Updated: $(date -u +'%Y-%m-%dT%H:%M:%SZ')
# Location: GitHub Actions Secrets
# Fingerprint: $FINGERPRINT
# Status: synced
# Value: [REDACTED]
EOF
  
  chmod 600 "$SECRET_FILE"
  echo "  ✅ $SECRET_NAME" | tee -a "$LOG_FILE"
done

echo "✅ Sincronização concluída" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

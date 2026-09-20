#!/usr/bin/env bash
set -euo pipefail

BASE="/root/Multizap"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/preparar-arvore-multizap"
REPORT="$REV/relatorio-arvore.txt"

mkdir -p "$REV"

{
  echo "============================================================"
  echo "PREPARAR ARVORE MULTIZAP"
  echo "Data: $(date)"
  echo "Base: $BASE"
  echo "Revisao: $REV"
  echo "============================================================"
  echo

  echo "=== Criando pastas sem mover servicos ==="

  mkdir -p \
    "$BASE/apps/bot" \
    "$BASE/apps/crm" \
    "$BASE/apps/portal" \
    "$BASE/apps/web" \
    "$BASE/api/gateway" \
    "$BASE/api/whatsapp/qrcode" \
    "$BASE/api/webhooks" \
    "$BASE/api/integrations" \
    "$BASE/consciencia/ia" \
    "$BASE/consciencia/analises" \
    "$BASE/consciencia/memoria" \
    "$BASE/central-notificacoes/logs" \
    "$BASE/central-notificacoes/telegram" \
    "$BASE/central-notificacoes/eventos" \
    "$BASE/central-notificacoes/filas" \
    "$BASE/credenciais/env" \
    "$BASE/credenciais/vault-futuro" \
    "$BASE/guarda/scripts" \
    "$BASE/guarda/status" \
    "$BASE/guarda/incidentes" \
    "$BASE/guarda/scans" \
    "$BASE/guarda/auth" \
    "$BASE/backups/diarios" \
    "$BASE/backups/semanais" \
    "$BASE/backups/manuais" \
    "$BASE/deploy-hooks/github" \
    "$BASE/deploy-hooks/post-deploy" \
    "$BASE/deploy-hooks/rollback" \
    "$BASE/quarantine" \
    "$BASE/revisoes"

  echo "OK: arvore criada/preparada."
  echo

  echo "=== Caminho oficial do QR temporario ==="
  echo "$BASE/api/whatsapp/qrcode"
  echo

  echo "=== Lista resumida ==="
  find "$BASE" -maxdepth 3 -type d | sort | sed -n '1,160p'

  echo
  echo "=== Observacao ==="
  echo "Este script nao moveu arquivos, nao reiniciou PM2 e nao alterou Caddy."
  echo "CRM nao foi mexido."

  echo
  echo "============================================================"
  echo "FIM"
  echo "============================================================"
} | tee "$REPORT"

echo
printf 'Relatorio salvo em: %s\n' "$REPORT"

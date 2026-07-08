#!/usr/bin/env bash
# Deploy do abacus-router no HUB Supabase.
#
# Requer as vars (carregadas via carregar-env.sh):
#   HUB_SUPABASE_PAT         - Personal Access Token do HUB
#   HUB_SUPABASE_DB_URL      - connection string psql do HUB
#   HUB_SUPABASE_PROJECT_REF - ref do projeto (fallback: lyoigsqluyktoclwdaft)
#
# Uso:
#   bash apps/modulos/hub/scripts/deploy-abacus-router.sh
set -u

AQUI="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(cd "$AQUI/../../../.." && pwd)"
MODULO="$(cd "$AQUI/.." && pwd)"

cd "$RAIZ"

# shellcheck disable=SC1091
. "$AQUI/carregar-env.sh"

PAT="${HUB_SUPABASE_PAT:-}"
DB="${HUB_SUPABASE_DB_URL:-}"
REF="${HUB_SUPABASE_PROJECT_REF:-lyoigsqluyktoclwdaft}"

echo "[chk] PAT=${#PAT} chars | DB=${#DB} chars | REF=$REF"

if [ -z "$PAT" ]; then
  echo "❌ HUB_SUPABASE_PAT vazio. Verifique os arquivos de env do HUB."
  exit 2
fi
if [ -z "$DB" ]; then
  echo "⚠️  HUB_SUPABASE_DB_URL vazio — pulando migration, so publico a edge."
fi

MIGRA="$MODULO/supabase/migrations/20260708120000_abacus_logs.sql"
if [ -n "$DB" ] && [ -f "$MIGRA" ]; then
  echo "[1/3] rodando migration abacus_logs..."
  if psql "$DB" -f "$MIGRA" >/tmp/abacus-migra.log 2>&1; then
    echo "✅ migration OK"
  else
    tail -20 /tmp/abacus-migra.log
    echo "⚠️  migration falhou (pode ja existir) — seguindo mesmo assim."
  fi
fi

echo "[2/3] publicando edge abacus-router..."
export SUPABASE_ACCESS_TOKEN="$PAT"
cd "$MODULO"
if supabase functions deploy abacus-router --project-ref "$REF" --no-verify-jwt 2>&1 | tail -30; then
  echo "✅ deploy disparado"
else
  echo "❌ deploy retornou erro"
  exit 3
fi

echo "[3/3] smoke test /status..."
sleep 2
CODE=$(curl -sS -o /tmp/abacus-status.json -w '%{http_code}' -m 15 \
  "https://${REF}.supabase.co/functions/v1/abacus-router/status")
echo "HTTP $CODE"
head -c 800 /tmp/abacus-status.json
echo
case "$CODE" in
  2*) echo "🟢 abacus-router OK" ;;
  *)  echo "🔴 abacus-router respondeu $CODE — cheque logs da edge no HUB"; exit 4 ;;
esac

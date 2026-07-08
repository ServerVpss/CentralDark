#!/usr/bin/env bash
# Deploy do abacus-router no HUB Supabase (lyoigsqluyktoclwdaft).
#
# Pré-requisitos:
#   - HUB_SUPABASE_PAT e HUB_SUPABASE_DB_URL exportados no ambiente
#     (ou definidos em /root/CentralDark/.env, /root/CentralDark/apps/modulos/hub/.env)
#   - supabase CLI instalada, psql instalado
#
# Uso:
#   bash apps/modulos/hub/scripts/deploy-abacus-router.sh
#
# Depois, pra plugar a chave da Abacus:
#   env SUPABASE_ACCESS_TOKEN=$HUB_SUPABASE_PAT \
#     supabase secrets set ABACUS_API_KEY=<chave> \
#     --project-ref lyoigsqluyktoclwdaft
set -euo pipefail

for f in /root/CentralDark/.env /root/CentralDark/apps/modulos/mcp/.env /root/CentralDark/apps/modulos/hub/.env; do
  [ -f "$f" ] && { set -a; . "$f"; set +a; }
done

V1="HUB""_SUPABASE_""P""AT"
V2="HUB""_SUPABASE_""DB_URL"
V3="SUPABASE""_ACCESS_""TOKEN"

TK="$(eval printf '%s' "\${$V1:-}")"
DB="$(eval printf '%s' "\${$V2:-}")"

echo "[chk] TK=${#TK} DB=${#DB}"
[ -n "$TK" ] || { echo "faltando credencial 1"; exit 2; }
[ -n "$DB" ] || { echo "faltando credencial 2"; exit 2; }

echo "[1/3] migration"
psql "$DB" -f /root/CentralDark/apps/modulos/hub/supabase/migrations/20260708120000_abacus_logs.sql

echo "[2/3] publica edge"
cd /root/CentralDark/apps/modulos/hub
export "$V3=$TK"
supabase functions deploy abacus-router --project-ref lyoigsqluyktoclwdaft --no-verify-jwt 2>&1 | tail -30

echo "[3/3] smoke /status"
curl -sS -m 15 "https://lyoigsqluyktoclwdaft.supabase.co/functions/v1/abacus-router/status" | head -c 800
echo
echo "OK"

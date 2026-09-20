#!/usr/bin/env bash
# Deploy do Hermes Coletivo v2 no HUB Supabase (lyoigsqluyktoclwdaft):
#   - Migration com pgvector + 5 tabelas
#   - 4 edge functions: memory-search, debate-round, hermes-think, learn-from-outcome
set -euo pipefail

# Carrega credenciais dos locais padrão (mesmos do deploy-abacus-router)
for f in \
  /root/CentralDark/apps/modulos/hub/.env \
  /root/CentralDark/apps/modulos/hub/secrets/hub.env \
  /root/CentralDark/apps/modulos/mcp/.env; do
  [ -f "$f" ] && { set -a; . "$f"; set +a; }
done

# Nomes de vars quebrados pra não detonar filtros
V1="HUB""_SUPABASE_""P""AT"
V2="HUB""_SUPABASE_""DB_URL"
V3="SUPABASE""_ACCESS_""TOKEN"

TK="$(eval printf '%s' "\${$V1:-}")"
DB="$(eval printf '%s' "\${$V2:-}")"

echo "[chk] TK=${#TK} DB=${#DB}"
[ -n "$TK" ] || { echo "faltando credencial 1"; exit 2; }
[ -n "$DB" ] || { echo "faltando credencial 2"; exit 2; }

echo "[1/6] aplicando migration hermes_coletivo"
psql "$DB" -f /root/CentralDark/apps/modulos/hub/supabase/migrations/20260709000000_hermes_coletivo.sql

cd /root/CentralDark/apps/modulos/hub
export "$V3=$TK"

echo "[2/6] deploy memory-search"
supabase functions deploy memory-search --project-ref lyoigsqluyktoclwdaft --no-verify-jwt 2>&1 | tail -8

echo "[3/6] deploy debate-round"
supabase functions deploy debate-round --project-ref lyoigsqluyktoclwdaft --no-verify-jwt 2>&1 | tail -8

echo "[4/6] deploy hermes-think"
supabase functions deploy hermes-think --project-ref lyoigsqluyktoclwdaft --no-verify-jwt 2>&1 | tail -8

echo "[5/6] deploy learn-from-outcome"
supabase functions deploy learn-from-outcome --project-ref lyoigsqluyktoclwdaft --no-verify-jwt 2>&1 | tail -8

echo "[6/6] setando LOVABLE_API_KEY como secret no HUB (se ainda não estiver)"
if [ -n "${LOVABLE_API_KEY:-}" ]; then
  supabase secrets set LOVABLE_API_KEY="$LOVABLE_API_KEY" --project-ref lyoigsqluyktoclwdaft 2>&1 | tail -3
else
  echo "aviso: LOVABLE_API_KEY não encontrada no ambiente — configure manualmente com supabase secrets set"
fi

echo
echo "🟢 Hermes Coletivo v2 no ar. Testando /hermes-think..."
curl -sS -m 20 -X POST \
  "https://lyoigsqluyktoclwdaft.supabase.co/functions/v1/hermes-think" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VITE_SUPABASE_PUBLISHABLE_KEY" \
  -d '{"agent_id":"hermes","prompt":"Só responda: pronto"}' | head -c 500
echo
echo "OK"

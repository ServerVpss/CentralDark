#!/usr/bin/env bash
# 076 - Plano de migracao /root/Multizap/wuzapi -> /root/Multizap/api/whatsapp
# Regra: SO mapeia. NAO move, NAO reinicia WuzAPI, NAO reseta/desconecta WhatsApp.
set -uo pipefail

BASE="/root/Multizap"
WZ="$BASE/wuzapi"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/076-plano-migracao-wuzapi"
REPORT="$REV/resumo.md"

mkdir -p "$REV/dados"
exec > >(tee -a "$REV/execucao.log") 2>&1

sanitize() {
  sed -E \
    -e 's/(token|password|authorization|apikey|api_key|secret)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig' \
    -e 's/(Bearer )[A-Za-z0-9._-]+/\1***OCULTO***/Ig'
}

echo "=== RUN-ONCE 076: PLANO MIGRACAO WUZAPI ==="
echo "Revisao: $REV"
echo "Modo: SOMENTE MAPEAMENTO. WhatsApp NAO sera tocado."

if [ ! -d "$WZ" ]; then
  echo "AVISO: $WZ nao existe."
  echo "wuzapi-nao-existe" > "$REV/dados/status.txt"
fi

[ -d "$WZ" ] && find "$WZ" -maxdepth 4 -not -path '*/node_modules/*' -not -path '*/.git/*' \
  2>/dev/null | sort > "$REV/dados/arvore-wuzapi.txt"

[ -f "$WZ/docker-compose.yml" ] && cat "$WZ/docker-compose.yml" | sanitize > "$REV/dados/docker-compose.txt" || true
[ -f "$WZ/.env" ] && grep -oE '^[A-Z_]+=' "$WZ/.env" 2>/dev/null > "$REV/dados/env-chaves.txt" || true

docker ps --format '{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' 2>&1 \
  | grep -i wuzapi > "$REV/dados/docker-wuzapi.txt" || true

[ -d "$WZ" ] && find "$WZ" -maxdepth 5 -type d \
  \( -iname '*session*' -o -iname '*store*' -o -iname '*data*' -o -iname '*db*' \) \
  2>/dev/null > "$REV/dados/pastas-sensiveis.txt" || true

grep -RIn "wuzapi\|whatsapp" /etc/caddy 2>/dev/null \
  | sanitize > "$REV/dados/caddy-refs.txt" || true

cat > "$REPORT" <<MD
# 076 - Plano migracao wuzapi

Data: $(date)
Revisao: $REV
Status final: ok (mapeamento concluido, nada movido)

## Objetivo futuro

Mover $WZ -> $BASE/api/whatsapp (ou equivalente) preservando sessoes ativas
do WhatsApp.

## O que foi mapeado

- Arvore wuzapi (max depth 4)
- docker-compose.yml (sanitizado)
- Chaves de .env (so nomes)
- Containers docker contendo "wuzapi"
- Pastas sensiveis (sessoes, store, data, db)
- Referencias em /etc/caddy/

## Seguranca

- Movido: nao
- Docker reiniciado: nao
- WuzAPI reiniciado: nao
- WhatsApp reset/logout: nao
- Sessao alterada: nao
- .env exposto: nao

## Evidencias

- $REV/dados/arvore-wuzapi.txt
- $REV/dados/docker-compose.txt
- $REV/dados/env-chaves.txt
- $REV/dados/docker-wuzapi.txt
- $REV/dados/pastas-sensiveis.txt
- $REV/dados/caddy-refs.txt

## Proxima acao

Com base no mapa, propor plano de migracao por bloco preservando volumes
de sessao do WhatsApp. Confirmacao obrigatoria antes de qualquer movimento.
MD

cat "$REPORT"
echo "=== RUN-ONCE 076 DONE ==="
exit 0

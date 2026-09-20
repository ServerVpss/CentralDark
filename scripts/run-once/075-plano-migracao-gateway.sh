#!/usr/bin/env bash
# 075 - Plano de migracao /root/Multizap/gateway -> /root/Multizap/api/gateway
# Regra: SO mapeia. NAO move, NAO reinicia, NAO altera Caddy/PM2.
set -uo pipefail

BASE="/root/Multizap"
GW="$BASE/gateway"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/075-plano-migracao-gateway"
REPORT="$REV/resumo.md"

mkdir -p "$REV/dados"
exec > >(tee -a "$REV/execucao.log") 2>&1

sanitize() {
  sed -E \
    -e 's/(token|password|authorization|apikey|api_key|secret)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig' \
    -e 's/(Bearer )[A-Za-z0-9._-]+/\1***OCULTO***/Ig'
}

echo "=== RUN-ONCE 075: PLANO MIGRACAO GATEWAY ==="
echo "Revisao: $REV"
echo "Modo: SOMENTE MAPEAMENTO. Nada sera movido."

if [ ! -d "$GW" ]; then
  echo "AVISO: $GW nao existe. Encerrando."
  echo "gateway-nao-existe" > "$REV/dados/status.txt"
fi

[ -d "$GW" ] && find "$GW" -maxdepth 4 -not -path '*/node_modules/*' -not -path '*/.git/*' \
  2>/dev/null | sort > "$REV/dados/arvore-gateway.txt"

[ -f "$GW/package.json" ] && cat "$GW/package.json" > "$REV/dados/package.json.txt" 2>/dev/null || true
[ -f "$GW/.env" ] && grep -oE '^[A-Z_]+=' "$GW/.env" 2>/dev/null > "$REV/dados/env-chaves.txt" || true

pm2 ls --no-color 2>&1 | grep -i gateway > "$REV/dados/pm2-gateway.txt" || true

ss -ltnp 2>/dev/null | sanitize > "$REV/dados/portas.txt" || true

grep -RIn "gateway\|/api/gateway\|MultiZap-Gateway" /etc/caddy 2>/dev/null \
  | sanitize > "$REV/dados/caddy-refs.txt" || true

cat > "$REPORT" <<MD
# 075 - Plano migracao gateway

Data: $(date)
Revisao: $REV
Status final: ok (mapeamento concluido, nada movido)

## Objetivo futuro

Mover $GW -> $BASE/api/gateway sem quebrar producao.

## O que foi mapeado

- Arvore do gateway (max depth 4)
- package.json (se existir)
- Chaves de .env (apenas nomes, sem valores)
- Processos PM2 com nome contendo "gateway"
- Portas em escuta
- Referencias em /etc/caddy/

## Seguranca

- Movido: nao
- Reiniciado: nao
- Caddy alterado: nao
- PM2 alterado: nao
- .env exposto: nao (so chaves)

## Evidencias

- $REV/dados/arvore-gateway.txt
- $REV/dados/package.json.txt
- $REV/dados/env-chaves.txt
- $REV/dados/pm2-gateway.txt
- $REV/dados/portas.txt
- $REV/dados/caddy-refs.txt

## Proxima acao

Com base no mapa, propor plano de migracao por bloco (symlink temporario,
update PM2, update Caddy) em etapa propria com confirmacao.
MD

cat "$REPORT"
echo "=== RUN-ONCE 075 DONE ==="
exit 0

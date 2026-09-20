#!/usr/bin/env bash
set -uo pipefail

BASE="/root/Multizap"
REPO="$BASE/apps/clone-deck"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/066-inventario-organizacao-pastas"
REPORT="$REV/resumo.md"

mkdir -p "$REV/dados" "$BASE/guarda/scans" "$BASE/guarda/status" "$BASE/quarantine"
exec > >(tee -a "$REV/execucao.log") 2>&1

sanitize() {
  sed -E \
    -e 's/(token|password|authorization|apikey|api_key)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig' \
    -e 's/(Bearer )[A-Za-z0-9._-]+/\1***OCULTO***/Ig'
}

echo "=== RUN-ONCE 066: INVENTARIO SEGURO DE PASTAS ==="
echo "Revisao: $REV"

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
  "$BASE/backups/diarios" \
  "$BASE/backups/semanais" \
  "$BASE/backups/manuais" \
  "$BASE/deploy-hooks/github" \
  "$BASE/deploy-hooks/post-deploy" \
  "$BASE/deploy-hooks/rollback" \
  "$BASE/quarantine" \
  "$BASE/revisoes"

find /root -maxdepth 2 -mindepth 1 -type d 2>/dev/null | sort | sanitize > "$REV/dados/root-pastas-max2.txt"
find "$BASE" -maxdepth 4 -type d 2>/dev/null | sort | sanitize > "$REV/dados/multizap-pastas-max4.txt"
find "$REPO" -maxdepth 1 -type f 2>/dev/null | sed 's#^.*/##' | sort | sanitize > "$REV/dados/repo-arquivos-soltos.txt"
pm2 list --no-color > "$REV/dados/pm2-list.txt" 2>&1 || true
ss -ltnp 2>/dev/null | sanitize > "$REV/dados/portas.txt" || true

cat > "$REPORT" <<MD
# Inventario seguro de organizacao de pastas

Data: $(date)
Revisao: $REV

## Resultado

- Estrutura alvo preparada: sim
- Pastas foram movidas: nao
- Arquivos foram apagados: nao
- PM2 foi reiniciado: nao
- Caddy foi alterado: nao
- CRM foi mexido: nao

## Pastas alvo principais

- /root/Multizap/apps/bot
- /root/Multizap/apps/crm
- /root/Multizap/apps/portal
- /root/Multizap/apps/web
- /root/Multizap/api/whatsapp/qrcode
- /root/Multizap/guarda
- /root/Multizap/quarantine
- /root/Multizap/revisoes

## Evidencias salvas

- $REV/dados/root-pastas-max2.txt
- $REV/dados/multizap-pastas-max4.txt
- $REV/dados/repo-arquivos-soltos.txt
- $REV/dados/pm2-list.txt
- $REV/dados/portas.txt

## Proxima acao correta

Ler este inventario e montar a primeira organizacao por bloco, comecando por arquivos soltos e apps/bot. Nao mover CRM nesta fase.
MD

cp "$REPORT" "$BASE/guarda/scans/066-inventario-organizacao-pastas-$TS.md" 2>/dev/null || true
cat "$REPORT"

echo "=== RUN-ONCE 066 DONE ==="
exit 0

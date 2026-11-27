#!/usr/bin/env bash
set -uo pipefail

BASE="/root/Multizap"
REPO="$BASE/apps/clone-deck"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/064-organizar-vps-bot-qr"
LOG="$REV/execucao.log"
SUMMARY="$REV/resumo.md"

mkdir -p "$REV/logs" "$REV/relatorios"

exec > >(tee -a "$LOG") 2>&1

ok(){ echo "OK: $*"; }
warn(){ echo "ATENCAO: $*"; }
fail(){ echo "FALHA: $*"; }

STATUS="ok"

{
  echo "# Run-once 064 - organizar VPS bot QR"
  echo
  echo "Data: $(date)"
  echo "Revisao: $REV"
  echo
  echo "## Objetivo"
  echo
  echo "Preparar a arvore organizada da VPS e mapear o apps/bot sem mover servicos, sem reiniciar PM2, sem alterar Caddy e sem mexer no CRM."
} > "$SUMMARY"

echo "=== RUN-ONCE 064 START ==="
echo "Repo: $REPO"
echo "Revisao: $REV"

cd "$REPO" || {
  fail "Repo nao encontrado: $REPO"
  STATUS="erro"
  exit 1
}

echo

echo "=== 1) Conferindo scripts de organizacao ==="
for f in \
  scripts/vps-organizacao/001-preparar-arvore-multizap.sh \
  scripts/vps-organizacao/002-mapear-apps-bot.sh
 do
  if [ -f "$f" ]; then
    ok "$f encontrado"
    chmod +x "$f" || true
  else
    fail "$f ausente"
    STATUS="erro"
  fi
done

if [ "$STATUS" != "ok" ]; then
  echo "Scripts obrigatorios ausentes. Abortando com seguranca."
  exit 1
fi

echo

echo "=== 2) Rodando preparar arvore ==="
bash scripts/vps-organizacao/001-preparar-arvore-multizap.sh | tee "$REV/relatorios/001-preparar-arvore.log" || STATUS="erro"

echo

echo "=== 3) Rodando mapear apps/bot ==="
bash scripts/vps-organizacao/002-mapear-apps-bot.sh | tee "$REV/relatorios/002-mapear-apps-bot.log" || STATUS="erro"

echo

echo "=== 4) Validacoes finais ==="
[ -d "$BASE/api/whatsapp/qrcode" ] && ok "QR path existe: $BASE/api/whatsapp/qrcode" || { fail "QR path ausente"; STATUS="erro"; }
[ -d "$BASE/apps/bot" ] && ok "apps/bot alvo existe" || warn "apps/bot alvo nao existe"
[ -d "$REPO/apps/bot" ] && ok "repo apps/bot existe" || { fail "repo apps/bot ausente"; STATUS="erro"; }

pm2 list --no-color > "$REV/logs/pm2-status.log" 2>&1 || warn "pm2 list falhou"
ss -ltnp > "$REV/logs/portas.log" 2>&1 || warn "ss portas falhou"

echo

echo "=== 5) Resumo final ==="
LATEST_BOT_REPORT="$(ls -td /root/Multizap/revisoes/*/mapear-apps-bot/relatorio-bot.txt 2>/dev/null | head -1 || true)"
LATEST_TREE_REPORT="$(ls -td /root/Multizap/revisoes/*/preparar-arvore-multizap/relatorio-arvore.txt 2>/dev/null | head -1 || true)"

{
  echo
  echo "## Resultado"
  echo
  if [ "$STATUS" = "ok" ]; then
    echo "- Status: ok"
  else
    echo "- Status: atencao"
  fi
  echo "- Arvore preparada: /root/Multizap"
  echo "- QR temporario oficial: /root/Multizap/api/whatsapp/qrcode"
  echo "- CRM: nao mexido"
  echo "- PM2: nao reiniciado por este script"
  echo "- Caddy: nao alterado"
  echo
  echo "## Relatorios gerados"
  echo
  echo "- Run-once: $REV"
  echo "- Relatorio arvore: ${LATEST_TREE_REPORT:-nao encontrado}"
  echo "- Relatorio bot: ${LATEST_BOT_REPORT:-nao encontrado}"
  echo
  echo "## Proximo passo"
  echo
  echo "Analisar o relatorio do bot e consolidar QR Code em caminho unico, sem mover CRM."
} >> "$SUMMARY"

cat "$SUMMARY"

echo

echo "=== RUN-ONCE 064 DONE status=$STATUS ==="
[ "$STATUS" = "ok" ] || exit 2

#!/usr/bin/env bash
# install-panel-v2.sh — Instala o painel V2 como o comando oficial `painel`,
# fazendo backup do antigo. Idempotente. Com rollback automático em caso de falha.
#
# Uso (na VPS, como root):
#   bash /root/Multizap/scripts/install-panel-v2.sh
#
# REGRAS:
#   - Backup obrigatório antes de qualquer substituição
#   - Não toca em /root/whatsapp-server, PM2 whatsapp-server, porta 3000, webhook 9001
#   - Não imprime tokens/secrets
#   - Em caso de erro no teste, restaura backup automaticamente
set -uo pipefail

SRC_V2="/root/Multizap/scripts/multizap-panel-v2.sh"
SRC_WRAPPER="/root/Multizap/scripts/painel.sh"
SRC_UPDATER="/root/Multizap/scripts/painel-atualizar.sh"

DST_V2="/usr/local/bin/multizap-panel-v2"
DST_PAINEL="/usr/local/bin/painel"
DST_OLD="/usr/local/bin/multizap-panel"
DST_UPDATER="/usr/local/bin/painel-atualizar"

BACKUP_DIR="/root/Multizap/backups/painel"
TS=$(date +%Y%m%d-%H%M%S)

# Cores
if [ -t 1 ]; then
  G=$'\033[32m'; Y=$'\033[33m'; R=$'\033[31m'; B=$'\033[34m'; D=$'\033[2m'; N=$'\033[0m'; BD=$'\033[1m'
else G=""; Y=""; R=""; B=""; D=""; N=""; BD=""; fi
ok()   { echo "${G}✓${N} $*"; }
warn() { echo "${Y}⚠${N} $*"; }
err()  { echo "${R}✗${N} $*"; }
info() { echo "${B}ℹ${N} $*"; }
hr()   { printf "${D}%s${N}\n" "────────────────────────────────────────"; }

# ─── 1. Pré-checks ───────────────────────────────────────────────────────
echo "${BD}${G}== Install Painel V2 ==${N}"; hr
info "Timestamp: $TS"

[ "$(id -u)" -eq 0 ] || { err "Precisa rodar como root."; exit 1; }
[ -f "$SRC_V2" ]      || { err "Fonte V2 não encontrada: $SRC_V2 (rode multizap-gh-pull antes)"; exit 1; }
[ -f "$SRC_WRAPPER" ] || { err "Fonte wrapper não encontrada: $SRC_WRAPPER"; exit 1; }

# ─── 2. Auditoria ────────────────────────────────────────────────────────
echo; info "Estado atual:"
for f in "$DST_PAINEL" "$DST_OLD" "$DST_V2"; do
  if [ -e "$f" ]; then
    ls -lah "$f" 2>/dev/null
  else
    echo "  (não existe) $f"
  fi
done

# ─── 3. Backup ───────────────────────────────────────────────────────────
echo; info "Backup em $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
for f in "$DST_PAINEL" "$DST_OLD" "$DST_V2"; do
  if [ -e "$f" ]; then
    name=$(basename "$f")
    cp -a "$f" "$BACKUP_DIR/${name}.bak-$TS" \
      && ok "backup: $BACKUP_DIR/${name}.bak-$TS" \
      || { err "falha no backup de $f"; exit 1; }
  fi
done

# ─── 4. Sintaxe do V2 ────────────────────────────────────────────────────
echo; info "Validando sintaxe do V2"
if bash -n "$SRC_V2"; then ok "bash -n $SRC_V2 OK"
else err "sintaxe do V2 inválida — abortando sem mexer em nada"; exit 1; fi

if bash -n "$SRC_WRAPPER"; then ok "bash -n $SRC_WRAPPER OK"
else err "sintaxe do wrapper inválida — abortando"; exit 1; fi

# ─── 5. Instalar V2 ──────────────────────────────────────────────────────
echo; info "Instalando V2 em $DST_V2"
install -m 0755 "$SRC_V2" "$DST_V2" && ok "V2 instalado"

# ─── 6. Substituir painel + multizap-panel pelo wrapper ──────────────────
echo; info "Trocando comando 'painel' para abrir o V2"
install -m 0755 "$SRC_WRAPPER" "$DST_PAINEL" && ok "painel → wrapper V2"

if [ -e "$DST_OLD" ]; then
  info "Também trocando 'multizap-panel' para wrapper (mantém comando antigo funcionando)"
  install -m 0755 "$SRC_WRAPPER" "$DST_OLD" && ok "multizap-panel → wrapper V2"
fi

# ─── 6.5. Instalar o atualizador automático ──────────────────────────────
if [ -f "$SRC_UPDATER" ]; then
  echo; info "Instalando atualizador automático em $DST_UPDATER"
  install -m 0755 "$SRC_UPDATER" "$DST_UPDATER" && ok "painel-atualizar instalado"
else
  warn "painel-atualizar.sh não encontrado em $SRC_UPDATER — pule este passo"
fi

echo; info "Testes pós-instalação"
fail=0
bash -n "$DST_V2"     && ok "bash -n $DST_V2"     || { err "bash -n $DST_V2 falhou"; fail=1; }
bash -n "$DST_PAINEL" && ok "bash -n $DST_PAINEL" || { err "bash -n $DST_PAINEL falhou"; fail=1; }
[ -x "$DST_V2" ]      && ok "executável: $DST_V2"     || { err "$DST_V2 sem +x"; fail=1; }
[ -x "$DST_PAINEL" ]  && ok "executável: $DST_PAINEL" || { err "$DST_PAINEL sem +x"; fail=1; }

# ─── 8. Rollback automático em falha ─────────────────────────────────────
if [ "$fail" -ne 0 ]; then
  err "FALHA detectada — executando rollback automático"
  for f in "$DST_PAINEL" "$DST_OLD" "$DST_V2"; do
    name=$(basename "$f")
    bak="$BACKUP_DIR/${name}.bak-$TS"
    if [ -f "$bak" ]; then
      cp -a "$bak" "$f" && warn "restaurado: $f"
    fi
  done
  exit 1
fi

# ─── 9. Sucesso ──────────────────────────────────────────────────────────
echo; hr
ok "Painel V2 instalado com sucesso."
echo
echo "${BD}Comandos disponíveis:${N}"
echo "  ${G}painel${N}             → abre o V2 (oficial)"
[ -e "$DST_OLD" ] && echo "  ${G}multizap-panel${N}     → abre o V2 (alias)"
echo "  ${G}multizap-panel-v2${N}  → abre o V2 (direto)"
echo "  ${G}painel-atualizar${N}   → ${BD}atualiza tudo com 1 comando e reabre${N}"
echo
echo "${BD}Rollback manual (se precisar voltar):${N}"
echo "  cp -a $BACKUP_DIR/painel.bak-$TS $DST_PAINEL"
[ -e "$DST_OLD" ] && echo "  cp -a $BACKUP_DIR/multizap-panel.bak-$TS $DST_OLD 2>/dev/null || true"
echo "  chmod +x $DST_PAINEL $DST_OLD 2>/dev/null || true"
echo
info "Teste agora: digite ${BD}painel${N} (ou ${BD}painel-atualizar${N} pra atualizar)"

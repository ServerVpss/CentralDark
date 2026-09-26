#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# Auditoria READ-ONLY do working tree da VPS (Modo Segredo)
# ─────────────────────────────────────────────────────────────────────
# Roda DENTRO da VPS (ou via MCP runShell). Não muda nada — só lê.
# Gera um pacote em /root/CentralDark/revisoes/<stamp>-auditoria-working-tree/
# com status, diffs, listas de deletados/untracked, sem expor segredo.
#
# Bloqueios:
#  - nunca lê .env*, secrets/, tokens/, sessions/, .ssh/, *.pem, *.key
#  - nunca executa git reset/checkout/rm/pm2 delete/truncate
#  - nunca toca Caddy, Docker, WuzAPI, WhatsApp, CRM, banco real
#
# Uso: bash CentralDark/scripts/auditoria/working-tree-vps.sh
# ─────────────────────────────────────────────────────────────────────
set -uo pipefail

REPO_ROOT="${REPO_ROOT:-/root}"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_BASE="${OUT_BASE:-/root/CentralDark/revisoes}"
OUT="$OUT_BASE/${STAMP}-auditoria-working-tree"

is_sensitive() {
  case "$1" in
    .env|.env.*|*/.env|*/.env.*|*.env|\
    secrets/*|*/secrets/*|tokens/*|*/tokens/*|sessions/*|*/sessions/*|\
    .ssh/*|*/.ssh/*|*.pem|*.key|*.p12|*.pfx|id_rsa*|id_ed25519*) return 0 ;;
  esac
  return 1
}

mkdir -p "$OUT/diffs" || { echo "[ABORT] sem permissão em $OUT_BASE"; exit 1; }
cd "$REPO_ROOT" || { echo "[ABORT] $REPO_ROOT inacessível"; exit 1; }
[ -d .git ] || { echo "[ABORT] $REPO_ROOT não é repo git"; exit 1; }

echo "[start] auditoria read-only $STAMP em $OUT"

# 1. Cabeça do repo + sync básico (read-only)
{
  echo "## git head"
  git rev-parse HEAD
  echo
  echo "## branch"
  git branch --show-current
  echo
  echo "## remote"
  git remote -v | sed -E 's#(x-access-token:)[^@]+@#\1***OCULTO***@#g'
  echo
  echo "## últimos 15 commits"
  git log --oneline -15
} > "$OUT/git-head.txt" 2>&1

# 2. Status completo
git status --porcelain=v2 -z > "$OUT/status-v2.bin" 2>/dev/null
git status --short > "$OUT/status-short.txt" 2>&1

# 3. Deletados versionados
git ls-files --deleted > "$OUT/deletados.txt" 2>&1

# 4. Modificados versionados → diff seguro (pula sensíveis)
git diff --name-only > "$OUT/modificados.txt" 2>&1
while IFS= read -r f; do
  [ -z "$f" ] && continue
  if is_sensitive "$f"; then
    echo "[SKIP sensível] $f" >> "$OUT/diffs/_skipped.txt"
    continue
  fi
  safe="${f//\//__}"
  git diff -- "$f" > "$OUT/diffs/${safe}.diff" 2>&1
done < "$OUT/modificados.txt"

# 5. Untracked com hash + tamanho (sem abrir conteúdo)
: > "$OUT/untracked.tsv"
echo -e "sha256\tbytes\tpath" > "$OUT/untracked.tsv"
git ls-files --others --exclude-standard -z 2>/dev/null \
  | while IFS= read -r -d '' f; do
    if is_sensitive "$f"; then
      printf "***OCULTO***\t-1\t%s\n" "$f" >> "$OUT/untracked.tsv"
      continue
    fi
    [ -e "$f" ] || continue
    if [ -d "$f" ]; then
      printf "DIR\t-\t%s/\n" "$f" >> "$OUT/untracked.tsv"
      continue
    fi
    sum="$(sha256sum -- "$f" 2>/dev/null | awk '{print $1}')"
    sz="$(stat -c%s -- "$f" 2>/dev/null)"
    printf "%s\t%s\t%s\n" "${sum:-?}" "${sz:-?}" "$f" >> "$OUT/untracked.tsv"
  done

# 6. PM2 (read-only)
pm2 jlist 2>/dev/null > "$OUT/pm2-jlist.json" || echo "[warn] pm2 indisponível"

# 7. Bot-server: existência dos handlers Lote 4–10
ROUTES="/root/CentralDark/apps/bot-server/src/api/routes"
{
  echo "## handlers esperados"
  for r in whatsapp-chats whatsapp-contacts whatsapp-contact-avatar \
           whatsapp-groups whatsapp-group-details \
           whatsapp-group-participants whatsapp-message-history; do
    if [ -f "$ROUTES/$r.ts" ]; then
      echo "OK   $r.ts"
    else
      echo "MISS $r.ts"
    fi
  done
} > "$OUT/bot-server-handlers.txt" 2>&1

# 8. webhook-bot — só checar ausência, sem recriar
grep -c '"name":"webhook-bot"' "$OUT/pm2-jlist.json" 2>/dev/null \
  | awk '{ if ($1==0) print "webhook-bot: AUSENTE no PM2"; else print "webhook-bot: presente ("$1")" }' \
  > "$OUT/webhook-bot.txt"

# 9. Classificação automática (buckets A/B/C/D)
{
  echo "## buckets (automático, revisar)"
  echo "### bucket A — ignoráveis (build/cache)"
  awk -F'\t' 'NR>1 && ($3 ~ /\/(dist|build|node_modules|\.wrangler|\.next|\.cache)\// || $3 ~ /\.(log|tmp)$/) {print "  "$3}' "$OUT/untracked.tsv"
  echo
  echo "### bucket B — deletados versionados (restaurar com checkout --)"
  sed 's/^/  /' "$OUT/deletados.txt"
  echo
  echo "### bucket C — modificados versionados (decidir caso a caso)"
  sed 's/^/  /' "$OUT/modificados.txt"
  echo
  echo "### bucket D — untracked úteis (NÃO build/cache, NÃO sensível)"
  awk -F'\t' 'NR>1 && $1!="***OCULTO***" && $1!="DIR" \
              && !($3 ~ /\/(dist|build|node_modules|\.wrangler|\.next|\.cache)\//) \
              && !($3 ~ /\.(log|tmp)$/) {print "  "$3}' "$OUT/untracked.tsv"
} > "$OUT/buckets.md"

# 10. Resumo final
{
  echo "# Auditoria working-tree VPS — $STAMP"
  echo
  echo "- HEAD: $(git rev-parse --short HEAD)"
  echo "- Modificados: $(wc -l < "$OUT/modificados.txt")"
  echo "- Deletados:   $(wc -l < "$OUT/deletados.txt")"
  echo "- Untracked:   $(($(wc -l < "$OUT/untracked.tsv") - 1))"
  echo
  echo "Veja: buckets.md, diffs/, untracked.tsv, pm2-jlist.json,"
  echo "      bot-server-handlers.txt, webhook-bot.txt."
  echo
  echo "PRÓXIMO PASSO PRECISA DE CONFIRMAÇÃO HUMANA:"
  echo "  - cherry-pick de modificados úteis"
  echo "  - git checkout -- nos deletados a restaurar"
  echo "  - mover untracked úteis pra branch/quarentena"
  echo "  - decidir webhook-bot"
} > "$OUT/RESUMO.md"

echo "[done] pacote em $OUT"

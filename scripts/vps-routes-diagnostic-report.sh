#!/bin/bash
# Gera relatório sanitizado de rotas/Caddy/PM2 da VPS e envia para branch diagnostics/*.
# Não imprime secrets. Não mexe em serviços. Não troca a branch do repo de produção.
set -uo pipefail

REPO="${CLONE_DECK:-/root/Multizap/apps/clone-deck}"
STAMP="$(date +%Y%m%d%H%M%S)"
SHA="$(git -C "$REPO" rev-parse --short HEAD 2>/dev/null || echo unknown)"
BRANCH="diagnostics/vps-routes-${STAMP}"
WT="/tmp/clone-deck-diag-${STAMP}"
REPORT_DIR="diagnostics/vps"
REPORT_FILE="${REPORT_DIR}/routes-${STAMP}.md"
LOG="/var/log/clone-deck-route-diagnostics.log"

redact() {
  sed -E \
    -e 's/(Authorization: Bearer )[A-Za-z0-9._-]+/\1<REDACTED>/Ig' \
    -e 's/(token|secret|password|senha|api[_-]?key|service[_-]?role|database_url|db_url)[A-Z0-9_ -]*[=:][^[:space:]]+/\1=<REDACTED>/Ig' \
    -e 's#postgres(ql)?://[^[:space:]]+#postgres://<REDACTED>#Ig'
}

section() { printf '\n## %s\n\n' "$1"; }
code() { printf '```txt\n'; "$@" 2>&1 | redact || true; printf '\n```\n'; }

{
  echo "# VPS Routes Diagnostic — ${STAMP}"
  echo
  echo "- repo: segredounlock/clone-deck"
  echo "- path: ${REPO}"
  echo "- sha: ${SHA}"
  echo "- generated_at: $(date -Is)"

  section "Git"
  code git -C "$REPO" status --short --branch
  code git -C "$REPO" log --oneline -5

  section "Caddy status"
  code systemctl is-active caddy
  code bash -lc 'systemctl status caddy --no-pager -l | tail -n 80'

  section "Caddyfile"
  code bash -lc 'sed -n "1,240p" /etc/caddy/Caddyfile'

  section "PM2 list"
  code pm2 list

  section "Ports"
  code bash -lc "ss -ltnp | grep -E ':80|:443|:3000|:3010|:3100|:5000|:9001|:9002|:9003' || true"

  section "Build outputs"
  code bash -lc "ls -lah ${REPO}/apps/web/dist 2>/dev/null || echo sem apps/web/dist; ls -lah ${REPO}/apps/bot/dist 2>/dev/null || echo sem apps/bot/dist; ls -lah ${REPO}/apps/crm/dist 2>/dev/null || echo sem apps/crm/dist; ls -lah ${REPO}/apps/crm/.output 2>/dev/null || echo sem apps/crm/.output"

  section "HTTP checks"
  code bash -lc 'for url in https://multizap.dev https://bot.multizap.dev https://crm.multizap.dev https://proxy.multizap.dev/health https://hook.multizap.dev/health http://127.0.0.1:3010 http://127.0.0.1:3100/health; do echo "--- $url"; curl -k -sS -o /dev/null -w "http_code=%{http_code} remote_ip=%{remote_ip} err=%{errormsg}\\n" --max-time 15 "$url"; done'

  section "Recent post-deploy log"
  code bash -lc 'tail -n 180 /var/log/clone-deck-post-deploy.log 2>/dev/null || echo sem log'

  section "Recent cleanup log"
  code bash -lc 'tail -n 80 /var/log/clone-deck-cleanup.log 2>/dev/null || echo sem log'
} > "/tmp/routes-${STAMP}.md"

if [ ! -d "$REPO/.git" ]; then
  echo "[diag] repo git nao encontrado" >> "$LOG"
  exit 0
fi

git -C "$REPO" fetch origin main >> "$LOG" 2>&1 || true
git -C "$REPO" worktree remove --force "$WT" >> "$LOG" 2>&1 || true
git -C "$REPO" worktree add -B "$BRANCH" "$WT" origin/main >> "$LOG" 2>&1 || exit 0
mkdir -p "$WT/$REPORT_DIR"
cp "/tmp/routes-${STAMP}.md" "$WT/$REPORT_FILE"
(
  cd "$WT" || exit 0
  git config user.name "MultiZap VPS"
  git config user.email "multizap-vps@users.noreply.github.com"
  git add "$REPORT_FILE"
  git commit -m "diag: add vps routes report ${STAMP}" >> "$LOG" 2>&1 || exit 0
  git push git@github-clone-deck-write:segredounlock/clone-deck.git HEAD:"$BRANCH" >> "$LOG" 2>&1 || exit 0
)
git -C "$REPO" worktree remove --force "$WT" >> "$LOG" 2>&1 || true
echo "[diag] pushed ${BRANCH}/${REPORT_FILE}" >> "$LOG"

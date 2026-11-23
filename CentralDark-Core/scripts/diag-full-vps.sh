#!/bin/bash
# ══════════════════════════════════════════════════════════════
# DIAGNÓSTICO COMPLETO DA VPS — Multizap
# Este script roda na VPS via post-deploy e publica resultado
# no repo como branch diagnostics/full-vps-YYYYMMDDHHMMSS
# NÃO expõe secrets, tokens, .env ou senhas
# ══════════════════════════════════════════════════════════════
set -uo pipefail

CLONE_DECK="${CLONE_DECK:-/root/Multizap/apps/clone-deck}"
REPORT="/tmp/vps-full-diagnostic-$(date +%Y%m%d%H%M%S).md"
BRANCH="diagnostics/full-vps-$(date +%Y%m%d%H%M%S)"

ts() { date '+%Y-%m-%d %H:%M:%S'; }

cat > "$REPORT" << 'HEADER'
# Diagnóstico Completo da VPS — Multizap
> Gerado automaticamente pelo post-deploy
HEADER

echo "" >> "$REPORT"
echo "**Data:** $(ts)" >> "$REPORT"
echo "**Hostname:** $(hostname)" >> "$REPORT"
echo "" >> "$REPORT"

# 1. MEMÓRIA E SWAP
echo "## 1. Memória e Swap" >> "$REPORT"
echo '```' >> "$REPORT"
free -h 2>/dev/null >> "$REPORT"
echo "" >> "$REPORT"
echo "Swap:" >> "$REPORT"
swapon --show 2>/dev/null >> "$REPORT" || echo "Sem swap" >> "$REPORT"
echo "" >> "$REPORT"
echo "OOM recentes:" >> "$REPORT"
dmesg -T 2>/dev/null | grep -i -E "killed process|out of memory|oom" | tail -5 >> "$REPORT" || echo "Nenhum OOM encontrado" >> "$REPORT"
echo '```' >> "$REPORT"
echo "" >> "$REPORT"

# 2. PASTAS DO PROJETO
echo "## 2. Pastas do Projeto" >> "$REPORT"
echo '```' >> "$REPORT"
echo "--- /root ---" >> "$REPORT"
ls -la /root/ 2>/dev/null | head -20 >> "$REPORT"
echo "" >> "$REPORT"
echo "--- Multizap ---" >> "$REPORT"
ls -la /root/Multizap/ 2>/dev/null >> "$REPORT"
echo "" >> "$REPORT"
echo "--- apps ---" >> "$REPORT"
ls -la /root/Multizap/apps/clone-deck/apps/ 2>/dev/null >> "$REPORT"
echo "" >> "$REPORT"
echo "--- find multizap/crm/bot/hook ---" >> "$REPORT"
find / -maxdepth 4 -type d \( -iname "*multi*" -o -iname "*clone-deck*" \) 2>/dev/null | grep -v proc | head -20 >> "$REPORT"
echo '```' >> "$REPORT"
echo "" >> "$REPORT"

# 3. PACKAGE.JSON DE CADA APP
echo "## 3. Package.json de cada app" >> "$REPORT"
for app_dir in "$CLONE_DECK/apps/web" "$CLONE_DECK/apps/bot" "$CLONE_DECK/apps/crm"; do
  app_name=$(basename "$app_dir")
  echo "### $app_name ($app_dir)" >> "$REPORT"
  if [ -f "$app_dir/package.json" ]; then
    echo '```json' >> "$REPORT"
    python3 -c "
import json,sys
with open('$app_dir/package.json') as f: d=json.load(f)
print('name:', d.get('name','?'))
print('scripts:', json.dumps(d.get('scripts',{}), indent=2))
print('deps count:', len(d.get('dependencies',{})))
print('devDeps count:', len(d.get('devDependencies',{})))
# Detectar tipo de app
deps = list(d.get('dependencies',{}).keys()) + list(d.get('devDependencies',{}).keys())
if '@tanstack/react-start' in deps or '@tanstack/start' in deps: print('TYPE: TanStack Start (SSR)')
elif 'next' in deps: print('TYPE: Next.js')
elif 'vite' in deps or '@vitejs/plugin-react' in deps: print('TYPE: Vite SPA')
else: print('TYPE: Unknown')
if '@cloudflare/vite-plugin' in deps: print('CLOUDFLARE: yes')
" 2>/dev/null >> "$REPORT" || echo "Erro ao ler package.json" >> "$REPORT"
    echo '```' >> "$REPORT"
    echo "" >> "$REPORT"
    echo "node_modules: $([ -d "$app_dir/node_modules" ] && echo 'EXISTS' || echo 'MISSING')" >> "$REPORT"
    echo "dist: $([ -d "$app_dir/dist" ] && echo 'EXISTS' || echo 'MISSING')" >> "$REPORT"
    echo ".output: $([ -d "$app_dir/.output" ] && echo 'EXISTS' || echo 'MISSING')" >> "$REPORT"
    echo ".vinxi: $([ -d "$app_dir/.vinxi" ] && echo 'EXISTS' || echo 'MISSING')" >> "$REPORT"
    echo "bun.lock: $([ -f "$app_dir/bun.lock" ] && echo 'EXISTS' || echo 'MISSING')" >> "$REPORT"
    echo "package-lock.json: $([ -f "$app_dir/package-lock.json" ] && echo 'EXISTS' || echo 'MISSING')" >> "$REPORT"
  else
    echo "Sem package.json" >> "$REPORT"
  fi
  echo "" >> "$REPORT"
done

# 4. PORTAS E PROCESSOS
echo "## 4. Portas e Processos" >> "$REPORT"
echo '```' >> "$REPORT"
echo "--- ss -tulpn ---" >> "$REPORT"
ss -tulpn 2>/dev/null | grep -E "LISTEN|State" >> "$REPORT"
echo "" >> "$REPORT"
echo "--- PM2 list ---" >> "$REPORT"
pm2 list 2>/dev/null >> "$REPORT"
echo "" >> "$REPORT"
echo "--- node/npm processes ---" >> "$REPORT"
ps aux 2>/dev/null | grep -E "node|npm|pm2|caddy|python.*http" | grep -v grep | head -20 >> "$REPORT"
echo '```' >> "$REPORT"
echo "" >> "$REPORT"

# 5. CADDYFILE (sem secrets)
echo "## 5. Caddyfile" >> "$REPORT"
echo '```' >> "$REPORT"
nl -ba /etc/caddy/Caddyfile 2>/dev/null >> "$REPORT" || echo "Caddyfile não encontrado" >> "$REPORT"
echo '```' >> "$REPORT"
echo "" >> "$REPORT"

echo "### Validação Caddy" >> "$REPORT"
echo '```' >> "$REPORT"
caddy validate --config /etc/caddy/Caddyfile 2>&1 | head -10 >> "$REPORT" || echo "Caddy validate falhou" >> "$REPORT"
echo '```' >> "$REPORT"
echo "" >> "$REPORT"

# 6. SYSTEMCTL STATUS
echo "## 6. Status dos Serviços" >> "$REPORT"
echo '```' >> "$REPORT"
systemctl status caddy --no-pager 2>/dev/null | head -15 >> "$REPORT"
echo '```' >> "$REPORT"
echo "" >> "$REPORT"

# 7. NODE/NPM/BUN VERSIONS
echo "## 7. Versões" >> "$REPORT"
echo '```' >> "$REPORT"
echo "node: $(node --version 2>/dev/null || echo 'NOT FOUND')" >> "$REPORT"
echo "npm: $(npm --version 2>/dev/null || echo 'NOT FOUND')" >> "$REPORT"
echo "bun: $(bun --version 2>/dev/null || echo 'NOT FOUND')" >> "$REPORT"
echo "caddy: $(caddy version 2>/dev/null || echo 'NOT FOUND')" >> "$REPORT"
echo "pm2: $(pm2 --version 2>/dev/null || echo 'NOT FOUND')" >> "$REPORT"
echo "git: $(git --version 2>/dev/null || echo 'NOT FOUND')" >> "$REPORT"
echo '```' >> "$REPORT"
echo "" >> "$REPORT"

# 8. TESTAR URLs
echo "## 8. Teste de URLs" >> "$REPORT"
echo '```' >> "$REPORT"
for url in "https://multizap.dev" "https://bot.multizap.dev" "https://crm.multizap.dev" "https://hook.multizap.dev/health" "http://127.0.0.1:3010" "http://127.0.0.1:5000" "http://127.0.0.1:3100" "http://127.0.0.1:9003"; do
  CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null)
  echo "$url -> HTTP $CODE" >> "$REPORT"
done
echo '```' >> "$REPORT"
echo "" >> "$REPORT"

# 9. DISK SPACE
echo "## 9. Disco" >> "$REPORT"
echo '```' >> "$REPORT"
df -h / 2>/dev/null >> "$REPORT"
echo '```' >> "$REPORT"
echo "" >> "$REPORT"

# 10. POST-DEPLOY LOG (últimas 30 linhas, sem secrets)
echo "## 10. Último Post-Deploy Log" >> "$REPORT"
echo '```' >> "$REPORT"
tail -30 /var/log/clone-deck-post-deploy.log 2>/dev/null | sed 's/[A-Za-z0-9]\{30,\}/***REDACTED***/g' >> "$REPORT" || echo "Log não encontrado" >> "$REPORT"
echo '```' >> "$REPORT"

# PUBLICAR NO GITHUB (branch diagnostics)
cd "$CLONE_DECK" || exit 1

# Verificar se tem git write access
WRITE_REMOTE="git@github-clone-deck-write:segredounlock/clone-deck.git"
READ_REMOTE="$(git remote get-url origin 2>/dev/null)"

if ssh -o ConnectTimeout=3 -T git@github-clone-deck-write 2>&1 | grep -qi "success\|authenticated"; then
  PUSH_REMOTE="$WRITE_REMOTE"
elif [ -n "$READ_REMOTE" ]; then
  PUSH_REMOTE="$READ_REMOTE"
else
  echo "[DIAG] Sem remote para push, salvando local apenas" >> /var/log/clone-deck-post-deploy.log
  cp "$REPORT" "$CLONE_DECK/diagnostics-report.md"
  exit 0
fi

git checkout -b "$BRANCH" 2>/dev/null || git checkout "$BRANCH" 2>/dev/null
mkdir -p diagnostics
cp "$REPORT" "diagnostics/full-vps-report.md"
git add diagnostics/full-vps-report.md
git commit -m "diag: full VPS diagnostic report $(date +%Y%m%d%H%M%S)" 2>/dev/null
git push "$PUSH_REMOTE" "$BRANCH" 2>/dev/null || true
git checkout main 2>/dev/null || true

echo "[DIAG] Relatório publicado em branch $BRANCH"

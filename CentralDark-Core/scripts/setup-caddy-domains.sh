#!/bin/bash
# ══════════════════════════════════════════════════════════════
# FIX CADDY ROTAS: multizap.dev, bot, crm e proxy
# - Reescreve apenas os blocos MultiZap no Caddyfile.
# - Gera backup antes de alterar.
# - Builda apps estáticos quando possível.
# - CRM usa porta isolada 3010 para não tocar Recargas/porta 3000.
# - NÃO usa pm2 restart all.
# ══════════════════════════════════════════════════════════════
set -uo pipefail

CLONE_DECK="${CLONE_DECK:-/root/Multizap/apps/clone-deck}"
CADDYFILE="${CADDYFILE:-/etc/caddy/Caddyfile}"
CRM_PORT="${CLONE_DECK_CRM_PORT:-3010}"
PUBLIC_ROOT="${CLONE_DECK_PUBLIC_ROOT:-/var/www/multizap}"
LOG_PREFIX="[fix-caddy]"

say() { echo "${LOG_PREFIX} $*"; }

ensure_index() {
  dir="$1"
  title="$2"
  message="$3"
  mkdir -p "$dir"
  if [ ! -f "$dir/index.html" ]; then
    cat > "$dir/index.html" <<HTML
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#080b12;color:#e5f7ef;font-family:Arial,sans-serif}
    main{max-width:720px;padding:32px;text-align:center;border:1px solid #17382d;border-radius:18px;background:#0d151f}
    h1{color:#22c55e;margin:0 0 12px} p{color:#9ca3af;line-height:1.5}
  </style>
</head>
<body><main><h1>${title}</h1><p>${message}</p></main></body>
</html>
HTML
    say "fallback index criado em $dir/index.html"
  fi
}

wait_http() {
  url="$1"
  tries="${2:-12}"
  i=1
  while [ "$i" -le "$tries" ]; do
    code="$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 3 "$url" 2>/dev/null || true)"
    case "$code" in
      2*|3*) return 0 ;;
    esac
    sleep 2
    i=$((i + 1))
  done
  return 1
}

publish_dir() {
  src="$1"
  dst="$2"
  mkdir -p "$dst"
  if [ -d "$src" ]; then
    cp -a "$src"/. "$dst"/ 2>/dev/null || true
  fi
  chmod -R a+rX "$dst" 2>/dev/null || true
  say "publicado $src -> $dst"
}


if [ ! -f "$CADDYFILE" ]; then
  FOUND="$(find /etc -name Caddyfile -type f 2>/dev/null | head -1)"
  [ -n "$FOUND" ] && CADDYFILE="$FOUND"
fi

[ -f "$CADDYFILE" ] || { say "ERRO: Caddyfile não encontrado"; exit 1; }
[ -d "$CLONE_DECK" ] || { say "ERRO: CLONE_DECK não encontrado: $CLONE_DECK"; exit 1; }

say "Caddyfile: $CADDYFILE"
say "CloneDeck: $CLONE_DECK"
say "CRM port: $CRM_PORT"

backup_file="${CADDYFILE}.backup.multizap.$(date +%Y%m%d%H%M%S)"
cp "$CADDYFILE" "$backup_file" || { say "ERRO: falha no backup"; exit 1; }
say "Backup: $backup_file"

run_build() {
  app_name="$1"
  app_dir="$2"
  [ -d "$app_dir" ] || { say "SKIP build $app_name: pasta ausente"; return 0; }
  [ -f "$app_dir/package.json" ] || { say "SKIP build $app_name: package.json ausente"; return 0; }

  say "Build $app_name em $app_dir"
  (
    cd "$app_dir" || exit 0
    if command -v bun >/dev/null 2>&1 && [ -f bun.lock ]; then
      bun install --silent >/dev/null 2>&1 || bun install >/dev/null 2>&1 || true
      bun run build >/dev/null 2>&1 || exit 10
    else
      npm install --silent >/dev/null 2>&1 || npm install >/dev/null 2>&1 || true
      npm run build >/dev/null 2>&1 || exit 10
    fi
  )
  code=$?
  if [ "$code" -eq 0 ]; then
    say "OK build $app_name"
  else
    say "WARN build $app_name falhou (code=$code)"
  fi
  return 0
}

run_build "web" "$CLONE_DECK/apps/web"
run_build "bot" "$CLONE_DECK/apps/bot"
run_build "crm" "$CLONE_DECK/apps/crm"

WEB_BUILD_ROOT="$CLONE_DECK/apps/web/dist"
BOT_BUILD_ROOT="$CLONE_DECK/apps/bot/dist"
WEB_ROOT="$PUBLIC_ROOT/web"
BOT_ROOT="$PUBLIC_ROOT/bot"
CRM_FALLBACK_ROOT="$PUBLIC_ROOT/crm"

ensure_index "$WEB_BUILD_ROOT" "MultiZap" "Portal MultiZap em inicialização. O deploy está ativo e a rota está conectada."
ensure_index "$BOT_BUILD_ROOT" "MultiZap Bot" "Módulo Bot em inicialização. O domínio bot.multizap.dev está conectado à VPS."
ensure_index "$CRM_FALLBACK_ROOT" "MultiZap CRM" "CRM em inicialização. O domínio crm.multizap.dev está conectado à VPS."
publish_dir "$WEB_BUILD_ROOT" "$WEB_ROOT"
publish_dir "$BOT_BUILD_ROOT" "$BOT_ROOT"

# CRM: preferir preview em porta isolada 3010 para evitar conflito com Recargas/porta 3000.
CRM_DIR="$CLONE_DECK/apps/crm"
if [ -f "$CRM_DIR/package.json" ]; then
  pm2 delete CloneDeck-CRM >/dev/null 2>&1 || true
  pm2 start npm --name CloneDeck-CRM --cwd "$CRM_DIR" -- run preview -- --host 127.0.0.1 --port "$CRM_PORT" >/dev/null 2>&1 \
    && say "OK PM2 CloneDeck-CRM preview iniciado em 127.0.0.1:$CRM_PORT" \
    || say "WARN PM2 CloneDeck-CRM preview falhou"

  if wait_http "http://127.0.0.1:${CRM_PORT}" 10; then
    say "OK CRM respondeu em 127.0.0.1:$CRM_PORT"
  else
    say "WARN CRM preview não respondeu; subindo fallback estático em 127.0.0.1:$CRM_PORT"
    pm2 delete CloneDeck-CRM >/dev/null 2>&1 || true
    pm2 start python3 --name CloneDeck-CRM -- -m http.server "$CRM_PORT" --bind 127.0.0.1 --directory "$CRM_FALLBACK_ROOT" >/dev/null 2>&1 \
      && say "OK CloneDeck-CRM fallback iniciado" \
      || say "WARN fallback CRM falhou"
  fi
fi

# Remover blocos antigos somente dos domínios MultiZap gerenciados aqui.
python3 - "$CADDYFILE" <<'PY'
from pathlib import Path
import sys
path = Path(sys.argv[1])
managed = {
    'multizap.dev',
    'www.multizap.dev',
    'bot.multizap.dev',
    'crm.multizap.dev',
    'proxy.multizap.dev',
}
lines = path.read_text().splitlines()
out = []
i = 0
while i < len(lines):
    stripped = lines[i].strip()
    first = stripped.split('{', 1)[0].strip()
    names = {part.strip() for part in first.split(',')}
    if stripped.endswith('{') and names & managed:
        depth = lines[i].count('{') - lines[i].count('}')
        i += 1
        while i < len(lines) and depth > 0:
          depth += lines[i].count('{') - lines[i].count('}')
          i += 1
        continue
    out.append(lines[i])
    i += 1
path.write_text('\n'.join(out).rstrip() + '\n')
PY

cat >> "$CADDYFILE" <<NEWBLOCKS

# --- MultiZap managed routes: clone-deck ---
multizap.dev, www.multizap.dev {
	root * ${WEB_ROOT}
	try_files {path} /index.html
	file_server
	encode gzip
}

bot.multizap.dev {
	root * ${BOT_ROOT}
	try_files {path} /index.html
	file_server
	encode gzip
}

crm.multizap.dev {
	reverse_proxy 127.0.0.1:${CRM_PORT}
	encode gzip
	handle_errors {
		root * ${CRM_FALLBACK_ROOT}
		try_files {path} /index.html
		file_server
	}
}

proxy.multizap.dev {
	reverse_proxy 127.0.0.1:3100
}
# --- /MultiZap managed routes ---
NEWBLOCKS

say "Caddyfile atualizado"

if caddy validate --config "$CADDYFILE" --adapter caddyfile >/tmp/clone-deck-caddy-validate.log 2>&1; then
  say "OK Caddyfile válido"
else
  say "ERRO Caddyfile inválido; restaurando backup"
  cat /tmp/clone-deck-caddy-validate.log || true
  cp "$backup_file" "$CADDYFILE"
  exit 1
fi

if systemctl reload caddy >/dev/null 2>&1; then
  say "OK Caddy reload"
elif systemctl restart caddy >/dev/null 2>&1; then
  say "OK Caddy restart"
else
  say "WARN: falha ao recarregar/reiniciar Caddy"
fi

sleep 5
say "Testes HTTPS"
for d in multizap.dev bot.multizap.dev crm.multizap.dev proxy.multizap.dev; do
  CODE="$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 10 "https://${d}/health" 2>/dev/null)"
  if [ "$d" = "bot.multizap.dev" ] || [ "$d" = "crm.multizap.dev" ] || [ "$d" = "multizap.dev" ]; then
    CODE="$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 10 "https://${d}" 2>/dev/null)"
  fi
  say "${d} -> HTTPS ${CODE}"
done

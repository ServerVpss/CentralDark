#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

FAILED=0
WARNED=0

log() { printf '[builder-bolt-check] %s\n' "$*"; }
ok() { log "OK: $*"; }
warn() { WARNED=1; log "SKIPPED_ENV: $*"; }
fail() { FAILED=1; log "FAIL: $*"; }

need_file() {
  [[ -f "$1" ]] && ok "arquivo existe: $1" || fail "arquivo ausente: $1"
}

need_text() {
  local file="$1" text="$2" label="$3"
  grep -Fq "$text" "$file" && ok "$label" || fail "$label ausente em $file"
}

no_text() {
  local file="$1" text="$2" label="$3"
  grep -Fq "$text" "$file" && fail "$label encontrado em $file" || ok "$label ausente"
}

log "Iniciando validação estática local do Builder Bolt."

files=(
  ".gitignore"
  "apps/builder-bolt/README.md"
  "apps/builder-bolt/PLANO.md"
  "apps/builder-bolt/docker-compose.yml"
  "apps/builder-bolt/.env.example"
  "scripts/deploy/install-builder-bolt.sh"
  "scripts/deploy/ativar-builder-bolt-caddy.sh"
  "infra/caddy/builder.centralldark.com.Caddyfile"
  "docs/RELATORIOS/2026-06-15-builder-bolt.md"
  "docs/RELATORIOS/2026-06-16-builder-bolt-p2.md"
  "docs/RELATORIOS/2026-06-16-builder-bolt-pr61.md"
  "docs/RELATORIOS/2026-06-16-builder-bolt-caddy.md"
)

for f in "${files[@]}"; do need_file "$f"; done

if [[ -f scripts/deploy/install-builder-bolt.sh ]]; then
  bash -n scripts/deploy/install-builder-bolt.sh && ok "bash -n do instalador" || fail "bash -n do instalador"
  need_text scripts/deploy/install-builder-bolt.sh "CD_CONFIRM_BUILDER_BOLT" "confirmação operacional"
  need_text scripts/deploy/install-builder-bolt.sh "127.0.0.1" "bind local"
  need_text scripts/deploy/install-builder-bolt.sh "5174" "porta local 5174"
  need_text scripts/deploy/install-builder-bolt.sh "5173" "porta interna 5173"
  need_text scripts/deploy/install-builder-bolt.sh "Porta 3000" "bloqueio da porta 3000"
  need_text scripts/deploy/install-builder-bolt.sh "compose config >/dev/null || fail" "compose config protegido por relatório"
  need_text scripts/deploy/install-builder-bolt.sh "if ! compose up -d --build builder-bolt; then" "compose up/build protegido por relatório"
  need_text scripts/deploy/install-builder-bolt.sh "container_owns_port" "reexecução segura do container"
  need_text scripts/deploy/install-builder-bolt.sh "centraldark-builder-bolt" "container alvo correto"
  no_text scripts/deploy/install-builder-bolt.sh "docker restart" "docker restart proibido"
  no_text scripts/deploy/install-builder-bolt.sh "docker compose down" "docker compose down proibido"
  no_text scripts/deploy/install-builder-bolt.sh "docker stop" "docker stop proibido"
  no_text scripts/deploy/install-builder-bolt.sh "caddy reload" "caddy reload proibido"
  no_text scripts/deploy/install-builder-bolt.sh "pm2 restart" "pm2 restart proibido"
fi

if [[ -f apps/builder-bolt/docker-compose.yml ]]; then
  if command -v ruby >/dev/null 2>&1; then
    ruby -e 'require "yaml"; d=YAML.load_file("apps/builder-bolt/docker-compose.yml"); raise "service missing" unless d.fetch("services").key?("builder-bolt")' \
      && ok "YAML do compose válido via Ruby" || fail "YAML do compose inválido via Ruby"
  else
    warn "ruby indisponível; validação YAML profunda pulada"
  fi
  need_text apps/builder-bolt/docker-compose.yml "container_name: centraldark-builder-bolt" "container no compose"
  need_text apps/builder-bolt/docker-compose.yml "builder.centralldark.com" "domínio no compose"
  need_text apps/builder-bolt/docker-compose.yml "BOLT_HOST_BIND:-127.0.0.1" "bind local no compose"
  need_text apps/builder-bolt/docker-compose.yml "BOLT_HOST_PORT:-5174" "porta local no compose"
fi

if [[ -f infra/caddy/builder.centralldark.com.Caddyfile ]]; then
  need_text infra/caddy/builder.centralldark.com.Caddyfile "builder.centralldark.com" "site block Caddy"
  need_text infra/caddy/builder.centralldark.com.Caddyfile "reverse_proxy 127.0.0.1:5174" "reverse proxy local"
  no_text infra/caddy/builder.centralldark.com.Caddyfile "Cross-Origin-Opener-Policy" "COOP sobrescrito pelo Caddy"
  no_text infra/caddy/builder.centralldark.com.Caddyfile "Cross-Origin-Embedder-Policy" "COEP sobrescrito pelo Caddy"
  python3 - <<'PY'
from pathlib import Path
s = Path('infra/caddy/builder.centralldark.com.Caddyfile').read_text(encoding='utf-8')
raise SystemExit(0 if s.count('{') == s.count('}') else 1)
PY
  [[ $? -eq 0 ]] && ok "chaves do Caddyfile balanceadas" || fail "chaves do Caddyfile desbalanceadas"
fi

if [[ -f scripts/deploy/ativar-builder-bolt-caddy.sh ]]; then
  bash -n scripts/deploy/ativar-builder-bolt-caddy.sh && ok "bash -n do ativador Caddy" || fail "bash -n do ativador Caddy"
  need_text scripts/deploy/ativar-builder-bolt-caddy.sh "CD_CONFIRM_CADDY_BUILDER_BOLT" "confirmacao Caddy por variavel"
  need_text scripts/deploy/ativar-builder-bolt-caddy.sh "CONFIRMO CADDY BUILDER BOLT" "confirmacao Caddy por frase literal"
  need_text scripts/deploy/ativar-builder-bolt-caddy.sh "builder.centralldark.com" "dominio Caddy correto"
  need_text scripts/deploy/ativar-builder-bolt-caddy.sh "127.0.0.1:5174" "proxy local Caddy correto"
  need_text scripts/deploy/ativar-builder-bolt-caddy.sh "caddy validate" "validacao Caddy antes do reload"
  need_text scripts/deploy/ativar-builder-bolt-caddy.sh "systemctl reload caddy" "reload Caddy controlado"
  no_text scripts/deploy/ativar-builder-bolt-caddy.sh "docker compose up" "ativador Caddy sem docker compose up"
  no_text scripts/deploy/ativar-builder-bolt-caddy.sh "pm2 restart" "ativador Caddy sem pm2 restart"
fi

if grep -RInE '^(<<<<<<<|=======|>>>>>>>)' .gitignore apps/builder-bolt scripts/deploy/install-builder-bolt.sh scripts/deploy/ativar-builder-bolt-caddy.sh infra/caddy/builder.centralldark.com.Caddyfile docs/RELATORIOS/2026-06-15-builder-bolt.md docs/RELATORIOS/2026-06-16-builder-bolt-p2.md docs/RELATORIOS/2026-06-16-builder-bolt-pr61.md docs/RELATORIOS/2026-06-16-builder-bolt-caddy.md >/tmp/builder-bolt-conflicts.txt 2>/dev/null; then
  fail "marcadores de conflito encontrados"
else
  ok "sem marcadores de conflito"
fi

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  docker compose -f apps/builder-bolt/docker-compose.yml --env-file apps/builder-bolt/.env.example config >/tmp/builder-bolt-compose-config.txt \
    && ok "docker compose config" || fail "docker compose config"
else
  warn "docker/docker compose indisponível; docker compose config pulado"
fi

if command -v caddy >/dev/null 2>&1; then
  caddy validate --config infra/caddy/builder.centralldark.com.Caddyfile >/tmp/builder-bolt-caddy-validate.txt 2>&1 \
    && ok "caddy validate do snippet" || fail "caddy validate do snippet"
else
  warn "caddy indisponível; caddy validate pulado"
fi

if [[ "$FAILED" -ne 0 ]]; then
  log "RESULTADO: FALHA"
  exit 1
fi

[[ "$WARNED" -ne 0 ]] && log "RESULTADO: OK com SKIPPED_ENV" || log "RESULTADO: OK"

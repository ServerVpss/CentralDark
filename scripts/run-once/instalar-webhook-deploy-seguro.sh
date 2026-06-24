#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${CENTRALDARK_ROOT:-/root/CentralDark}"
THEME="${ROOT}/scripts/lib/theme.sh"
SECRET_FILE="${WEBHOOK_ENV_FILE:-${ROOT}/secrets/webhook.env}"
SERVICE_NAME="${WEBHOOK_PM2_NAME:-CentralDark-WebhookDeploy}"
LOG_DIR="/root/Multizap/revisoes/$(date +%Y%m%d-%H%M%S)/instalar-webhook-deploy-seguro"
SERVER_SCRIPT="${ROOT}/scripts/webhook/github-webhook-deploy.mjs"
CADDY_TEMPLATE="${ROOT}/infra/caddy/deploy-centraldark.Caddyfile"

mkdir -p "$LOG_DIR"

# shellcheck source=scripts/lib/theme.sh
if [ -f "$THEME" ]; then
  source "$THEME"
else
  netflix_header() { printf '== %s ==\n' "${1:-CentralDark}"; }
  netflix_step() { printf '[%s/%s] %s\n' "$1" "$2" "$3"; }
  netflix_success() { printf 'OK %s\n' "${1:-Concluido}"; }
  netflix_warning() { printf 'AVISO %s\n' "${1:-Atencao}"; }
  netflix_error() { printf 'ERRO %s\n' "${1:-Falha}"; }
  netflix_done() { printf 'CONCLUIDO\n'; }
fi

netflix_header "Instalar Webhook Deploy Seguro"

netflix_step 1 6 "Validando Node"
if ! command -v node >/dev/null 2>&1; then
  netflix_error "Node nao encontrado"
  exit 1
fi
node --version >"${LOG_DIR}/node-version.log" 2>&1
netflix_success "Node encontrado"

netflix_step 2 6 "Preparando secret local fora do repo"
mkdir -p "$(dirname "$SECRET_FILE")"
chmod 700 "$(dirname "$SECRET_FILE")" 2>/dev/null || true
if [ ! -f "$SECRET_FILE" ]; then
  {
    printf '# CentralDark webhook deploy - arquivo local fora do repo\n'
    printf 'GITHUB_WEBHOOK_SECRET=%s\n' "$(openssl rand -hex 32)"
  } >"$SECRET_FILE"
  chmod 600 "$SECRET_FILE" 2>/dev/null || true
  netflix_success "Secret local criado sem imprimir valor"
elif ! grep -q '^GITHUB_WEBHOOK_SECRET=' "$SECRET_FILE"; then
  printf 'GITHUB_WEBHOOK_SECRET=%s\n' "$(openssl rand -hex 32)" >>"$SECRET_FILE"
  chmod 600 "$SECRET_FILE" 2>/dev/null || true
  netflix_success "Secret local adicionado sem imprimir valor"
else
  netflix_success "Secret local ja existe"
fi

netflix_step 3 6 "Instalando dependencias se necessario"
if [ -f "${ROOT}/package-lock.json" ]; then
  npm --prefix "$ROOT" ci --no-audit --no-fund >"${LOG_DIR}/npm.log" 2>&1
elif [ -f "${ROOT}/package.json" ]; then
  npm --prefix "$ROOT" install --no-audit --no-fund >"${LOG_DIR}/npm.log" 2>&1
else
  netflix_warning "package.json ausente; npm ignorado"
fi
netflix_success "Dependencias verificadas"

netflix_step 4 6 "Validando scripts e Caddyfile versionado"
node --check "$SERVER_SCRIPT" >"${LOG_DIR}/node-check.log" 2>&1
test -f "$CADDY_TEMPLATE"
netflix_success "Arquivos preparados"

netflix_step 5 6 "Preparando PM2 sem reiniciar servicos sensiveis"
if command -v pm2 >/dev/null 2>&1; then
  if pm2 describe "$SERVICE_NAME" >/dev/null 2>&1; then
    netflix_warning "Servico PM2 ja existe; nao alterado neste lote"
  else
    pm2 start node --name "$SERVICE_NAME" -- "$SERVER_SCRIPT" >"${LOG_DIR}/pm2-start.log" 2>&1
    pm2 save >"${LOG_DIR}/pm2-save.log" 2>&1
    netflix_success "Servico PM2 criado"
  fi
else
  netflix_warning "PM2 nao encontrado; pendente"
fi

netflix_step 6 6 "Validando health local"
code="$(curl -s -o "${LOG_DIR}/health.json" -w '%{http_code}' --max-time 10 http://127.0.0.1:9300/health || true)"
printf 'health=%s\n' "$code" >"${LOG_DIR}/summary.txt"
if [ "$code" = "200" ]; then
  netflix_success "Health OK"
else
  netflix_warning "Health ainda nao retornou 200"
fi

printf '\nCOPIE-E-MANDE\n'
printf 'Servico: %s\n' "$SERVICE_NAME"
printf 'Porta: 127.0.0.1:9300\n'
printf 'Secret: presente em arquivo local, valor nao exibido\n'
printf 'Caddyfile: %s\n' "$CADDY_TEMPLATE"
printf 'Reload Caddy aplicado: nao\n'
printf 'Log: %s\n' "$LOG_DIR"
netflix_done

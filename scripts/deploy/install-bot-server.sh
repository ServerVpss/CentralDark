#!/usr/bin/env bash
# install-bot-server.sh — instala/atualiza o CentralDark-BotServer (PM2) e
# (opcionalmente) registra o snippet Caddy pra expor /v1/whatsapp/* em
# https://bot.centralldark.com.
#
# IDEMPOTENTE: pode rodar quantas vezes quiser.
# SENSÍVEL: mexe em PM2 + Caddy. Roda só com CD_CONFIRM=1.
set -euo pipefail

APP=CentralDark-BotServer
APP_DIR=/root/CentralDark/apps/bot-server
CADDY_BLOCK_FILE=/etc/caddy/conf.d/bot-server.caddy
CADDYFILE=/etc/caddy/Caddyfile

if [ "${CD_CONFIRM:-0}" != "1" ]; then
  cat <<'MSG' >&2
⚠️  Este script mexe em PM2 + Caddy (regras sensíveis).
   Rode com:  CD_CONFIRM=1 bash scripts/deploy/install-bot-server.sh
MSG
  exit 1
fi

echo "==> 1/5 Atualizando código"
if [ ! -d "$APP_DIR" ]; then
  echo "❌ $APP_DIR não existe — rode git pull primeiro." >&2
  exit 1
fi
chmod +x "$APP_DIR/start.sh"

echo "==> 2/5 Cofre opcional ($APP_DIR/start.sh lê /root/CentralDark/secrets/bot-server.env)"
mkdir -p /root/CentralDark/secrets
if [ ! -f /root/CentralDark/secrets/bot-server.env ]; then
  cat > /root/CentralDark/secrets/bot-server.env <<EOF
# Segredo compartilhado entre painel/frontend e bot-server.
# Se vazio, o /health continua público mas o resto continua protegido.
BOT_SERVER_SHARED_TOKEN=
EOF
  chmod 600 /root/CentralDark/secrets/bot-server.env
fi

echo "==> 3/5 Registrando no PM2"
if pm2 describe "$APP" >/dev/null 2>&1; then
  pm2 reload "$APP" --update-env
else
  pm2 start "$APP_DIR/ecosystem.config.cjs"
fi
pm2 save

echo "==> 4/5 Validando porta local"
sleep 2
if curl -fsS http://127.0.0.1:9210/health >/dev/null; then
  echo "   ✅ /health respondeu 200"
else
  echo "   ❌ /health não respondeu — checar pm2 logs $APP"
  exit 1
fi

echo "==> 5/5 (opcional) Snippet Caddy — só aplica com CD_INSTALL_CADDY=1"
if [ "${CD_INSTALL_CADDY:-0}" = "1" ]; then
  mkdir -p "$(dirname "$CADDY_BLOCK_FILE")"
  cat > "$CADDY_BLOCK_FILE" <<'CADDY'
bot.centralldark.com {
    encode zstd gzip
    @api path /v1/* /health
    handle @api {
        reverse_proxy 127.0.0.1:9210
    }
    respond 404
    log {
        output file /var/log/caddy/bot-server.log
    }
}
CADDY
  # Garante que o Caddyfile principal importe os snippets
  if ! grep -q 'import conf.d/\*' "$CADDYFILE" 2>/dev/null; then
    echo 'import conf.d/*.caddy' | tee -a "$CADDYFILE" >/dev/null
  fi
  caddy validate --config "$CADDYFILE" --adapter caddyfile
  systemctl reload caddy
  echo "   ✅ Caddy recarregado — https://bot.centralldark.com/health"
else
  echo "   ⏭️ Caddy não tocado. Pra ativar:  CD_CONFIRM=1 CD_INSTALL_CADDY=1 bash $0"
fi

echo "✅ Bot-server pronto. PM2 status:"
pm2 describe "$APP" | grep -E 'status|script|port' || true

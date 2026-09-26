# COMANDO - 079-resync-apps-bot-vps.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\scripts\run-once\079-resync-apps-bot-vps.sh
**SHA:** 68bfa027a57affb6
**Timestamp:** 2026-08-26T19:32:52.683880
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- [ -n "$proc" ] && pm2 restart "$proc" --update-env >/dev/null 2>&1 && log "PM2 restart: $proc"

### Ouro Bruto (primeiros 5000 chars)
```
#!/bin/bash
# ============================================================================
# 079 - Ressincronizar /root/Multizap/apps/bot a partir do repositório
# ----------------------------------------------------------------------------
# Objetivo: limpar a pasta operacional do bot na VPS e reenviar a versão
# limpa vinda de clone-deck/apps/bot, PRESERVANDO .env, credenciais e
# pastas de sessão do WhatsApp.
#
# Escopo seguro:
#   - Mexe APENAS em /root/Multizap/apps/bot
#   - NÃO toca em crm, gateway, wuzapi, caddy, docker, banco, domínios
#   - Backup completo antes de qualquer remoção
#   - Restauração automática se backup falhar
# ============================================================================
set -uo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
REV_DIR="/root/Multizap/revisoes/$TS/resync-bot-vps"
BACKUP_DIR="$REV_DIR/backup-bot"
RESUMO="$REV_DIR/resumo.md"

BOT_DST="/root/Multizap/apps/bot"
REPO_SRC="/root/Multizap/apps/clone-deck/apps/bot"

mkdir -p "$REV_DIR" "$BACKUP_DIR"

log() { echo "[$(date '+%H:%M:%S')] $*" | tee -a "$RESUMO"; }
sanitize() { sed -E 's/(token|password|authorization|apikey|api_key|secret|bot_token)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig'; }

echo "# Resync apps/bot — $TS" > "$RESUMO"
echo "" >> "$RESUMO"

# ----------------------------------------------------------------------------
# 1. Pré-checagens
# ----------------------------------------------------------------------------
log "## 1. Pré-checagens"

if [ ! -d "$REPO_SRC" ]; then
  log "ERRO FATAL: fonte do repo não existe: $REPO_SRC"
  log "Abortando sem tocar em nada."
  exit 1
fi

if [ ! -d "$BOT_DST" ]; then
  log "Aviso: pasta destino $BOT_DST não existe — vai ser criada do zero."
  mkdir -p "$BOT_DST"
fi

REPO_SIZE=$(du -sh "$REPO_SRC" 2>/dev/null | cut -f1)
DST_SIZE=$(du -sh "$BOT_DST" 2>/dev/null | cut -f1)
log "Fonte do repo: $REPO_SRC ($REPO_SIZE)"
log "Destino VPS:   $BOT_DST ($DST_SIZE)"

# ----------------------------------------------------------------------------
# 2. Backup completo
# ----------------------------------------------------------------------------
log ""
log "## 2. Backup completo"

cp -a "$BOT_DST/." "$BACKUP_DIR/" 2>>"$REV_DIR/backup-errors.log" || true
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
log "Backup criado em $BACKUP_DIR ($BACKUP_SIZE)"

if [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
  log "AVISO: backup ficou vazio. Como o destino também está vazio, seguindo."
fi

# Backup explícito dos itens sensíveis (cópia redundante separada)
SENSITIVE_DIR="$REV_DIR/sensiveis"
mkdir -p "$SENSITIVE_DIR"

shopt -s dotglob nullglob
for pat in ".env" ".env.*" "secrets" "credenciais" \
           "auth_info*" "sessions*" ".wwebjs_auth*" \
           "baileys_auth*" "tokens*" "session*.json"; do
  for item in "$BOT_DST"/$pat; do
    [ -e "$item" ] || continue
    cp -a "$item" "$SENSITIVE_DIR/" 2>/dev/null && \
      log "Preservado: $(basename "$item")"
  done
done
shopt -u dotglob nullglob

# ----------------------------------------------------------------------------
# 3. Parar PM2 só do bot
# ----------------------------------------------------------------------------
log ""
log "## 3. Parar processos PM2 do bot"

pm2 jlist 2>/dev/null | jq -r '.[].name' 2>/dev/null | \
  grep -iE '(^|-)bot($|-)|whatsapp|baileys' | \
  grep -viE 'telegram|crm' | tee "$REV_DIR/processos-parados.txt" | \
  while read -r proc; do
    [ -n "$proc" ] && pm2 stop "$proc" >/dev/null 2>&1 && log "PM2 stop: $proc"
  done

# ----------------------------------------------------------------------------
# 4. Limpar pasta destino (apenas se backup OK)
# ----------------------------------------------------------------------------
log ""
log "## 4. Limpar destino"

DST_REAL_FILES=$(find "$BOT_DST" -mindepth 1 2>/dev/null | head -1)
BACKUP_HAS_FILES=$(find "$BACKUP_DIR" -mindepth 1 2>/dev/null | head -1)

if [ -z "$DST_REAL_FILES" ]; then
  log "Destino já está vazio — nada a limpar."
elif [ -n "$BACKUP_HAS_FILES" ]; then
  find "$BOT_DST" -mindepth 1 -delete 2>>"$REV_DIR/cleanup-errors.log" || true
  log "Conteúdo de $BOT_DST removido (backup OK)."
else
  log "ABORTANDO: destino tem arquivos mas backup ficou vazio. Risco alto, não vou limpar."
  exit 1
fi

# ----------------------------------------------------------------------------
# 5. Ressincronizar do repo
# ----------------------------------------------------------------------------
log ""
log "## 5. Copiar versão limpa do repositório"

# rsync sem node_modules/dist pra ficar leve (vamos rebuildar)
rsync -a \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.cache' \
  "$REPO_SRC/" "$BOT_DST/" 2>>"$REV_DIR/rsync-errors.log"
NEW_SIZE=$(du -sh "$BOT_DST" 2>/dev/null | cut -f1)
log "Cópia concluída ($NEW_SIZE)"

# ----------------------------------------------------------------------------
# 6. Restaurar segredos e sessão
# ----------------------------------------------------------------------------
log ""
log "## 6. Restaurar segredos e sess
```
#!/usr/bin/env bash
# ============================================================================
# multizap-restore.sh — Restauração de backup do MultiZap
# ============================================================================
# Uso:
#   /usr/local/bin/multizap-restore.sh <arquivo.tar.gz.enc> [--dry-run]
#
# O que faz:
#   1. Decifra o .enc usando BACKUP_ENCRYPTION_PASSWORD
#   2. Extrai os 4 arquivos: db, media, code, sessions
#   3. Em --dry-run, SÓ extrai pra /tmp/multizap-restore-<stamp> e mostra o conteúdo
#   4. Em modo real, pede confirmação 2x antes de sobrescrever
#
# CUIDADO: restauração real APAGA dados atuais do banco e do /root/Multizap.
#          SEMPRE rode com --dry-run primeiro!
# ============================================================================

set -uo pipefail

ENV_FILE="/etc/multizap-backup.env"
[ -f "$ENV_FILE" ] || { echo "[ERRO] $ENV_FILE não encontrado"; exit 1; }
# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

[ -n "${BACKUP_ENCRYPTION_PASSWORD:-}" ] || { echo "[ERRO] BACKUP_ENCRYPTION_PASSWORD não configurada"; exit 1; }

INPUT="${1:-}"
MODE="${2:-real}"
[ -z "$INPUT" ] && { echo "Uso: $0 <arquivo.tar.gz.enc> [--dry-run]"; exit 1; }
[ ! -f "$INPUT" ] && { echo "[ERRO] Arquivo não existe: $INPUT"; exit 1; }

STAMP="$(date +%Y%m%d_%H%M%S)"
WORK="/tmp/multizap-restore-$STAMP"
mkdir -p "$WORK"

echo "===================================================================="
echo "Decifrando $INPUT em $WORK..."
echo "===================================================================="

openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 \
  -pass env:BACKUP_ENCRYPTION_PASSWORD \
  -in "$INPUT" | gunzip | tar -xf - -C "$WORK" || {
  echo "[ERRO] Falha ao decifrar/extrair. Senha errada ou arquivo corrompido."
  rm -rf "$WORK"
  exit 1
}

echo ""
echo "Conteúdo extraído:"
ls -lh "$WORK"
echo ""

if [ "$MODE" = "--dry-run" ]; then
  echo "===================================================================="
  echo "DRY-RUN OK. Arquivos válidos em: $WORK"
  echo "Pra restaurar de verdade, rode SEM --dry-run."
  echo "===================================================================="
  exit 0
fi

# ---- Confirmação dupla ------------------------------------------------------
echo "⚠️  ATENÇÃO: a restauração real vai:"
echo "    - APAGAR e RECRIAR o banco a partir do dump"
echo "    - SOBRESCREVER /root/Multizap (gateway + wuzapi)"
echo "    - RESTAURAR mídias nos buckets Supabase"
echo "    - Recargas Brasil (/root/whatsapp-server) NÃO será tocado"
echo ""
read -r -p "Digite CONFIRMO RESTAURAR pra continuar: " C1
[ "$C1" != "CONFIRMO RESTAURAR" ] && { echo "Cancelado."; exit 1; }
read -r -p "Tem certeza? (sim/nao): " C2
[ "$C2" != "sim" ] && { echo "Cancelado."; exit 1; }

# ---- 1. Banco --------------------------------------------------------------
if [ -f "$WORK/db.sql.gz" ]; then
  echo "[1/4] Restaurando banco..."
  gunzip -c "$WORK/db.sql.gz" | psql "$SUPABASE_DB_URL" || echo "[WARN] psql teve avisos"
fi

# ---- 2. Código -------------------------------------------------------------
if [ -f "$WORK/code.tar.gz" ]; then
  echo "[2/4] Restaurando código..."
  echo "  -> backup atual em /root/Multizap.before-restore-$STAMP"
  [ -d /root/Multizap ] && mv /root/Multizap "/root/Multizap.before-restore-$STAMP"
  tar -xzf "$WORK/code.tar.gz" -C /
  echo "  -> rodando npm ci no gateway..."
  (cd /root/Multizap/gateway && npm ci --omit=dev 2>&1 | tail -5) || true
fi

# ---- 3. Sessões WhatsApp ---------------------------------------------------
if [ -f "$WORK/whatsapp-sessions.tar.gz" ]; then
  echo "[3/4] Restaurando sessões WhatsApp..."
  TMP_SESS="$WORK/_sessions"
  mkdir -p "$TMP_SESS"
  tar -xzf "$WORK/whatsapp-sessions.tar.gz" -C "$TMP_SESS"
  INNER=$(find "$TMP_SESS" -maxdepth 1 -type d -name "_sessions_tmp" | head -1)

  if [ -n "$INNER" ]; then
    [ -f "$INNER/wuzapi-files.tar.gz" ] && tar -xzf "$INNER/wuzapi-files.tar.gz" -C /
    [ -f "$INNER/connections.json" ] && cp "$INNER/connections.json" /root/Multizap/gateway/data/connections.json
    if [ -f "$INNER/wuzapi-postgres.sql.gz" ] && docker ps --format '{{.Names}}' | grep -q wuzapi-db; then
      echo "  -> restaurando Postgres do container wuzapi-db..."
      gunzip -c "$INNER/wuzapi-postgres.sql.gz" | docker exec -i wuzapi-db psql -U postgres || echo "[WARN] avisos no psql wuzapi"
    fi
  fi
fi

# ---- 4. Mídias (apenas extrai — upload manual pra evitar acidentes) -------
if [ -f "$WORK/media.tar.gz" ]; then
  echo "[4/4] Mídias extraídas em $WORK/media/"
  echo "       Upload de volta pros buckets é MANUAL (cuidado: pode sobrescrever)."
  tar -xzf "$WORK/media.tar.gz" -C "$WORK"
fi

echo ""
echo "===================================================================="
echo "Restauração concluída. Reiniciando serviços..."
pm2 restart MultiZap-Gateway 2>&1 | tail -3 || true
echo ""
echo "Arquivos de trabalho mantidos em: $WORK"
echo "Backup do estado anterior em: /root/Multizap.before-restore-$STAMP"
echo "===================================================================="

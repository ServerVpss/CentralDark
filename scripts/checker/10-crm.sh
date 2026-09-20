#!/usr/bin/env bash
# Bloco 10 — CRM (SOMENTE LEITURA — proibido mover/alterar)
source "$(dirname "$0")/_lib.sh"
BLOCO="10-crm"

CRM="$CK_CENTRALDARK_ROOT/apps/crm"
require_canonical_path "$BLOCO" "$CRM" || exit 0

if [ -d "$CRM" ]; then
  emit_ok "$BLOCO" "Pasta CRM presente na CentralDark: $CRM"
else
  emit_alerta "$BLOCO" "CRM ainda não está consolidado na raiz canônica: $CRM"
fi

if has_cmd pm2; then
  if ! has_cmd jq; then
    emit_alerta "$BLOCO" "jq ausente — não dá pra validar CWD do processo CRM"
    exit 0
  fi

  PM2_JSON=$(pm2 jlist 2>/dev/null) || {
    emit_alerta "$BLOCO" "Falha ao consultar pm2 jlist"
    exit 0
  }
  PROC=$(printf '%s' "$PM2_JSON" | jq -r '.[] | select(.name == "CentralDark-CloneDeck") | [.pm2_env.status, .pm2_env.pm_cwd] | @tsv' | head -1)
  if [ -z "$PROC" ]; then
    emit_alerta "$BLOCO" "CentralDark-CloneDeck ausente no PM2"
    exit 0
  fi

  IFS=$'\t' read -r ST PM_CWD <<< "$PROC"
  if [ "$ST" != "online" ]; then
    emit_alerta "$BLOCO" "CentralDark-CloneDeck estado=${ST:-ausente}"
  elif [ -z "${PM_CWD:-}" ] || ! require_canonical_path "$BLOCO" "$PM_CWD"; then
    emit_alerta "$BLOCO" "CentralDark-CloneDeck online, mas CWD ausente ou fora da CentralDark"
  else
    emit_ok "$BLOCO" "CentralDark-CloneDeck online com CWD canônico comprovado: $PM_CWD"
  fi
fi

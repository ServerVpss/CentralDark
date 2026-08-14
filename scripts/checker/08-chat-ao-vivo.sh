#!/usr/bin/env bash
# Bloco 08 — Chat ao vivo + contatos + fotos + grupos (best-effort, só sinais)
source "$(dirname "$0")/_lib.sh"
BLOCO="08-chat-ao-vivo"

# Somente a implementação dentro da CentralDark é operacional. Não há fallback
# para clone-deck/Multizap; dependência externa real precisa ser migrada.
BOT="$CK_CENTRALDARK_ROOT/apps/bot"
require_canonical_path "$BLOCO" "$BOT" || exit 0

if [ ! -d "$BOT" ]; then
  emit_alerta "$BLOCO" "Pasta canônica do bot não encontrada: $BOT"
  exit 0
fi

for arquivo in \
    "server/src/lib/log-time.cjs" \
    "src/lib/datetime.ts" \
    "src/pages/admin/AdminChats.tsx" \
    "src/pages/admin/AdminContacts.tsx"; do
  if [ -f "$BOT/$arquivo" ]; then
    emit_ok "$BLOCO" "Presente: $arquivo"
  else
    emit_alerta "$BLOCO" "Faltando: $arquivo"
  fi
done

# Tenta um ping no gateway WuzAPI (somente leitura)
if has_cmd curl; then
  HTTP=$(curl -fsS -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:8080/health 2>/dev/null || echo "000")
  if [ "$HTTP" = "200" ]; then
    emit_ok "$BLOCO" "Gateway respondeu /health 200"
  else
    emit_alerta "$BLOCO" "Gateway /health respondeu $HTTP"
  fi
fi

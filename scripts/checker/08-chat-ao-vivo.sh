#!/usr/bin/env bash
# Bloco 08 — Chat ao vivo + contatos + fotos + grupos (best-effort, só sinais)
source "$(dirname "$0")/_lib.sh"
BLOCO="08-chat-ao-vivo"

# Verifica se o backend do bot tem as rotas/módulos esperados
BOT="$CK_MULTIZAP_ROOT/apps/clone-deck/apps/bot"
if [ ! -d "$BOT" ]; then
  BOT="$CK_MULTIZAP_ROOT/apps/bot"
fi

if [ ! -d "$BOT" ]; then
  emit_alerta "$BLOCO" "Pasta do bot não encontrada — pulando verificações"
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
    emit_alerta "$BLOCO" "Gateway /health respondeu $HTTP (esperado se WuzAPI estiver em outra porta)"
  fi
fi

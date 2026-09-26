#!/usr/bin/env bash
# ============================================================================
#  cloudflare-browser-connect.sh
#
#  Conecta a Cloudflare via NAVEGADOR (OAuth ou 1-Click Token), usando o
#  endpoint público https://install.centralldark.com como ponte.
#
#  Fluxo (pro usuário leigo):
#    1. Script chama POST /session/new no install-callback
#    2. Imprime o link clicável no terminal SSH
#    3. Faz long-poll em /session/<id> até o navegador concluir
#    4. Recebe o token, salva em /root/CentralDark/secrets/cloudflare.env
#
#  Uso:
#    ./cloudflare-browser-connect.sh                 # padrão
#    INSTALL_HOST=https://install.centralldark.com ./cloudflare-browser-connect.sh
# ============================================================================

set -uo pipefail

INSTALL_HOST="${INSTALL_HOST:-https://install.centralldark.com}"
SECRETS_DIR="${SECRETS_DIR:[REDIGIDO-PRESERVACAO]}"
TIMEOUT_MIN="${TIMEOUT_MIN:-10}"

# Cores
G="\033[1;32m"; Y="\033[1;33m"; R="\033[1;31m"; C="\033[1;36m"; D="\033[0m"

banner() {
  echo
  echo -e "${C}╔════════════════════════════════════════════════════════════════╗${D}"
  echo -e "${C}║  🌩️   CONECTAR CLOUDFLARE — MODO NAVEGADOR                    ║${D}"
  echo -e "${C}╚════════════════════════════════════════════════════════════════╝${D}"
  echo
}

die() { echo -e "${R}✗ $*${D}" >&2; exit 1; }
ok()  { echo -e "${G}✓ $*${D}"; }
info(){ echo -e "${Y}→ $*${D}"; }

command -v curl >/dev/null  || die "curl não encontrado"
command -v jq   >/dev/null  || die "jq não encontrado (apt install jq)"

banner

# 1) Health do endpoint
info "Verificando se ${INSTALL_HOST} está no ar…"
HEALTH=$(curl -fsS --max-time 6 "${INSTALL_HOST}/health" 2>/dev/null || true)
[ -z "$HEALTH" ] && die "Endpoint ${INSTALL_HOST} indisponível. DNS pode não ter propagado ainda."
HAS_OAUTH=$(echo "$HEALTH" | jq -r '.oauth')
ok "Endpoint online (OAuth disponível: ${HAS_OAUTH})"

# 2) Criar sessão
info "Criando sessão de conexão…"
SESSION=$(curl -fsS -X POST "${INSTALL_HOST}/session/new") \
  || die "Falha ao criar sessão"
SID=$(echo "$SESSION" | jq -r '.session_id')
CONNECT_URL=$(echo "$SESSION" | jq -r '.connect_url')
[ -z "$SID" ] && die "Resposta inválida do servidor"

# 3) Mostrar instruções no terminal
cat <<EOF

${G}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${D}
  ${C}1.${D} Abra este link no seu navegador (qualquer dispositivo):

      ${G}${CONNECT_URL}${D}

  ${C}2.${D} Escolha:
       • "Entrar com Cloudflare" (se OAuth estiver liberado), OU
       • "Criar token na Cloudflare" (1 clique e cola de volta)

  ${C}3.${D} Quando autorizar, esta tela aqui detecta sozinha.
${G}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${D}

EOF

# 4) Long-poll
info "Aguardando autorização (timeout ${TIMEOUT_MIN} min)…"
DEADLINE=$(( $(date +%s) + TIMEOUT_MIN * 60 ))
RESPONSE=""
while [ "$(date +%s)" -lt "$DEADLINE" ]; do
  RESPONSE=$(curl -fsS --max-time 30 "${INSTALL_HOST}/session/${SID}?wait=25" 2>/dev/null || true)
  STATUS=$(echo "$RESPONSE" | jq -r '.status // empty')
  if [ "$STATUS" = "done" ]; then break; fi
  if [ -z "$STATUS" ]; then
    echo -e "${Y}  (perdi conexão por um segundo, tentando de novo…)${D}"
    sleep 2
  else
    printf "."
  fi
done
echo

[ "$(echo "$RESPONSE" | jq -r '.status // empty')" = "done" ] \
  || die "Tempo esgotado. Rode de novo quando estiver pronto."

# 5) Resultado
TOKEN=$(echo "$RESPONSE" | jq -r '.token')
ACCOUNT=$(echo "$RESPONSE" | jq -r '.account_id // empty')
KIND=$(echo "$RESPONSE" | jq -r '.kind')
FP=$(echo "$RESPONSE" | jq -r '.fingerprint')

[ -z "$TOKEN" ] || [ "$TOKEN" = "null" ] && die "Servidor não devolveu token."

# 6) Validar local também (cinto + suspensório)
VERIFY=$(curl -fsS -H "Authorization: Bearer ${TOKEN}" \
  https://api.cloudflare.com/client/v4/user/tokens/verify | jq -r '.success')
[ "$VERIFY" = "true" ] || die "Token recebido mas a Cloudflare rejeitou."

# 7) Persistir
mkdir -p "$SECRETS_DIR"; chmod 700 "$SECRETS_DIR"
TARGET="${SECRETS_DIR}/cloudflare.env"
{
  echo "# Cloudflare — gravado por cloudflare-browser-connect.sh"
  echo "# Origem: ${KIND}"
  echo "# Data:   $(date -Iseconds)"
  echo "CF_API_TOKEN=${TOKEN}"
  [ -n "$ACCOUNT" ] && echo "CF_ACCOUNT_ID=${ACCOUNT}"
} > "$TARGET"
chmod 600 "$TARGET"

ok "Cloudflare conectado!"
echo "  • Origem:    ${KIND}"
echo "  • Token:     ${FP}"
[ -n "$ACCOUNT" ] && echo "  • Account:   ${ACCOUNT}"
echo "  • Cofre:     ${TARGET}"
echo
echo -e "${G}Pronto. Pode rodar os próximos passos do instalador (DNS / Caddy / HTTPS).${D}"

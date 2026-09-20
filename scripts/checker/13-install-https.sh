#!/usr/bin/env bash
# ============================================================================
#  Checker 13 — Validação end-to-end do install.centralldark.com
#  - DNS wildcard (probe aleatório)
#  - Rota Caddy install → 127.0.0.1:9200
#  - Serviço Install-Callback online local
#  - HTTPS público respondendo
#  - Certificado Let's Encrypt presente + datas
#  Saída: OK|bloco|msg / ALERTA|bloco|msg / ERRO|bloco|msg
# ============================================================================
set -uo pipefail

BLOCO="install-https"
ZONE="${ZONE:-centralldark.com}"
FQDN="install.${ZONE}"
IP_ESPERADO="${IP_ESPERADO:-89.117.78.124}"
PORTA_BACKEND="${PORTA_BACKEND:-9200}"

# --- 1) DNS wildcard ---
probe="probe-$(date +%s%N | cut -c1-12).${ZONE}"
got_probe="$(curl -s "https://1.1.1.1/dns-query?name=${probe}&type=A" \
  -H 'accept: application/dns-json' \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print(','.join(a['data'] for a in d.get('Answer',[]) if a.get('type')==1) or '')")"
if [ "$got_probe" = "$IP_ESPERADO" ]; then
  echo "OK|${BLOCO}|DNS wildcard vivo (${probe} → ${got_probe})"
else
  echo "ERRO|${BLOCO}|DNS wildcard falhou (${probe} → '${got_probe:-vazio}', esperado ${IP_ESPERADO})"
fi

# --- 2) Resolução do install ---
got_install="$(curl -s "https://1.1.1.1/dns-query?name=${FQDN}&type=A" \
  -H 'accept: application/dns-json' \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print(','.join(a['data'] for a in d.get('Answer',[]) if a.get('type')==1) or '')")"
if [ "$got_install" = "$IP_ESPERADO" ]; then
  echo "OK|${BLOCO}|${FQDN} → ${got_install}"
else
  echo "ERRO|${BLOCO}|${FQDN} resolve pra '${got_install:-vazio}'"
fi

# --- 3) Snippet Caddy esperado ---
SNIPPET="/root/CentralDark/infra/caddy/install.Caddyfile"
if [ -f "$SNIPPET" ] && grep -q "${FQDN}" "$SNIPPET" && grep -q "127.0.0.1:${PORTA_BACKEND}" "$SNIPPET"; then
  echo "OK|${BLOCO}|Snippet Caddy ok (${FQDN} → 127.0.0.1:${PORTA_BACKEND})"
elif [ -f "$SNIPPET" ]; then
  echo "ALERTA|${BLOCO}|Snippet existe mas rota não bate (${SNIPPET})"
else
  echo "ALERTA|${BLOCO}|Snippet Caddy não achado em ${SNIPPET} (rodando fora da VPS?)"
fi

# --- 4) Backend local na porta esperada ---
if ss -lntp 2>/dev/null | grep -q ":${PORTA_BACKEND} "; then
  echo "OK|${BLOCO}|Backend escutando em 127.0.0.1:${PORTA_BACKEND}"
else
  echo "ALERTA|${BLOCO}|Nada escutando em :${PORTA_BACKEND} (rodando fora da VPS?)"
fi

# --- 5) HTTPS público ---
code="$(curl -sk -o /dev/null -w '%{http_code}' --max-time 15 "https://${FQDN}/" || echo 000)"
case "$code" in
  2*|3*|401|403) echo "OK|${BLOCO}|HTTPS responde (HTTP ${code})" ;;
  000)           echo "ERRO|${BLOCO}|HTTPS sem resposta (timeout/handshake)" ;;
  *)             echo "ALERTA|${BLOCO}|HTTPS respondeu HTTP ${code}" ;;
esac

# --- 6) Certificado Let's Encrypt ---
if command -v openssl >/dev/null 2>&1; then
  cert_info="$(echo | openssl s_client -servername "${FQDN}" -connect "${FQDN}:443" 2>/dev/null \
    | openssl x509 -noout -issuer -dates 2>/dev/null)"
  if [ -n "$cert_info" ]; then
    issuer="$(echo "$cert_info" | grep -i '^issuer' | head -1)"
    not_after="$(echo "$cert_info" | grep -i 'notAfter' | cut -d= -f2-)"
    if echo "$issuer" | grep -qi "let's encrypt"; then
      echo "OK|${BLOCO}|Cert Let's Encrypt válido (expira ${not_after})"
    else
      echo "ALERTA|${BLOCO}|Cert emitido por outra CA: ${issuer}"
    fi
  else
    echo "ERRO|${BLOCO}|Não consegui ler o certificado de ${FQDN}"
  fi
else
  echo "ALERTA|${BLOCO}|openssl não disponível — pulando leitura do cert"
fi

exit 0

#!/usr/bin/env bash
# Verifica se o pacote MultiZap contém referências PERIGOSAS em arquivos EXECUTÁVEIS
# (ignora .md, ignora o próprio check-safety.sh, ignora linhas com NÃO/NUNCA/NEVER/ISOLADO).
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BAD_PATTERNS=(
  "/root/whatsapp-server"
  "(^|[^-])whatsapp-server"
  ":3000\b"
  "pm2 restart all"
  "pm2 stop all"
  "pm2 delete all"
  "pm2 kill"
  "atendimento-whatsapp-gateway"
  "auth_info_baileys"
)

# Coleta arquivos executáveis/código (sem .md, sem o próprio script)
mapfile -t FILES < <(find . -type f \
  \( -name "*.js" -o -name "*.cjs" -o -name "*.sh" -o -name "*.yml" \
     -o -name "*.json" -o -name ".env.example" -o -name "Dockerfile" \) \
  ! -name "check-safety.sh" \
  ! -path "*/node_modules/*")

FAIL=0
for pat in "${BAD_PATTERNS[@]}"; do
  HITS=""
  for f in "${FILES[@]}"; do
    LINES=$(grep -nE "$pat" "$f" 2>/dev/null | grep -viE "(NÃO|NAO|NUNCA|NEVER|ISOLADO|Recargas)" || true)
    if [ -n "$LINES" ]; then
      HITS+="$f:\n$LINES\n"
    fi
  done
  if [ -n "$HITS" ]; then
    echo "❌ PADRÃO PROIBIDO: $pat"
    printf "%b" "$HITS"
    FAIL=1
  fi
done

if [ "$FAIL" -eq 0 ]; then
  echo "✅ Pacote MultiZap limpo — sem referências perigosas ao Recargas em arquivos executáveis."
else
  echo "⚠️  Corrija os pontos acima antes de subir para VPS."
  exit 1
fi

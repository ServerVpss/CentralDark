#!/usr/bin/env bash
# 074 - Diagnostico de processos PM2 em crash loop.
# Alvo: CloneDeck-Supabase-Sync e MultiZap-TelegramBot.
# Regra: SO coleta logs sanitizados. NAO reinicia, NAO remove, NAO altera nada.
set -uo pipefail

BASE="/root/Multizap"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/074-diagnostico-pm2-crash"
REPORT="$REV/resumo.md"

mkdir -p "$REV/dados"
exec > >(tee -a "$REV/execucao.log") 2>&1

sanitize() {
  sed -E \
    -e 's/(token|password|authorization|apikey|api_key|secret)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig' \
    -e 's/(Bearer )[A-Za-z0-9._-]+/\1***OCULTO***/Ig' \
    -e 's#(postgres(ql)?://)[^@]+@#\1***OCULTO***@#Ig'
}

echo "=== RUN-ONCE 074: DIAGNOSTICO PM2 CRASH ==="
echo "Revisao: $REV"
echo "Modo: SOMENTE LEITURA. Nenhum servico sera reiniciado."

pm2 ls --no-color > "$REV/dados/pm2-ls.txt" 2>&1 || true
pm2 jlist > "$REV/dados/pm2-jlist.json" 2>&1 || true

for svc in CloneDeck-Supabase-Sync MultiZap-TelegramBot; do
  echo "--- coletando logs de $svc ---"
  pm2 describe "$svc" 2>&1 | sanitize > "$REV/dados/${svc}-describe.txt" || true
  pm2 logs "$svc" --lines 200 --nostream --raw 2>&1 | sanitize > "$REV/dados/${svc}-logs.txt" || true
done

RESTARTS=$(grep -oE '"restart_time":[0-9]+' "$REV/dados/pm2-jlist.json" 2>/dev/null | head -20 | tr '\n' ' ')

cat > "$REPORT" <<MD
# 074 - Diagnostico PM2 Crash

Data: $(date)
Revisao: $REV
Status final: ok (diagnostico coletado, nada alterado)

## Alvos

- CloneDeck-Supabase-Sync
- MultiZap-TelegramBot

## Acao

Apenas leitura: pm2 ls, pm2 describe, pm2 logs (200 linhas).
Logs sanitizados (tokens/senhas mascarados).

## Seguranca

- PM2 reiniciado: nao
- PM2 removido: nao
- Servicos alterados: nao
- Caddy alterado: nao
- Banco alterado: nao

## Evidencias

- $REV/dados/pm2-ls.txt
- $REV/dados/pm2-jlist.json
- $REV/dados/CloneDeck-Supabase-Sync-describe.txt
- $REV/dados/CloneDeck-Supabase-Sync-logs.txt
- $REV/dados/MultiZap-TelegramBot-describe.txt
- $REV/dados/MultiZap-TelegramBot-logs.txt

## Proxima acao

Ler os logs sanitizados, identificar causa raiz e propor correcao em etapa
propria com confirmacao do usuario.
MD

cat "$REPORT"
echo "=== RUN-ONCE 074 DONE ==="
exit 0

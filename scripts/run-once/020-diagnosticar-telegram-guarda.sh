#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
REV="/root/Multizap/revisoes/${TS}/guarda-telegram-diagnostico"
mkdir -p "$REV/logs"

{
  echo "# Diagnóstico Telegram / Guarda"
  echo
  echo "Data: $(date '+%Y-%m-%d %H:%M:%S')"
  echo
  echo "## Objetivo"
  echo "Verificar por que o bot Telegram ainda responde com fluxo antigo e não mostra o botão Guarda."
} > "$REV/resumo.md"

{
  echo "=== PM2 LIST ==="
  pm2 list || true
  echo
  echo "=== PM2 DESCRIBE MultiZap-TelegramBot ==="
  pm2 describe MultiZap-TelegramBot || true
  echo
  echo "=== PM2 JLIST TELEGRAM ==="
  pm2 jlist 2>/dev/null | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{let a=JSON.parse(d); for (const p of a) if ((p.name||'').toLowerCase().includes('telegram')) console.log(JSON.stringify({name:p.name,pm_exec_path:p.pm2_env?.pm_exec_path,cwd:p.pm2_env?.pm_cwd,args:p.pm2_env?.args,status:p.pm2_env?.status},null,2));}catch(e){console.log(e.message)}})" || true
} > "$REV/logs/pm2-telegram.log" 2>&1

{
  echo "=== Arquivos Telegram no repo atual ==="
  ls -lah /root/Multizap/apps/clone-deck/apps/bot/integracoes/telegram || true
  echo
  echo "=== Existe Guarda no panel.cjs? ==="
  grep -n "Guarda\|guarda" /root/Multizap/apps/clone-deck/apps/bot/integracoes/telegram/panel.cjs || true
  echo
  echo "=== Caminhos similares fora do repo ==="
  find /root/Multizap -path '*telegram*' -maxdepth 7 -type f 2>/dev/null | sort | head -200 || true
} > "$REV/logs/arquivos-telegram.log" 2>&1

{
  echo "=== Logs recentes MultiZap-TelegramBot OUT ==="
  pm2 logs MultiZap-TelegramBot --lines 120 --nostream 2>&1 || true
} > "$REV/logs/logs-telegram.log" 2>&1

{
  echo "=== Secrets existentes sem valores ==="
  if [ -f /root/Multizap/secrets/wabot.env ]; then
    grep -E '^(TELEGRAM|GUARDA)_' /root/Multizap/secrets/wabot.env | sed -E 's/=.*/=EXISTE/' || true
  else
    echo "wabot.env ausente"
  fi
} > "$REV/logs/secrets-telegram.log" 2>&1

{
  echo "## Resultado"
  echo
  if grep -q "Guarda" /root/Multizap/apps/clone-deck/apps/bot/integracoes/telegram/panel.cjs 2>/dev/null; then
    echo "- Código novo do painel contém Guarda."
  else
    echo "- Código novo do painel NÃO contém Guarda."
  fi
  echo "- Ver logs completos em: $REV/logs"
  echo
  echo "## Próximo passo"
  echo "Corrigir o PM2 para executar o bot Telegram a partir do arquivo atualizado, se o diagnóstico confirmar caminho antigo."
} >> "$REV/resumo.md"

# Copia resumo para local previsível
mkdir -p /root/Multizap/revisoes/ultimos
cp "$REV/resumo.md" /root/Multizap/revisoes/ultimos/guarda-telegram-diagnostico.md
cp "$REV/logs/pm2-telegram.log" /root/Multizap/revisoes/ultimos/guarda-telegram-pm2.log
cp "$REV/logs/arquivos-telegram.log" /root/Multizap/revisoes/ultimos/guarda-telegram-arquivos.log
cp "$REV/logs/secrets-telegram.log" /root/Multizap/revisoes/ultimos/guarda-telegram-secrets.log

echo "Diagnóstico Telegram/Guarda concluído: $REV"
cat "$REV/resumo.md"

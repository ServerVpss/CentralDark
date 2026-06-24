#!/usr/bin/env bash
# 080 - Auditar quem ainda usa /root/Multizap/apps/clone-deck
# SOMENTE LEITURA. Nao move, nao apaga, nao reinicia nada.
set -uo pipefail

BASE="/root/Multizap"
ALVO="$BASE/apps/clone-deck"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/080-auditar-uso-clone-deck"
mkdir -p "$REV/dados"
R="$REV/resumo.md"

exec > >(tee -a "$REV/execucao.log") 2>&1

echo "# 080 - Auditoria de uso de apps/clone-deck" > "$R"
echo "Data: $(date)" >> "$R"
echo "Alvo: $ALVO" >> "$R"
echo "" >> "$R"

echo "## 1. Existencia e tamanho" >> "$R"
if [ -d "$ALVO" ]; then
  echo "- Pasta existe" >> "$R"
  echo "- Tamanho: $(du -sh "$ALVO" 2>/dev/null | awk '{print $1}')" >> "$R"
  echo "- Itens top-level:" >> "$R"
  echo '```' >> "$R"
  ls -la "$ALVO" 2>/dev/null | head -40 >> "$R"
  echo '```' >> "$R"
else
  echo "- Pasta NAO existe" >> "$R"
fi
echo "" >> "$R"

echo "## 2. PM2 - processos apontando para clone-deck" >> "$R"
echo '```' >> "$R"
pm2 jlist 2>/dev/null | python3 -c "
import sys,json
try:
  d=json.load(sys.stdin)
  achou=False
  for p in d:
    cwd=p['pm2_env'].get('pm_cwd','') or ''
    script=p['pm2_env'].get('pm_exec_path','') or ''
    if 'clone-deck' in cwd or 'clone-deck' in script:
      achou=True
      print(f\"USA: {p['name']}\")
      print(f\"  cwd:    {cwd}\")
      print(f\"  script: {script}\")
  if not achou: print('(nenhum processo PM2 referencia clone-deck)')
except Exception as e: print('erro:',e)
" 2>&1 >> "$R"
echo '```' >> "$R"
echo "" >> "$R"

echo "## 3. Caddy" >> "$R"
echo '```' >> "$R"
grep -rn "clone-deck" /etc/caddy/ 2>/dev/null | head -20 >> "$R" || echo "(sem referencias no Caddy)" >> "$R"
echo '```' >> "$R"
echo "" >> "$R"

echo "## 4. Symlinks apontando para dentro de clone-deck" >> "$R"
echo '```' >> "$R"
find /root/Multizap -maxdepth 6 -type l 2>/dev/null | while read l; do
  t=$(readlink -f "$l" 2>/dev/null || true)
  if echo "$t" | grep -q "clone-deck"; then echo "$l -> $t"; fi
done | head -40 >> "$R"
echo '```' >> "$R"
echo "" >> "$R"

echo "## 5. Cron / systemd" >> "$R"
echo '```' >> "$R"
grep -rn "clone-deck" /etc/cron.d/ /etc/crontab /var/spool/cron/ 2>/dev/null | head -20 >> "$R" || true
systemctl list-units --type=service --no-pager 2>/dev/null | grep -i clone-deck >> "$R" || true
echo '```' >> "$R"
echo "" >> "$R"

echo "## 6. Webhook de deploy ainda aponta pra clone-deck?" >> "$R"
echo '```' >> "$R"
grep -rn "clone-deck" /root/clone-deck-webhook* /root/Multizap/deploy-hooks /root/Multizap/scripts 2>/dev/null \
  | grep -v Binary | grep -v "/revisoes/" | head -30 >> "$R" || true
echo '```' >> "$R"
echo "" >> "$R"

echo "## 7. Git remote da pasta" >> "$R"
echo '```' >> "$R"
if [ -d "$ALVO/.git" ]; then
  cd "$ALVO"
  git remote -v 2>/dev/null >> "$R"
  echo "--- HEAD ---" >> "$R"
  git log --oneline -3 2>/dev/null >> "$R"
  echo "--- branch ---" >> "$R"
  git branch --show-current 2>/dev/null >> "$R"
fi
echo '```' >> "$R"
echo "" >> "$R"

echo "## 8. Comparacao apps/bot (oficial) vs apps/clone-deck/apps/bot" >> "$R"
echo '```' >> "$R"
echo "apps/bot existe? $([ -d "$BASE/apps/bot" ] && echo SIM || echo NAO)"  >> "$R"
echo "clone-deck/apps/bot existe? $([ -d "$ALVO/apps/bot" ] && echo SIM || echo NAO)"  >> "$R"
echo "clone-deck/apps/bot/skills existe? $([ -d "$ALVO/apps/bot/skills" ] && echo SIM || echo NAO)"  >> "$R"
echo "Multizap/skills (symlink)? $(readlink "$BASE/skills" 2>/dev/null || echo nao)"  >> "$R"
echo '```' >> "$R"
echo "" >> "$R"

echo "## Veredito sugerido" >> "$R"
echo "Se itens 2,3,5,6 nao listarem nada e item 4 listar apenas symlinks moviveis," >> "$R"
echo "a pasta pode ir para quarentena. Decidir apenas APOS revisao humana." >> "$R"

echo ""
echo "OK - relatorio: $R"

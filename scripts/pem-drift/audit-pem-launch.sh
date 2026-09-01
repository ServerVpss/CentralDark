#!/usr/bin/env bash
# PEM-DRIFT-AUDIT — Audit de todos os scripts de inicialização PEM/Calisto
# Inclui: crontab, startup, PM2, ecosystem, supervisor, systemd, scheduler
# ONE_WRITER_PER_SCOPE: pivete/work/pem-drift-rootcause

set -euo pipefail

echo "============================================================"
echo "PEM-LAUNCH-SCRIPTS AUDIT"
echo "Data: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
echo "Host: $(hostname 2>/dev/null || echo 'unknown')"
echo "============================================================"
echo ""

# 1. Crontab do usuário
echo ">>> [1] CRONTAB (usuário atual)"
echo "------------------------------------------------------------"
if command -v crontab &>/dev/null; then
    crontab -l 2>/dev/null || echo "(vazio ou sem acesso)"
else
    echo "(crontab não disponível)"
fi
echo ""

# 2. Crontab root (se tiver acesso)
echo ">>> [2] CRONTAB (root — se aplicável)"
echo "------------------------------------------------------------"
if [ -f /etc/crontab ]; then
    echo "/etc/crontab:"
    cat /etc/crontab 2>/dev/null || echo "(sem leitura)"
    echo ""
fi
if [ -d /etc/cron.d ]; then
    echo "/etc/cron.d/ (arquivos):"
    ls -la /etc/cron.d/ 2>/dev/null | grep -v '^total' || echo "(vazio ou sem acesso)"
    for f in /etc/cron.d/*; do
        [ -f "$f" ] && echo "--- $f ---" && cat "$f" 2>/dev/null
    done
fi
echo ""

# 3. Cron hora-a-hora, diário, semanal, mensal
echo ">>> [3] CRONTABS POR INTERVALO"
echo "------------------------------------------------------------"
for dir in /etc/cron.hourly /etc/cron.daily /etc/cron.weekly /etc/cron.monthly; do
    if [ -d "$dir" ]; then
        echo "--- $dir ---"
        ls -la "$dir" 2>/dev/null | grep -v '^total' || echo "(vazio)"
        for f in "$dir"/*; do
            [ -f "$f" ] && echo "==> $f <==" && head -30 "$f" 2>/dev/null
        done
    fi
done
echo ""

# 4. Systemd user services
echo ">>> [4] SYSTEMD USER SERVICES"
echo "------------------------------------------------------------"
if [ -d ~/.config/systemd/user ]; then
    echo "~/.config/systemd/user:"
    find ~/.config/systemd/user -name "*.service" -exec echo "==> {} <==" \; -exec cat {} \; 2>/dev/null || echo "(sem serviços ou sem acesso)"
else
    echo "(~/.config/systemd/user não existe)"
fi
echo ""

# 5. Systemd system services (se root)
echo ">>> [5] SYSTEMD SYSTEM SERVICES (relacionados a PEM/Calisto)"
echo "------------------------------------------------------------"
if [ -d /etc/systemd/system ]; then
    for f in /etc/systemd/system/*; do
        [ -f "$f" ] && grep -li "pem\|calisto\|centraldark\|mcp\|bot" "$f" 2>/dev/null && echo "==> $f <==" && cat "$f"
    done
fi
echo ""

# 6. PM2 processes salvos
echo ">>> [6] PM2 PROCESSOS SALVOS"
echo "------------------------------------------------------------"
if command -v pm2 &>/dev/null; then
    echo "pm2 list (ativo):"
    pm2 list 2>/dev/null || echo "(pm2 não roda ou sem acesso)"
    echo ""
    echo "pm2 jlist (JSON):"
    pm2 jlist 2>/dev/null | python3 -c "import sys,json;d=json.load(sys.stdin);[print(f\"  {p['name']}: status={p['status']}, restarts={p['pm2_env']['restart_time']}, uptime={p['pm2_env']['status']}\") for p in d]" 2>/dev/null || echo "(pm2 jlist falhou)"
    echo ""
    echo "pm2 save list:"
    pm2 list --json 2>/dev/null || true
else
    echo "(pm2 não instalado)"
fi
echo ""

# 7. Ecosystem config files
echo ">>> [7] ECOSYSTEM CONFIG FILES (PM2)"
echo "------------------------------------------------------------"
for f in ecosystem.config.js ecosystem.config.cjs ecosystem.config.json; do
    if [ -f "$f" ]; then
        echo "==> $f <=="
        cat "$f"
        echo ""
    fi
done
if [ -d apps ]; then
    for f in $(find apps -name "ecosystem.config.*" 2>/dev/null); do
        echo "==> $f <=="
        cat "$f"
        echo ""
    done
fi
echo ""

# 8. Arquivos de startup do sistema
echo ">>> [8] ARQUIVOS DE STARTUP DO SISTEMA"
echo "------------------------------------------------------------"
for f in /etc/rc.local /etc/init.d/* /etc/rc*.d/*; do
    if [ -f "$f" ]; then
        echo "==> $f <=="
        head -50 "$f" 2>/dev/null
        echo ""
    fi
done
echo ""

# 9. Startup scripts do usuário
echo ">>> [9] STARTUP SCRIPTS DO USUÁRIO"
echo "------------------------------------------------------------"
for d in ~/.startup ~/startup ~/.config/autostart; do
    if [ -d "$d" ]; then
        echo "--- $d ---"
        ls -la "$d" 2>/dev/null || true
        for f in "$d"/*; do
            [ -f "$f" ] && echo "==> $f <==" && head -30 "$f" 2>/dev/null
        done
    fi
done
echo ""

# 10. Arquivos que referenciam ~/.calisto
echo ">>> [10] ARQUIVOS QUE MEXEM EM ~/.CALISTO"
echo "------------------------------------------------------------"
find / -maxdepth 4 -name "*.sh" -o -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.yml" -o -name "*.yaml" 2>/dev/null | while read -r f; do
    if grep -ql "calisto\|\.calisto" "$f" 2>/dev/null; then
        echo "==> $f <=="
        grep -n "calisto\|\.calisto" "$f" 2>/dev/null | head -20
        echo ""
    fi
done || echo "(nenhum encontrado ou sem acesso)"
echo ""

# 11. Systemd timers
echo ">>> [11] SYSTEMD TIMERS"
echo "------------------------------------------------------------"
if command -v systemctl &>/dev/null; then
    systemctl list-timers --user 2>/dev/null || echo "(sem timers do usuário)"
    echo ""
    systemctl list-timers 2>/dev/null | grep -i "pem\|calisto\|centraldark\|mcp\|bot" || echo "(nenhum timer relevante encontrado)"
else
    echo "(systemctl não disponível)"
fi
echo ""

# 12. Supervisor
echo ">>> [12] SUPERVISOR"
echo "------------------------------------------------------------"
for cmd in supervisorctl supervisor; do
    if command -v "$cmd" &>/dev/null; then
        echo "$cmd status:"
        "$cmd" status 2>/dev/null || echo "(sem acesso)"
        echo ""
    fi
done || echo "(supervisor não instalado)"
echo ""

echo "============================================================"
echo "AUDIT COMPLETO"
echo "============================================================"

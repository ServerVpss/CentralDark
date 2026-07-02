#!/usr/bin/env bash
set -euo pipefail

# --- Resolução automática do Graphify (binário ou módulo Python) ---
export PATH="$HOME/.local/bin:$PATH"
if command -v graphify >/dev/null 2>&1; then
    GRAPHIFY_CMD="graphify"
elif python3 -c "import graphify" >/dev/null 2>&1; then
    GRAPHIFY_CMD="python3 -m graphify"
else
    echo "❌ Graphify não encontrado. Instale com: pip install --user graphifyy" >&2
    exit 127
fi
echo "🔧 Usando: $GRAPHIFY_CMD"

SESSION="graphify_master"
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🔥  CENTRAL DARK  •  MASTER GRAPHIFY PIPELINE v3.0  •  2026             ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════════╝${NC}"

# 1. Limpeza segura (não mata o próprio script)
echo -e "\n${YELLOW}🧹 Limpando execuções anteriores...${NC}"
pkill -f "$GRAPHIFY_CMD cluster-only" || true
pkill -f "$GRAPHIFY_CMD label" || true
pkill -f "$GRAPHIFY_CMD extract" || true
sleep 1
rm -rf /root/CentralDark/graphify-out 2>/dev/null || true
rm -f /root/CentralDark/cluster.log /root/CentralDark/label.log 2>/dev/null || true
echo -e "${GREEN}✓ Limpeza concluída.${NC}"

# 2. Configuração de autenticação (Proxy)
echo -e "\n${YELLOW}🔐 Configurando Graphify para usar o Proxy...${NC}"
mkdir -p ~/.config/graphify
cat > ~/.config/graphify/config.json << 'EOF'
{
  "provider": "anthropic",
  "api_key": "proxy",
  "base_url": "http://localhost:8082",
  "model": "sonnet-4.6[1m]"
}
EOF
echo -e "${GREEN}✓ Graphify configurado para usar o proxy (elite-anthropic-proxy).${NC}"

# 3. Preparar tmux
echo -e "\n${YELLOW}🧩 Preparando sessão tmux com 2 janelas...${NC}"
tmux kill-session -t "$SESSION" 2>/dev/null || true
tmux new-session -d -s "$SESSION" -n pipeline
tmux new-window -t "$SESSION:1" -n monitor
echo -e "${GREEN}✓ Sessão tmux criada (pipeline + monitor).${NC}"

# 4. Janela "pipeline" - Executa o pipeline completo
tmux send-keys -t "$SESSION:pipeline" "cd /root/CentralDark" C-m
tmux send-keys -t "$SESSION:pipeline" "
echo -e '\033[1;36m═══════════════════════════════════════════════════════════════\033[0m'
echo -e '\033[1;36m🚀 INICIANDO PIPELINE: cluster-only → label\033[0m'
echo -e '\033[1;36m═══════════════════════════════════════════════════════════════\033[0m'
echo ''
echo '>>> Fase 1/2: Cluster-Only'
$GRAPHIFY_CMD cluster-only . 2>&1 | tee cluster.log
CLUSTER_EXIT=\${PIPESTATUS[0]}

if [ \$CLUSTER_EXIT -ne 0 ]; then
    echo ''
    echo -e '\033[0;31m❌ Cluster-only falhou (exit code:' \$CLUSTER_EXIT ')\033[0m'
    exit \$CLUSTER_EXIT
fi

echo ''
echo -e '\033[0;32m✅ Cluster-only concluído com sucesso!\033[0m'
echo ''
echo '>>> Fase 2/2: Labeling'
$GRAPHIFY_CMD label . 2>&1 | tee label.log
LABEL_EXIT=\${PIPESTATUS[0]}

if [ \$LABEL_EXIT -ne 0 ]; then
    echo ''
    echo -e '\033[0;31m❌ Labeling falhou (exit code:' \$LABEL_EXIT ')\033[0m'
    exit \$LABEL_EXIT
fi

echo ''
echo -e '\033[1;32m═══════════════════════════════════════════════════════════════\033[0m'
echo -e '\033[1;32m🎯 PIPELINE FINALIZADO COM SUCESSO!\033[0m'
echo -e '\033[1;32m═══════════════════════════════════════════════════════════════\033[0m'
echo ''
ls -lh graphify-out/ 2>/dev/null || echo 'graphify-out/ gerado com sucesso.'
" C-m

# 5. Janela "monitor" - Monitor colorido automático
tmux send-keys -t "$SESSION:monitor" "cd /root/CentralDark" C-m
tmux send-keys -t "$SESSION:monitor" "
watch --color -n 2 '
echo -e \"\033[1;36m╔════════════════════════════════════════════════════════════════════════════╗\"
echo -e \"║   📊  CENTRAL DARK  •  GRAPHIFY PIPELINE  •  MONITORAMENTO EM TEMPO REAL   ║\"
echo -e \"╚════════════════════════════════════════════════════════════════════════════╝\033[0m\"
echo \"\"
echo -e \"\033[1;33m▶ STATUS ATUAL\033[0m\"
if pgrep -f \"$GRAPHIFY_CMD cluster-only\" > /dev/null; then
    echo -e \"   \033[32m● CLUSTER-ONLY RODANDO\033[0m\"
elif pgrep -f \"$GRAPHIFY_CMD label\" > /dev/null; then
    echo -e \"   \033[32m● LABELING RODANDO\033[0m\"
else
    echo -e \"   \033[90m● Finalizado ou aguardando\033[0m\"
fi
echo \"\"
echo -e \"\033[1;33m📜 cluster.log (últimas linhas)\033[0m\"
echo -e \"\033[90m────────────────────────────────────────────────────────────────────────────\033[0m\"
tail -n 10 cluster.log 2>/dev/null | while read line; do
    if echo \"\$line\" | grep -qi \"error\|fail\|invalid\|hollow\"; then
        echo -e \"\033[31m\$line\033[0m\"
    else
        echo \"\$line\"
    fi
done
echo -e \"\033[90m────────────────────────────────────────────────────────────────────────────\033[0m\"
echo \"\"
echo -e \"\033[1;33m📜 label.log (últimas linhas)\033[0m\"
echo -e \"\033[90m────────────────────────────────────────────────────────────────────────────\033[0m\"
tail -n 10 label.log 2>/dev/null | while read line; do
    if echo \"\$line\" | grep -qi \"error\|fail\|invalid\"; then
        echo -e \"\033[31m\$line\033[0m\"
    elif echo \"\$line\" | grep -qi \"done\|success\|labeled\"; then
        echo -e \"\033[32m\$line\033[0m\"
    else
        echo \"\$line\"
    fi
done
echo -e \"\033[90m────────────────────────────────────────────────────────────────────────────\033[0m\"
echo \"\"
echo -e \"\033[1;35m⏱️  Atualizado: \$(date \"+%H:%M:%S\")\033[0m\"
'
" C-m

# 6. Abre o tmux
tmux select-window -t "$SESSION:pipeline"
sleep 1
tmux attach-session -t "$SESSION"

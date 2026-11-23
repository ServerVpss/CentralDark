#!/bin/bash
# ═════════════════════════════════════════════════════════════
# get-infra-map.sh — Gera mapa vivo dos 22+ serviços da VPS
# Fonte única de verdade: PM2 + Docker + systemd + portas
# Uso: bash scripts/get-infra-map.sh > docs/CONSCIENCIA/INFRA-MAP.md
# ═════════════════════════════════════════════════════════════
DATA=$(date -Iseconds)
cat <<EOF
# 🗺️ Mapa Vivo de Infraestrutura CentralDark

> **Gerado automaticamente em:** $DATA
> **Fonte:** \`scripts/get-infra-map.sh\` (roda \`pm2\`+\`docker\`+\`systemctl\`+\`ss\`)
> **Regenerar:** \`bash scripts/get-infra-map.sh > docs/CONSCIENCIA/INFRA-MAP.md\`

## 🚀 Serviços PM2 (Node.js)

\`\`\`
$(pm2 ls --no-color 2>/dev/null | sed 's/\x1B\[[0-9;]*[JKmsu]//g')
\`\`\`

## 🐳 Serviços Docker (containers)

\`\`\`
$(docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null)
\`\`\`

## ⚙️ Serviços systemd (relevantes)

\`\`\`
$(systemctl list-units --type=service --state=running --no-pager --no-legend 2>/dev/null | grep -Ei 'runner|caddy|nginx|actions' | head -10)
\`\`\`

## 🔌 Portas em uso (LISTEN)

\`\`\`
$(ss -tlnp 2>/dev/null | awk '/LISTEN/ {gsub(/users:|\(|\)|"/,"",$6); printf "%-30s %s\n", $4, $6}' | sort -u)
\`\`\`

## 📊 Resumo

- **PM2:** $(pm2 jlist 2>/dev/null | python3 -c 'import json,sys;print(len(json.load(sys.stdin)))') processos
- **Docker:** $(docker ps -q 2>/dev/null | wc -l) containers
- **systemd (relevantes):** $(systemctl list-units --type=service --state=running --no-pager --no-legend 2>/dev/null | grep -Eci 'runner|caddy|nginx|actions') serviços
- **Portas LISTEN únicas:** $(ss -tln 2>/dev/null | awk '/LISTEN/ {print $4}' | sort -u | wc -l)

---
_Este arquivo é regerado a cada execução. NÃO editar manualmente._
EOF

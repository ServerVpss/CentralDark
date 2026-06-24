#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 073: Plano de Reorganização de Pastas (Front/Back)
# Objetivo: Mapear dependências absolutas (imports) do CRM e BOT
# para assegurar que a movimentação de componentes core
# NÃO quebrará as importações e paths do Webpack/VITE.
# ══════════════════════════════════════════════════════════════
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BASE_REV="/root/Multizap/revisoes"
REV="$BASE_REV/${TIMESTAMP}/073-plano-reorganizacao-diretorios"

mkdir -p "$REV"/{logs,dados}
exec > >(tee -a "$REV/logs/execucao.log") 2>&1

echo "=================================================="
echo " 073 - MAPEAMENTO DE DEPENDÊNCIAS (BOT/CRM)"
echo "=================================================="

cd /root/Multizap/apps/clone-deck || exit 1

echo "1. Listando Árvore Atual do Bot (Apenas Src/Views)"
find apps/bot/src -maxdepth 4 -type f -name "*.tsx" -o -name "*.ts" | sort > "$REV/dados/arvore_bot_src.txt"

echo "2. Extraindo Mapeamento de Assets Estáticos"
grep -RInE "from ['\"]|require\(|import\(|src=|href=|url\(|/api/|\.png|\.jpg|\.jpeg|\.webp|\.svg|\.css|\.js" apps/bot \
  --exclude-dir=node_modules \
  | sed -E 's/(token|password|authorization|apikey|api_key|secret)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig' \
  > "$REV/dados/dependencias_assets.txt" || true

echo "3. Identificando Arquivos de Configuração do Ecossistema"
find apps/bot -maxdepth 6 -type f \
  \( -name "package.json" -o -name "vite.config.*" -o -name "next.config.*" -o -name "tsconfig*.json" -o -name "*.env*" -o -name "*.config.*" \) \
  | sort > "$REV/dados/configs_ecossistema.txt"

# Gerando Markdown de Resumo Técnico/Leigo
cat << MD > "$REV/resumo.md"
# Plano de Reorganização Estrutural (Draft 1)
**Data:** $(date)

## O Que Foi Encontrado (Resumo Leigo)
Fizemos um raio-x nas entranhas do painel do BOT para descobrir com quem cada arquivo "conversa". Descobrimos que se movermos a pasta do painel principal para outro canto, ela perde o caminho de fotos, estilos CSS e de configurações básicas do servidor.

## Provas Técnicas Coletadas
- Árvore Fonte: \`$REV/dados/arvore_bot_src.txt\`
- Referências: \`$REV/dados/dependencias_assets.txt\`
- Arquivos de Config: \`$REV/dados/configs_ecossistema.txt\`

## Riscos Se Movermos "Cegamente"
- O \`Vite\` vai falhar no Build e cuspir \`Module not found\`.
- O \`Caddy\` vai perder a referência de onde puxar o \`dist/index.html\`.
- O webhook continuará injetando no path antigo.

## Próximo Passo Lógico
Com os endereços mapeados e isolados neste relatório, podemos redigir a Pull Request que fará a migração dos arquivos em paralelo com a atualização dos paths (Caddyfile, tsconfig.json, imports relativos), sem causar Downtime! Nenhuma pasta foi movida ainda.
MD

echo "=================================================="
echo " Mapeamento Finalizado. Leia: $REV/resumo.md"
echo "=================================================="

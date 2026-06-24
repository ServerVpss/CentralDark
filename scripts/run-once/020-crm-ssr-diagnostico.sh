#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 020: Diagnóstico CRM SSR
#
# Objetivo: Descobrir por que o CRM está rodando em Python
#           SimpleHTTP fallback na porta 3010 em vez de
#           TanStack Start SSR real.
#
# Regras:
#   - NÃO corrigir ainda
#   - NÃO trocar Python fallback
#   - NÃO mexer em Caddy
#   - NÃO mexer em WuzAPI
#   - NÃO reiniciar PM2
#   - NÃO rodar post-deploy
#   - NÃO rodar run-once-executor
#   - NÃO instalar nada global
#   - NÃO usar pm2 restart all
#   - NÃO publicar build em produção
#   - Se build passar, NÃO iniciar SSR ainda
#   - Se build passar, NÃO parar Python fallback
# ══════════════════════════════════════════════════════════════
set -uo pipefail

CLONE_DECK="/root/Multizap/apps/clone-deck"
CRM_DIR="$CLONE_DECK/apps/crm"
REV="/root/Multizap/revisoes/$(date +%Y%m%d-%H%M%S)/crm-ssr-diagnostico"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
DIAG="$REV/diagnostico"
LOGS="$REV/logs"

mkdir -p "$REV" "$DIAG" "$LOGS"
exec > >(tee -a "$LOGS/execucao.log") 2>&1

echo "══════════════════════════════════════════════════"
echo " CRM SSR — Diagnóstico"
echo " Data: $TIMESTAMP"
echo " Revisão: $REV"
echo " ⚠️  APENAS DIAGNÓSTICO — NENHUMA CORREÇÃO"
echo "══════════════════════════════════════════════════"
echo ""

ERRO_FINAL=false
BUILD_EXIT=""
BUILD_SUCESSO=false

# ══════════════════════════════════════════════════════════════
# ETAPA 1 — DIAGNÓSTICO PURO
# ══════════════════════════════════════════════════════════════
echo "══════════ ETAPA 1: DIAGNÓSTICO PURO ══════════"
echo ""

# ── 1a. Commit ──────────────────────────────────
echo "─── 1a. Commit ───"
cd "$CLONE_DECK" 2>/dev/null || { echo "❌ Repo não encontrado"; exit 1; }
git log --oneline -8 > "$DIAG/git-log.txt" 2>&1
cat "$DIAG/git-log.txt"
echo ""
git status --short > "$DIAG/git-status.txt" 2>&1
echo "Git status:"
cat "$DIAG/git-status.txt"
echo ""

# ── 1b. Sistema ─────────────────────────────────
echo "─── 1b. Sistema ───"
echo "Node: $(node -v 2>/dev/null || echo 'ausente')"
echo "NPM: $(npm -v 2>/dev/null || echo 'ausente')"
echo "Bun: $(command -v bun 2>/dev/null && bun -v || echo 'ausente')"
echo ""
echo "Memória:"
free -h > "$DIAG/memoria.txt" 2>&1
cat "$DIAG/memoria.txt"
echo ""
echo "Swap:"
swapon --show > "$DIAG/swap.txt" 2>&1
if [ -s "$DIAG/swap.txt" ]; then
  cat "$DIAG/swap.txt"
else
  echo "SEM SWAP ATIVO"
fi
echo ""
echo "Disco:"
df -h / > "$DIAG/disco.txt" 2>&1
cat "$DIAG/disco.txt" | head -3
echo ""

# ── 1c. Config CRM ──────────────────────────────
echo "─── 1c. Config CRM ───"
cd "$CRM_DIR" 2>/dev/null || { echo "❌ apps/crm não encontrado"; }
echo "package.json scripts:"
python3 -c "
import sys, json
d = json.load(open('package.json'))
s = d.get('scripts', {})
for k,v in s.items():
    print(f'  {k}: {v}')
print(f'Total dependencias: {len(d.get(\"dependencies\",{}))}')
print(f'Type: {d.get(\"type\",\"N/A\")}')
" 2>/dev/null | tee "$DIAG/package-scripts.txt"

echo ""
echo "vite.config.ts:"
cat vite.config.ts 2>/dev/null | tee "$DIAG/vite-config.txt"

echo ""
echo "wrangler.jsonc:"
if [ -f "wrangler.jsonc" ]; then
  cat wrangler.jsonc | tee "$DIAG/wrangler-config.txt"
else
  echo "(não existe)"
fi

echo ""
echo "src/server.ts (primeiras 120 linhas):"
if [ -f "src/server.ts" ]; then
  sed -n '1,120p' src/server.ts | tee "$DIAG/server-entry.txt"
else
  echo "❌ src/server.ts NÃO EXISTE"
fi
echo ""

# ── 1d. Estrutura de pastas ─────────────────────
echo "─── 1d. Estrutura ───"
echo "Primeiros 200 arquivos (nível 1-2):"
find . -maxdepth 2 -type f | sort | head -200 | tee "$DIAG/estrutura.txt"
echo ""
echo "dist/ (se existir):"
if [ -d "dist" ]; then
  find dist -maxdepth 4 -type f 2>/dev/null | head -120 | tee "$DIAG/dist-estrutura.txt"
else
  echo "❌ dist/ NÃO EXISTE (nunca buildou)"
fi
echo ""
echo ".output/ (se existir):"
if [ -d ".output" ]; then
  find .output -maxdepth 4 -type f 2>/dev/null | head -120 | tee "$DIAG/output-estrutura.txt"
else
  echo "❌ .output/ NÃO EXISTE (nunca buildou SSR)"
fi

# Verificar lockfiles
echo ""
echo "Lockfiles:"
[ -f "bun.lock" ] && echo "  bun.lock: $(wc -c < bun.lock) bytes" || echo "  bun.lock: ausente"
[ -f "package-lock.json" ] && echo "  package-lock.json: $(wc -c < package-lock.json) bytes" || echo "  package-lock.json: ausente"
echo ""

# ── 1e. Logs existentes ─────────────────────────
echo "─── 1e. Logs existentes ───"
echo "Log de build (/var/log/clone-deck-build-crm.log):"
if [ -f /var/log/clone-deck-build-crm.log ]; then
  tail -200 /var/log/clone-deck-build-crm.log 2>/dev/null | tee "$DIAG/build-log-existente.txt"
else
  echo "(não existe)"
fi

echo ""
echo "PM2 describe CloneDeck-CRM:"
pm2 describe CloneDeck-CRM 2>&1 | tee "$DIAG/pm2-describe.txt"

echo ""
echo "PM2 logs CloneDeck-CRM (últimas 120):"
pm2 logs CloneDeck-CRM --lines 120 --nostream 2>&1 | tee "$DIAG/pm2-logs-crm.txt" || echo "(sem logs)"

echo ""
echo "Portas:"
ss -ltnp 2>&1 | grep -E ':3010|:3100|:9003|:8081|:80|:443' | tee "$DIAG/portas.txt"
echo ""

# ── 1f. Rotas atuais ────────────────────────────
echo "─── 1f. Rotas atuais ───"
for rota in "/" "/auth" "/pix"; do
  CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 15 "https://crm.multizap.dev${rota}" 2>/dev/null || echo "000")
  echo "  GET https://crm.multizap.dev${rota} → HTTP $CODE"
done | tee "$DIAG/rotas.txt"
echo ""

# ── 1g. .env (nomes apenas) ─────────────────────
echo "─── 1g. Env vars ───"
for env_file in .env .env.local .env.production; do
  if [ -f "$env_file" ]; then
    echo "--- $env_file ---"
    grep -v '^#' "$env_file" 2>/dev/null | grep -v '^\s*$' | cut -d= -f1 | sort | while read var; do
      echo "  $var=EXISTE"
    done
    echo ""
  fi
done | tee "$DIAG/env-nomes.txt"

# Procurar env em outros locais
for alt in ../../.env ../../.env.local; do
  [ -f "$alt" ] && echo "$alt: existe" || true
done >> "$DIAG/env-nomes.txt" 2>/dev/null

# ══════════════════════════════════════════════════════════════
# ETAPA 2 — TENTATIVA DE BUILD SEGURA
# ══════════════════════════════════════════════════════════════
echo ""
echo "══════════ ETAPA 2: TENTATIVA DE BUILD SEGURA ══════════"
echo ""

cd "$CRM_DIR" 2>/dev/null || exit 1

# Pré-requisitos
echo "─── 2a. Pré-requisitos ───"
echo "node_modules: $([ -d "node_modules" ] && echo "EXISTE ($(find node_modules -maxdepth 1 -type d | wc -l) pastas)" || echo "AUSENTE")"
echo "package-lock.json: $([ -f "package-lock.json" ] && echo "EXISTE" || echo "AUSENTE")"
echo "bun.lock: $([ -f "bun.lock" ] && echo "EXISTE" || echo "AUSENTE")"
echo "npm run build: $(grep -c '"build"' package.json 2>/dev/null || echo 'não encontrado')"
echo ""

# 2b. Install
echo "─── 2b. npm install ───"
echo "Rodando: npm install --no-audit --no-fund --package-lock=false"
echo "Timeout: 300s"
echo ""

INSTALL_INICIO=$(date +%s)
timeout 300 npm install --no-audit --no-fund --package-lock=false > "$LOGS/install.log" 2>&1
INSTALL_EXIT=$?
INSTALL_FIM=$(date +%s)
INSTALL_DURACAO=$((INSTALL_FIM - INSTALL_INICIO))
echo "Install exit: $INSTALL_EXIT (duração: ${INSTALL_DURACAO}s)"
tail -10 "$LOGS/install.log"
echo ""

# 2c. Build
echo "─── 2c. npm run build ───"
echo "Rodando: NODE_OPTIONS=--max-old-space-size=4096 npm run build"
echo "Timeout: 900s (15 minutos)"
echo ""

BUILD_INICIO=$(date +%s)
timeout 900 bash -c "NODE_OPTIONS=--max-old-space-size=4096 npm run build" > "$LOGS/build.log" 2>&1
BUILD_EXIT=$?
BUILD_FIM=$(date +%s)
BUILD_DURACAO=$((BUILD_FIM - BUILD_INICIO))
echo "Build exit: $BUILD_EXIT (duração: ${BUILD_DURACAO}s)"
echo ""

# 2d. Análise do resultado
echo "─── 2d. Análise do resultado ───"

if [ $BUILD_EXIT -eq 0 ]; then
  BUILD_SUCESSO=true
  echo "✅ BUILD PASSOU!"
  
  # Valida artefatos
  echo ""
  echo "Validando artefatos de produção:"
  echo "  .output/server/index.mjs: $([ -f ".output/server/index.mjs" ] && echo "✅ EXISTE" || echo "❌ AUSENTE")"
  echo "  dist/: $([ -d "dist" ] && echo "✅ EXISTE ($(find dist -type f 2>/dev/null | wc -l) arquivos)" || echo "❌ AUSENTE")"
  echo "  .output/: $([ -d ".output" ] && echo "✅ EXISTE ($(find .output -type f 2>/dev/null | wc -l) arquivos)" || echo "❌ AUSENTE")"
  
  # Lista estrutura do output
  echo ""
  echo "Estrutura .output/:"
  find .output -maxdepth 4 -type f 2>/dev/null | head -40 | tee "$DIAG/output-buildado.txt" || echo "(vazio)"
else
  BUILD_SUCESSO=false
  echo "❌ BUILD FALHOU (exit=$BUILD_EXIT)"
  
  # Classifica erro
  echo ""
  echo "Classificando erro:"
  ERROR_LOG=$(tail -60 "$LOGS/build.log")
  
  if [ $BUILD_EXIT -eq 124 ]; then
    echo "  🔴 TIMEOUT — build excedeu 900s"
    echo "  causa: TIMEOUT" > "$DIAG/causa-erro.txt"
  elif [ $BUILD_EXIT -eq 137 ]; then
    echo "  🔴 OOM (out of memory) — processo foi morto pelo kernel"
    echo "  causa: OOM" > "$DIAG/causa-erro.txt"
  elif echo "$ERROR_LOG" | grep -qi "heap out of memory"; then
    echo "  🔴 JavaScript heap out of memory"
    echo "  causa: HEAP_OOM" > "$DIAG/causa-erro.txt"
  elif echo "$ERROR_LOG" | grep -qi "enoent\|no such file"; then
    echo "  🔴 Arquivo faltando"
    echo "$ERROR_LOG" | grep -i "enoent" | head -5
    echo "  causa: ENOENT" > "$DIAG/causa-erro.txt"
  elif echo "$ERROR_LOG" | grep -qi "module not found\|cannot find module"; then
    echo "  🔴 Módulo não encontrado"
    echo "$ERROR_LOG" | grep -i "cannot find\|module not found" | head -5
    echo "  causa: MODULE_NOT_FOUND" > "$DIAG/causa-erro.txt"
  elif echo "$ERROR_LOG" | grep -qi "workerd\|cloudflare"; then
    echo "  🔴 Erro relacionado a Cloudflare/Workerd"
    echo "  causa: CLOUDFLARE" > "$DIAG/causa-erro.txt"
  elif echo "$ERROR_LOG" | grep -qi "vite\|rollup\|nitro\|tanstack"; then
    echo "  ⚠️ Erro no build tool (Vite/Nitro/TanStack)"
    echo "  causa: BUILD_TOOL" > "$DIAG/causa-erro.txt"
  else
    echo "  ⚠️ Erro não classificado"
    echo "  causa: DESCONHECIDA" > "$DIAG/causa-erro.txt"
  fi
  
  echo ""
  echo "Últimas 60 linhas do build:"
  echo "$ERROR_LOG"
fi

# ══════════════════════════════════════════════════════════════
# ETAPA 3 — RELATÓRIO
# ══════════════════════════════════════════════════════════════
echo ""
echo "══════════ ETAPA 3: RELATÓRIO ══════════"
echo ""

# ── sistema.md ──────────────────────────────────
cat > "$DIAG/sistema.md" << SISTEMA
# Sistema

- Node: $(node -v 2>/dev/null || echo 'ausente')
- NPM: $(npm -v 2>/dev/null || echo 'ausente')
- Bun: $(command -v bun 2>/dev/null && bun -v || echo 'ausente')

$(free -h 2>/dev/null | tail -2 | while read -r line; do echo "- $line"; done)

$(swapon --show 2>/dev/null | tail -1 | while read -r line; do [ -n "$line" ] && echo "- Swap: $line" || echo "- Swap: INATIVO"; done)
SISTEMA

# ── crm-config.md ───────────────────────────────
cat > "$DIAG/crm-config.md" << CRMCFG
# Configuração do CRM

- Framework: TanStack Start
- SSR: Nitro node-server preset
- Build script: NODE_OPTIONS=--max-old-space-size=4096 vite build
- Server entry: src/server.ts
- Wrangler presente: $( [ -f "$CRM_DIR/wrangler.jsonc" ] && echo "sim" || echo "nao")
- Dependências: $(python3 -c "import json;print(len(json.load(open('$CRM_DIR/package.json')).get('dependencies',{})))" 2>/dev/null || echo "?")
- bun.lock: $( [ -f "$CRM_DIR/bun.lock" ] && echo "sim ($(wc -c < "$CRM_DIR/bun.lock") bytes)" || echo "nao")
- package-lock.json: $( [ -f "$CRM_DIR/package-lock.json" ] && echo "sim" || echo "nao")
- node_modules: $( [ -d "$CRM_DIR/node_modules" ] && echo "sim" || echo "nao")
- .output: $( [ -d "$CRM_DIR/.output" ] && echo "sim" || echo "nao")
- dist: $( [ -d "$CRM_DIR/dist" ] && echo "sim" || echo "nao")
CRMCFG

# ── pm2-atual.md ────────────────────────────────
pm2 describe CloneDeck-CRM 2>&1 > "$DIAG/pm2-atual.md" || echo "CloneDeck-CRM não encontrado" > "$DIAG/pm2-atual.md"

# ── build-result.md ─────────────────────────────
cat > "$DIAG/build-result.md" << BUILDR
# Resultado do Build

- Build exit: ${BUILD_EXIT:-não executado}
- Build sucesso: $BUILD_SUCESSO
- Duração: ${BUILD_DURACAO:-0}s

$(if [ "$BUILD_SUCESSO" = true ]; then
  echo "- .output/server/index.mjs: $( [ -f "$CRM_DIR/.output/server/index.mjs" ] && echo 'EXISTE' || echo 'AUSENTE')"
  echo "- .output total: $(find "$CRM_DIR/.output" -type f 2>/dev/null | wc -l) arquivos"
  echo "- dist total: $(find "$CRM_DIR/dist" -type f 2>/dev/null | wc -l) arquivos"
else
  echo "- Causa: $(cat "$DIAG/causa-erro.txt" 2>/dev/null || echo 'desconhecida')"
fi)
BUILDR

# ── rotas.md ────────────────────────────────────
cat "$DIAG/rotas.txt" > "$DIAG/rotas.md" 2>/dev/null

# ── causa-provavel.md ───────────────────────────
cat > "$DIAG/causa-provavel.md" << CAUSA
# Causa Provável

## Status atual
O CRM está rodando em Python SimpleHTTP fallback na porta 3010.
O build SSR (TanStack Start + Nitro) nunca foi bem-sucedido.

$(if [ "$BUILD_SUCESSO" = true ]; then
  echo "## Build SSR passou"
  echo "O build foi bem-sucedido. O .output/server/index.mjs existe."
  echo "O Python fallback PODE ser substituído pelo SSR real."
  echo ""
  echo "### Comando para iniciar SSR:"
  echo "cd $CRM_DIR"
  echo "node .output/server/index.mjs"
else
  echo "## Build SSR falhou"
  echo "Causa: $(cat "$DIAG/causa-erro.txt" 2>/dev/null || echo 'desconhecida')"
  echo "Detalhes completos em build-result.md e logs/build.log"
fi)
CAUSA

# ── proxima-correcao-segura.md ──────────────────
cat > "$DIAG/proxima-correcao-segura.md" << CORRECAO
# Próxima Correção Segura

$(if [ "$BUILD_SUCESSO" = true ]; then
  echo "1. O build SSR passou. O Python fallback PODE ser substituído."
  echo "2. Criar run-once 021 para iniciar SSR:"
  echo "   - Parar CloneDeck-CRM (Python fallback)"
  echo "   - Iniciar SSR: pm2 start .output/server/index.mjs --name CloneDeck-CRM-SSR"
  echo "   - Testar rotas /, /auth, /pix"
  echo "   - Se funcionar, remover fallback Python"
else
  echo "1. O build SSR falhou. Resolver o erro antes de tentar substituir o fallback."
  echo "2. Causa específica: $(cat "$DIAG/causa-erro.txt" 2>/dev/null || echo 'desconhecida')"
  echo "3. Próximo passo depende da causa:"
  echo "   - OOM: criar swap de 4GB e tentar novamente"
  echo "   - Módulo faltando: npm install específico"
  echo "   - Config: corrigir vite.config.ts ou wrangler"
  echo "4. Enquanto não resolver, o fallback Python continua seguro."
fi)

## Regras
- NÃO trocar Caddy
- NÃO parar WuzAPI
- NÃO usar pm2 restart all
- NÃO resetar sessão WhatsApp
- NÃO mexer em outros processos
CORRECAO

# ── resumo.md ───────────────────────────────────
cat > "$REV/resumo.md" << RESUMO
# Diagnóstico CRM SSR

**Data:** $TIMESTAMP
**Revisão:** $REV
**Tipo:** APENAS DIAGNÓSTICO — nenhuma correção foi aplicada

## Resumo

| Item | Resultado |
|------|-----------|
| Build exit | ${BUILD_EXIT:-não executado} |
| Build sucesso | $BUILD_SUCESSO |
| Runtime correto | TanStack Start + Nitro (node-server) |
| Artefato correto | .output/server/index.mjs |
| Atual | Python SimpleHTTP fallback (:3010) |
| Pode substituir? | $( [ "$BUILD_SUCESSO" = true ] && echo "SIM" || echo "NÃO — build falhou") |

## Diagnóstico

$(if [ "$BUILD_SUCESSO" = true ]; then
  echo "- Build SSR passou"
  echo "- .output/server/index.mjs EXISTE"
  echo "- Proxima etapa: run-once 021 para substituir fallback por SSR"
else
  echo "- Build SSR falhou (exit=$BUILD_EXIT)"
  echo "- Causa: $(cat "$DIAG/causa-erro.txt" 2>/dev/null || echo 'desconhecida')"
  echo "- Fallback Python mantido por enquanto"
fi)

## Arquivos gerados

- sistema.md
- crm-config.md
- pm2-atual.md
- build-result.md
- rotas.md
- causa-provavel.md
- proxima-correcao-segura.md
- logs/ (install.log, build.log, execucao.log)
- diagnostico/ (demais coletas)

## Próximo passo

$(if [ "$BUILD_SUCESSO" = true ]; then
  echo "021 - Substituir Python fallback por SSR real no CRM"
else
  echo "Corrigir causa do erro de build antes de tentar substituir fallback"
fi)
RESUMO

echo ""
echo "══════════════════════════════════════════════════"
echo " ✅ DIAGNÓSTICO CONCLUÍDO"
echo " 📁 Revisão: $REV"
echo " ⚠️  NENHUMA CORREÇÃO FOI APLICADA"
if [ "$BUILD_SUCESSO" = true ]; then
  echo " ✅ Build SSR PASSOU — .output/server/index.mjs existe"
  echo " ⏳ Aguardando autorização para substituir fallback"
else
  echo " ❌ Build SSR falhou (exit=${BUILD_EXIT:-?})"
  echo " 📋 Causa: $(cat "$DIAG/causa-erro.txt" 2>/dev/null || echo 'desconhecida')"
fi
echo "══════════════════════════════════════════════════"
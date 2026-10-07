#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN: Bot build com fallback npm
#
# Objetivo: Corrigir build do Bot (bun ausente → npm fallback)
#
# Regras:
#   - NÃO usa pm2 restart all
#   - NÃO para WuzAPI
#   - NÃO reseta sessão WhatsApp
#   - NÃO altera CRM
#   - NÃO altera Caddy
#   - Backup antes de publicar
#   - Só publica se build passar
# ══════════════════════════════════════════════════════════════
set -uo pipefail

CLONE_DECK="/root/Multizap/apps/clone-deck"
BOT_DIR="$CLONE_DECK/apps/bot"
PUBLIC_BOT="/var/www/multizap/bot"
REV="/root/Multizap/revisoes/$(date +%Y%m%d-%H%M%S)/bot-build-npm-fallback"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p "$REV"/{logs,backup}
exec > >(tee -a "$REV/logs/execucao.log") 2>&1

echo "══════════════════════════════════════════════════"
echo " BOT BUILD — fallback npm"
echo " Data: $TIMESTAMP"
echo " Revisão: $REV"
echo "══════════════════════════════════════════════════"
echo ""

ERRO_FINAL=0

# ── 1. DIAGNÓSTICO ──────────────────────────────
echo "═══ [1/7] Diagnóstico ═══"
echo "Node: $(node -v 2>/dev/null || echo 'ausente')"
echo "NPM: $(npm -v 2>/dev/null || echo 'ausente')"
if command -v bun &>/dev/null; then
  echo "Bun: $(bun -v 2>/dev/null || echo 'versão desconhecida') — PRESENTE"
  USAR_BUN=true
else
  echo "Bun: AUSENTE — usaremos npm"
  USAR_BUN=false
fi

echo ""
echo "Package.json scripts:"
cd "$BOT_DIR" 2>/dev/null || { echo "❌ apps/bot não encontrado"; exit 1; }
cat package.json | grep -A20 '"scripts"' | head -25

echo ""
echo "Commit atual: $(git -C "$CLONE_DECK" log --oneline -1 2>/dev/null || echo '?')"

echo ""
echo "Bot atual em $PUBLIC_BOT:"
if [ -d "$PUBLIC_BOT" ]; then
  find "$PUBLIC_BOT" -type f | wc -l | xargs echo "  Arquivos:"
  ls -la "$PUBLIC_BOT/index.html" 2>/dev/null || echo "  index.html AUSENTE"
else
  echo "  Diretório AUSENTE"
fi

# ── 2. BACKUP ───────────────────────────────────
echo ""
echo "═══ [2/7] Backup do Bot atual ═══"
if [ -d "$PUBLIC_BOT" ]; then
  cp -a "$PUBLIC_BOT" "$REV/backup/bot-antes"
  echo "✅ Backup salvo em $REV/backup/bot-antes"
else
  echo "⚠️ Nada para fazer backup (diretório vazio)"
fi

# ── 3. INSTALL ──────────────────────────────────
echo ""
echo "═══ [3/7] Instalando dependências ═══"
cd "$BOT_DIR"

if [ "$USAR_BUN" = true ]; then
  echo "Usando bun install..."
  bun install --silent > "$REV/logs/install.log" 2>&1
  INSTALL_EXIT=$?
else
  echo "Usando npm install..."
  npm install --silent > "$REV/logs/install.log" 2>&1
  INSTALL_EXIT=$?
fi

echo "Install exit code: $INSTALL_EXIT"
tail -5 "$REV/logs/install.log"

# ── 4. BUILD ────────────────────────────────────
echo ""
echo "═══ [4/7] Build ═══"

if [ "$USAR_BUN" = true ]; then
  bun run build > "$REV/logs/build.log" 2>&1
  BUILD_EXIT=$?
else
  npm run build > "$REV/logs/build.log" 2>&1
  BUILD_EXIT=$?
fi

echo "Build exit code: $BUILD_EXIT"

if [ $BUILD_EXIT -ne 0 ]; then
  echo "❌ BUILD FALHOU"
  tail -30 "$REV/logs/build.log"
  ERRO_FINAL=1
else
  echo "✅ Build concluído"
fi

# ── 5. VALIDAR DIST ─────────────────────────────
echo ""
echo "═══ [5/7] Validando dist/ ═══"

if [ -d "dist" ] && [ -f "dist/index.html" ]; then
  DIST_FILES=$(find dist -type f | wc -l)
  DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
  echo "✅ dist/index.html EXISTE"
  echo "   Arquivos: $DIST_FILES"
  echo "   Tamanho: $DIST_SIZE"

  # Lista assets principais
  echo "   Assets principais:"
  find dist -type f -name "*.js" -o -name "*.css" | head -5
else
  echo "❌ dist/index.html NÃO ENCONTRADO"
  ls -la dist/ 2>/dev/null || echo "   dist/ vazio ou ausente"
  ERRO_FINAL=1
fi

# ── 6. PUBLICAR ─────────────────────────────────
echo ""
echo "═══ [6/7] Publicando ═══"

if [ $ERRO_FINAL -eq 0 ]; then
  # Copia para diretório temporário
  TMP_DIR="$REV/tmp-publicar"
  mkdir -p "$TMP_DIR"
  cp -a dist/* "$TMP_DIR/"
  chmod 755 "$TMP_DIR"
  find "$TMP_DIR" -type f -exec chmod 644 {} \;
  find "$TMP_DIR" -type d -exec chmod 755 {} \;

  # Valida arquivos temporários
  TMP_FILES=$(find "$TMP_DIR" -type f | wc -l)
  echo "Arquivos temporários: $TMP_FILES"

  if [ "$TMP_FILES" -gt 0 ]; then
    # Substitui o diretório público
    rm -rf "$PUBLIC_BOT.old" 2>/dev/null || true
    [ -d "$PUBLIC_BOT" ] && mv "$PUBLIC_BOT" "$PUBLIC_BOT.old"
    mkdir -p "$PUBLIC_BOT"
    cp -a "$TMP_DIR/." "$PUBLIC_BOT/"
    chmod 755 "$PUBLIC_BOT"
    find "$PUBLIC_BOT" -type f -exec chmod 644 {} \;
    find "$PUBLIC_BOT" -type d -exec chmod 755 {} \;

    echo "✅ Bot publicado em $PUBLIC_BOT"
    echo "   Arquivos: $(find "$PUBLIC_BOT" -type f | wc -l)"

    # Remove backup antigo se tudo deu certo
    rm -rf "$PUBLIC_BOT.old" 2>/dev/null || true
  else
    echo "❌ Nada para publicar"
    ERRO_FINAL=1
    # Restaura backup
    if [ -d "$REV/backup/bot-antes" ]; then
      rm -rf "$PUBLIC_BOT" 2>/dev/null || true
      cp -a "$REV/backup/bot-antes" "$PUBLIC_BOT"
      echo "✅ Bot restaurado do backup"
    fi
  fi
else
  echo "⚠️ Build falhou — pulando publicação"
  echo "   Bot antigo mantido em $PUBLIC_BOT"
  if [ -d "$REV/backup/bot-antes" ]; then
    echo "   Backup disponível em $REV/backup/bot-antes"
  fi
fi

# ── 7. TESTAR ───────────────────────────────────
echo ""
echo "═══ [7/7] Testando ═══"
echo ""

sleep 2

ERROS_URL=0
for url in \
  "https://multizap.dev" \
  "https://bot.multizap.dev" \
  "https://crm.multizap.dev" \
  "https://proxy.multizap.dev/health" \
  "https://hook.multizap.dev/health"; do
  CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 15 "$url" 2>/dev/null || echo "000")
  if [ "$CODE" = "200" ]; then
    echo "  ✅ $url → HTTP $CODE"
  else
    echo "  ❌ $url → HTTP $CODE"
    ERROS_URL=$((ERROS_URL+1))
  fi
done

# ── RELATÓRIO ──────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════"

STATUS_MSG="✅ CONCLUÍDO"
[ $ERRO_FINAL -ne 0 ] && STATUS_MSG="❌ FALHA"
[ $ERROS_URL -gt 0 ] && STATUS_MSG="$STATUS_MSG (URLs com erro)"

echo " STATUS: $STATUS_MSG"
echo " Revisão: $REV"
echo "══════════════════════════════════════════════════"

cat > "$REV/resumo.md" << RESUMO
# Bot Build — Fallback npm

**Data:** $TIMESTAMP
**Status:** $STATUS_MSG
**Revisão:** $REV

## Diagnóstico

- Node: $(node -v 2>/dev/null || echo 'ausente')
- NPM: $(npm -v 2>/dev/null || echo 'ausente')
- Bun: $([ "$USAR_BUN" = true ] && echo "presente" || echo "ausente")
- Package manager usado: $([ "$USAR_BUN" = true ] && echo "bun" || echo "npm")

## Build

- Install exit: $INSTALL_EXIT
- Build exit: $BUILD_EXIT
- $( [ -f "$BOT_DIR/dist/index.html" ] && echo "dist/index.html: ✅" || echo "dist/index.html: ❌" )

## Publicação

- Backup criado: $( [ -d "$REV/backup/bot-antes" ] && echo "✅" || echo "❌")
- Arquivos publicados: $( [ -d "$PUBLIC_BOT" ] && find "$PUBLIC_BOT" -type f | wc -l || echo "0")

## URLs

$(for url in "multizap.dev" "bot.multizap.dev" "crm.multizap.dev" "proxy.multizap.dev/health" "hook.multizap.dev/health"; do
  CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 10 "https://$url" 2>/dev/null || echo "000")
  echo "- https://$url → $CODE"
done)

## Observações

- Post-deploy v4 está ativo (lock, resurrect, health check)
- Nenhum run-once antigo foi executado
- Nenhum PM2 foi reiniciado
- Nenhum WuzAPI foi parado
- Nenhuma sessão WhatsApp foi resetada
RESUMO

echo ""
echo "Relatório salvo em: $REV/resumo.md"
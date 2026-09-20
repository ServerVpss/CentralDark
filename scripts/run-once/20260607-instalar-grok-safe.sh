#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
OUT="/root/Multizap/revisoes/${TS}/instalar-grok-safe"
mkdir -p "$OUT"
LOG="$OUT/execucao.log"

exec > >(tee -a "$LOG") 2>&1

echo "== instalar-grok-safe =="
echo "Relatorio: $OUT"

REAL_GROK="${GROK_BIN:-/root/.grok/bin/grok}"
if [ ! -x "$REAL_GROK" ]; then
  if command -v grok >/dev/null 2>&1; then
    REAL_GROK="$(command -v grok)"
  else
    echo "ERRO: binario grok nao encontrado"
    exit 1
  fi
fi

echo "Grok real: $REAL_GROK"

cat > /usr/local/bin/grok-status <<'EOF_STATUS'
#!/usr/bin/env bash
set -euo pipefail

echo "========================================"
echo "     GROK BUILD - STATUS RAPIDO"
echo "========================================"

REAL_GROK="${GROK_BIN:-/root/.grok/bin/grok}"
if [ ! -x "$REAL_GROK" ] && command -v grok >/dev/null 2>&1; then
  REAL_GROK="$(command -v grok)"
fi

echo "Binario esperado: $REAL_GROK"
if [ -x "$REAL_GROK" ]; then
  echo "Binario: OK"
else
  echo "Binario: NAO ENCONTRADO"
fi

echo ""
echo "Processos Grok ativos:"
pgrep -af "grok" | sed -E 's/(token|password|authorization|apikey|api_key|secret|senha|cookie)[=: ][^ ,"'"']+/\1=***OCULTO***/Ig' || echo "Nenhum processo Grok ativo."

echo ""
echo "Cache Grok:"
if [ -d "$HOME/.cache/grok" ]; then
  du -sh "$HOME/.cache/grok" 2>/dev/null || echo "Nao foi possivel medir cache."
else
  echo "Pasta de cache nao existe."
fi

echo ""
echo "Limite de watchers do Linux:"
if [ -r /proc/sys/fs/inotify/max_user_watches ]; then
  cat /proc/sys/fs/inotify/max_user_watches
else
  echo "Nao disponivel."
fi

echo ""
echo "URL MCP correta para o conector:"
echo "https://mcp.centralldark.com/mcp"
echo ""
echo "Observacao: se aparecer erro de credito/subscription, o problema e na conta Grok, nao no script."
echo "========================================"
EOF_STATUS
chmod +x /usr/local/bin/grok-status

cat > /usr/local/bin/grok-safe <<EOF_SAFE
#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Iniciando Grok Safe Mode..."

REAL_GROK="\${GROK_BIN:-$REAL_GROK}"
if [ ! -x "\$REAL_GROK" ]; then
  echo "ERRO: binario Grok nao encontrado em \$REAL_GROK"
  exit 1
fi

echo "Verificando sessoes antigas sem encerrar nada..."
pgrep -af "grok" | sed -E 's/(token|password|authorization|apikey|api_key|secret|senha|cookie)[=: ][^ ,"'"']+/\1=***OCULTO***/Ig' || echo "Nenhuma sessao Grok ativa."

echo ""
echo "Diretorio recomendado: /root/CentralDark"
echo "MCP correto: https://mcp.centralldark.com/mcp"
echo ""
echo "Iniciando Grok de forma segura..."

if "\$REAL_GROK" --help 2>/dev/null | grep -q -- '--no-auto-update'; then
  exec "\$REAL_GROK" --no-auto-update --cwd /root/CentralDark
else
  exec "\$REAL_GROK" --cwd /root/CentralDark
fi
EOF_SAFE
chmod +x /usr/local/bin/grok-safe

BASHRC="$HOME/.bashrc"
MARK_START="# >>> CentralDark grok-safe >>>"
MARK_END="# <<< CentralDark grok-safe <<<"

if [ -f "$BASHRC" ]; then
  cp -a "$BASHRC" "$OUT/bashrc.backup"
  awk -v s="$MARK_START" -v e="$MARK_END" '
    $0 == s {skip=1; next}
    $0 == e {skip=0; next}
    !skip {print}
  ' "$BASHRC" > "$OUT/bashrc.novo"
  cat >> "$OUT/bashrc.novo" <<'EOF_ALIAS'
# >>> CentralDark grok-safe >>>
# Grok Seguro recomendado
alias grok='grok-safe'
alias gstatus='grok-status'
# <<< CentralDark grok-safe <<<
EOF_ALIAS
  cat "$OUT/bashrc.novo" > "$BASHRC"
else
  cat > "$BASHRC" <<'EOF_ALIAS'
# >>> CentralDark grok-safe >>>
# Grok Seguro recomendado
alias grok='grok-safe'
alias gstatus='grok-status'
# <<< CentralDark grok-safe <<<
EOF_ALIAS
fi

{
  echo "# Resultado - instalar-grok-safe"
  echo
  echo "Status: preparado"
  echo "Grok real: $REAL_GROK"
  echo "Comandos criados:"
  echo "- /usr/local/bin/grok-safe"
  echo "- /usr/local/bin/grok-status"
  echo
  echo "Alias adicionados ao ~/.bashrc:"
  echo "- grok='grok-safe'"
  echo "- gstatus='grok-status'"
  echo
  echo "Validacao sugerida: abrir novo shell e rodar gstatus"
} > "$OUT/resumo.md"

cat "$OUT/resumo.md"

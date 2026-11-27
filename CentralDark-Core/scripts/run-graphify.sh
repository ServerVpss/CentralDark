#!/usr/bin/env bash
set -euo pipefail

# run-graphify.sh — execução simples do Graphify/Graphifyy no CentralDark
#
# Uso:
#   ./scripts/run-graphify.sh extract      # limpa execuções anteriores e extrai o projeto inteiro
#   ./scripts/run-graphify.sh cluster      # roda apenas clusterização
#   ./scripts/run-graphify.sh label        # roda apenas rotulagem
#   ./scripts/run-graphify.sh all          # extract + cluster + label
#
# Variáveis opcionais:
#   GRAPHIFY_BACKEND=anthropic             # backend usado na extração/label
#   GRAPHIFY_NO_CLUSTER_FLAG=              # vazio = extrai já permitindo cluster pelo padrão da ferramenta
#
# Observação:
# O pacote do pip chama `graphifyy`, mas o módulo/binário real é `graphify`.
# Nesta VPS existe um shim local para `python3 -m graphifyy`, então ambos funcionam.

PROJECT_DIR="${PROJECT_DIR:-/root/CentralDark}"
LOG_DIR="$PROJECT_DIR/logs/graphify"
BACKEND="${GRAPHIFY_BACKEND:-anthropic}"
NO_CLUSTER_FLAG="${GRAPHIFY_NO_CLUSTER_FLAG:---no-cluster}"

export PATH="$HOME/.local/bin:$PATH"
cd "$PROJECT_DIR"
mkdir -p "$LOG_DIR"

if command -v graphifyy >/dev/null 2>&1; then
  GRAPHIFY_CMD=(graphifyy)
elif python3 -m graphifyy --help >/dev/null 2>&1; then
  GRAPHIFY_CMD=(python3 -m graphifyy)
elif command -v graphify >/dev/null 2>&1; then
  GRAPHIFY_CMD=(graphify)
else
  echo "ERRO: graphify/graphifyy não encontrado. Instale com: python3 -m pip install --user --force-reinstall graphifyy" >&2
  exit 127
fi

limpar_execucoes_anteriores() {
  echo "🧹 Limpando execuções anteriores do graphify..."
  pkill -f "graphify.*extract" 2>/dev/null || true
  pkill -f "graphify.*cluster" 2>/dev/null || true
  pkill -f "graphify.*label" 2>/dev/null || true
  rm -f graphify-debug.log graphify-cluster.log graphify-label.log
}

rodar_extract() {
  limpar_execucoes_anteriores
  echo "🚀 Extraindo projeto em: $PROJECT_DIR"
  echo "🧠 Comando: ${GRAPHIFY_CMD[*]} extract . --backend $BACKEND $NO_CLUSTER_FLAG"
  "${GRAPHIFY_CMD[@]}" extract . --backend "$BACKEND" $NO_CLUSTER_FLAG 2>&1 | tee "$LOG_DIR/extract-$(date +%Y%m%d-%H%M%S).log" graphify-debug.log
}

rodar_cluster() {
  echo "🔗 Rodando cluster-only..."
  "${GRAPHIFY_CMD[@]}" cluster-only 2>&1 | tee "$LOG_DIR/cluster-$(date +%Y%m%d-%H%M%S).log" graphify-cluster.log
}

rodar_label() {
  echo "🏷️ Rodando label com backend: $BACKEND"
  "${GRAPHIFY_CMD[@]}" label --backend "$BACKEND" 2>&1 | tee "$LOG_DIR/label-$(date +%Y%m%d-%H%M%S).log" graphify-label.log
}

case "${1:-extract}" in
  extract) rodar_extract ;;
  cluster|cluster-only) rodar_cluster ;;
  label) rodar_label ;;
  all)
    rodar_extract
    rodar_cluster
    rodar_label
    ;;
  help|-h|--help)
    sed -n '1,38p' "$0"
    ;;
  *)
    echo "Uso: $0 {extract|cluster|label|all}" >&2
    exit 2
    ;;
esac

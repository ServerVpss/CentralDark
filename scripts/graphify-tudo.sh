#!/bin/bash
# Pipeline completo do graphifyy: extract -> cluster -> label
# Uso: bash scripts/graphify-tudo.sh
set +e
export PATH=$HOME/.local/bin:$PATH
cd /root/CentralDark || exit 1

TS=$(date +%Y%m%d-%H%M%S)
mkdir -p logs/graphify
LOG=logs/graphify/pipeline-$TS.log
LATEST=logs/graphify/latest.log
ln -sfn "pipeline-$TS.log" "$LATEST"

banner(){ echo ""; echo "===== $1 =====  $(date -Iseconds)"; }

{
  banner "INICIO"
  echo "graphifyy: $(which graphifyy || echo NAO ENCONTRADO)"
  echo "proxy 8082: $(curl -sS -o /dev/null -w %{http_code} http://127.0.0.1:8082/ || echo down)"

  banner "1/3 EXTRACT"
  graphifyy extract .
  E1=$?; echo "EXTRACT_EXIT=$E1"
  [ $E1 -ne 0 ] && { banner "ABORTADO em EXTRACT"; exit $E1; }

  banner "2/3 CLUSTER"
  graphifyy cluster-only .
  E2=$?; echo "CLUSTER_EXIT=$E2"
  [ $E2 -ne 0 ] && { banner "ABORTADO em CLUSTER"; exit $E2; }

  banner "3/3 LABEL"
  graphifyy label .
  E3=$?; echo "LABEL_EXIT=$E3"

  banner "FIM"
  echo "Grafo:      graphify-out/graph.json"
  echo "Relatorio:  graphify-out/GRAPH_REPORT.md"
  echo "Log:        $LOG"
} 2>&1 | tee "$LOG"

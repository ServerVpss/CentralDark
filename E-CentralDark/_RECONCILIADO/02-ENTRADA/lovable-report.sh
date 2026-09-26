#!/usr/bin/env bash
# lovable-report.sh — Imprime o último relatório do fallback de sync.
# Uso:  bash lovable-report.sh [base_dir]

set -uo pipefail

BASE="${1:-/root/CentralDark/revisoes}"
[ -d "$BASE" ] || BASE="/tmp/centraldark-revisoes"
[ -d "$BASE" ] || { echo "Nenhum diretório de revisoes encontrado."; exit 0; }

ultimo=$(find "$BASE" -type d -name "sync-fallback-lovable" 2>/dev/null | sort | tail -1)
[ -z "$ultimo" ] && { echo "Nenhum relatório de fallback ainda."; exit 0; }

echo "=== Último relatório: $ultimo ==="
echo
[ -f "$ultimo/resumo.md" ] && cat "$ultimo/resumo.md"
echo
echo "--- Ações executadas ---"
[ -f "$ultimo/acoes-executadas.md" ] && cat "$ultimo/acoes-executadas.md"
echo
echo "--- Logs (últimas 40 linhas) ---"
[ -f "$ultimo/logs-sanitizados.txt" ] && tail -40 "$ultimo/logs-sanitizados.txt"

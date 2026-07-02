#!/usr/bin/env bash
set -euo pipefail
BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BASE"
cat <<'MENU'
Graph Panel CentralDark
1) Rodar pipeline Lovable
2) Rodar graphifyy reserva
3) Auditar último grafo
4) Ver saúde local
5) Editar ignore
6) Teste sem markdown
7) Ver últimos logs
8) Sair
MENU
read -r -p "Escolha: " op
case "$op" in
  1) python3 scripts/pipeline-lovable.py ;;
  2) bash scripts/pipeline-graphifyy.sh ;;
  3) python3 scripts/audit.py ;;
  4) curl -fsS http://127.0.0.1:3030/api/health ;;
  5) ${EDITOR:-nano} scripts/.graphifyignore ;;
  6) GRAPH_PANEL_SKIP_MD=1 python3 scripts/pipeline-lovable.py ;;
  7) tail -n 80 logs/pm2-out.log logs/pm2-error.log 2>/dev/null || true ;;
  *) exit 0 ;;
esac

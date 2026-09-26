#!/usr/bin/env bash
# lovable-check.sh — Compara o estado local com a `main` do repo no GitHub
# e gera checks.json + saída resumida no stdout.
#
# Não modifica nada. Não faz commit. Não faz push.
#
# Uso:
#   GITHUB_TOKEN=... bash lovable-check.sh [diretorio_repo] [saida_json]
# Defaults:
#   diretorio_repo = $PWD
#   saida_json     = /tmp/lovable-checks.json

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./_lib-sanitize.sh
source "${SCRIPT_DIR}/_lib-sanitize.sh"
# shellcheck source=./_lib-github-api.sh
source "${SCRIPT_DIR}/_lib-github-api.sh"

REPO_DIR="${1:-$PWD}"
OUT_JSON="${2:-/tmp/lovable-checks.json}"

: "${GITHUB_TOKEN:?defina GITHUB_TOKEN (use GITHUB_PAT_PERFIL no sandbox)}"
: "${FALLBACK_MAX_FILES:=50}"

cd "$REPO_DIR" || { echo "diretorio invalido: $REPO_DIR" >&2; exit 2; }

echo "[check] repo local: $REPO_DIR"
echo "[check] remoto:     ${GITHUB_OWNER}/${GITHUB_REPO} (main)"

# Último commit visível na main
remote_sha=$(gh_get_ref_sha heads/main)
echo "[check] sha remoto main: ${remote_sha:-<vazio>}"

if [ -z "$remote_sha" ]; then
  echo "[check] falha ao consultar a main do GitHub — token sem acesso?" >&2
  exit 3
fi

# Webhook de deploy: tenta health (não obrigatório)
webhook_status="desconhecido"
if curl -sS -o /dev/null -w "%{http_code}" --max-time 5 \
     "https://hook.multizap.dev/health" 2>/dev/null | grep -qE "^(200|204)$"; then
  webhook_status="ok"
else
  webhook_status="sem_resposta"
fi
echo "[check] webhook hook.multizap.dev/health: $webhook_status"

# Lista de divergências (arquivos modificados não commitados localmente)
divergentes=()
while IFS= read -r line; do
  [ -n "$line" ] && divergentes+=("$line")
done < <(git -C "$REPO_DIR" status --porcelain 2>/dev/null | awk '{print $NF}')

total=${#divergentes[@]}
echo "[check] arquivos locais divergentes: $total"

# Trava de proteção
if [ "$total" -gt "$FALLBACK_MAX_FILES" ]; then
  echo "[check] divergência acima de FALLBACK_MAX_FILES=$FALLBACK_MAX_FILES — abortando" >&2
fi

# Allowlist negativa (zonas sensíveis)
sensiveis=()
for f in "${divergentes[@]}"; do
  if echo "$f" | grep -qE '^(apps/crm/|infra/caddy/|infra/docker/|wuzapi/|whatsapp-server/)'; then
    sensiveis+=("$f")
  fi
done

# Branches edit/edt-* divergentes da main remota (sync Lovable travado)
: "${EDIT_BRANCH_PREFIX:=edit/edt-}"
: "${EDIT_BRANCH_MAX:=10}"
echo "[check] varrendo branches '${EDIT_BRANCH_PREFIX}*' no remoto..."
mapfile -t edit_branches < <(gh_list_branches_prefix "$EDIT_BRANCH_PREFIX" | head -n "$EDIT_BRANCH_MAX")
echo "[check] branches edit/* encontradas: ${#edit_branches[@]}"

edit_report_json="["
edit_divergentes_total=0
edit_sensiveis_total=0
first=1
for b in "${edit_branches[@]}"; do
  [ -z "$b" ] && continue
  read -r ahead behind total < <(gh_compare_branches "main" "$b")
  ahead=${ahead:-0}; behind=${behind:-0}
  mapfile -t bfiles < <(gh_compare_files "main" "$b")
  bcount=${#bfiles[@]}
  bsens=0
  for f in "${bfiles[@]}"; do
    if echo "$f" | grep -qE '^(apps/crm/|infra/caddy/|infra/docker/|wuzapi/|whatsapp-server/)'; then
      bsens=$((bsens+1))
    fi
  done
  edit_divergentes_total=$((edit_divergentes_total + bcount))
  edit_sensiveis_total=$((edit_sensiveis_total + bsens))
  echo "[check]   ${b}: ahead=${ahead} arquivos=${bcount} sensíveis=${bsens}"
  [ "$first" = "1" ] || edit_report_json+=","
  first=0
  files_json=$(python3 -c "import json,sys;print(json.dumps(sys.argv[1:]))" "${bfiles[@]:-}")
  edit_report_json+="{\"branch\":\"${b}\",\"ahead\":${ahead},\"behind\":${behind},\"arquivos\":${files_json},\"sensiveis\":${bsens}}"
done
edit_report_json+="]"

# Monta JSON
python3 - "$OUT_JSON" "$remote_sha" "$webhook_status" "$total" \
          "${#sensiveis[@]}" "${FALLBACK_MAX_FILES}" \
          "$edit_divergentes_total" "$edit_sensiveis_total" "$edit_report_json" \
          "${divergentes[@]:-}" <<'PY'
import json, sys, os, datetime
out, sha, wh, total, sens, maxf, edit_total, edit_sens, edit_json, *files = sys.argv[1:]
total=int(total); sens=int(sens); maxf=int(maxf)
edit_total=int(edit_total); edit_sens=int(edit_sens)
files=[f for f in files if f]
try:
  edit_branches = json.loads(edit_json)
except Exception:
  edit_branches = []
data={
  "timestamp": datetime.datetime.now().astimezone().isoformat(),
  "repo_remoto": f"{os.environ.get('GITHUB_OWNER','segredounlock')}/{os.environ.get('GITHUB_REPO','clone-deck')}",
  "sha_remoto_main": sha,
  "webhook_health": wh,
  "arquivos_divergentes_total": total,
  "arquivos_divergentes": files[:200],
  "arquivos_em_zona_sensivel": sens,
  "limite_max_arquivos": maxf,
  "edit_branches_total": len(edit_branches),
  "edit_branches_arquivos_total": edit_total,
  "edit_branches_arquivos_sensiveis": edit_sens,
  "edit_branches": edit_branches,
  "precisa_fallback": total > 0 or edit_total > 0,
  "precisa_fallback_main": total > 0,
  "precisa_promover_edit_branch": edit_total > 0,
  "bloqueado_por_limite": total > maxf,
  "bloqueado_por_zona_sensivel": sens > 0 or edit_sens > 0,
}
with open(out,"w") as f:
  json.dump(data,f,indent=2,ensure_ascii=False)
print(f"[check] checks.json gravado em {out}")
PY

echo "[check] concluído."

#!/usr/bin/env bash
# Biblioteca de chamadas à API do GitHub usada pelo fallback de sync.
# Requer: GITHUB_TOKEN exportado, GITHUB_OWNER, GITHUB_REPO.
# Todas as funções retornam JSON cru no stdout (a quem chama, sanitizar).

: "${GITHUB_OWNER:=segredounlock}"
: "${GITHUB_REPO:=clone-deck}"
: "${GITHUB_API:=https://api.github.com}"

_gh_curl() {
  local method="$1"; shift
  local path="$1"; shift
  curl -sS -X "$method" \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "${GITHUB_API}${path}" "$@"
}

gh_get_ref_sha() {
  # $1 = ref (ex: heads/main)
  local ref="$1"
  _gh_curl GET "/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/ref/${ref}" \
    | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('object',{}).get('sha',''))"
}

gh_get_file_sha() {
  # $1 = path, $2 = ref (opcional)
  local path="$1"; local ref="${2:-main}"
  _gh_curl GET "/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${ref}" \
    | python3 -c "import sys,json
try:
  d=json.load(sys.stdin); print(d.get('sha',''))
except Exception:
  print('')"
}

gh_get_file_content() {
  # $1 = path, $2 = ref. Imprime conteúdo decodificado.
  local path="$1"; local ref="${2:-main}"
  _gh_curl GET "/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${ref}" \
    | python3 -c "import sys,json,base64
try:
  d=json.load(sys.stdin)
  print(base64.b64decode(d['content']).decode('utf-8',errors='replace'),end='')
except Exception:
  pass"
}

gh_create_branch() {
  # $1 = nova branch, $2 = sha base
  local name="$1"; local sha="$2"
  _gh_curl POST "/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs" \
    -d "{\"ref\":\"refs/heads/${name}\",\"sha\":\"${sha}\"}"
}

gh_put_file() {
  # $1=path  $2=branch  $3=mensagem  $4=arquivo_local  $5=sha_atual (vazio se novo)
  local path="$1"; local branch="$2"; local msg="$3"; local local_file="$4"; local sha="${5:-}"
  local content_b64
  content_b64=$(base64 -w0 < "$local_file" 2>/dev/null || base64 < "$local_file" | tr -d '\n')
  local payload
  payload=$(python3 -c "
import json,sys
p={'message':sys.argv[1],'content':sys.argv[2],'branch':sys.argv[3],
   'committer':{'name':'SegredoiDev','email':'segredounlock@users.noreply.github.com'}}
if sys.argv[4]:
    p['sha']=sys.argv[4]
print(json.dumps(p))
" "$msg" "$content_b64" "$branch" "$sha")
  _gh_curl PUT "/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}" -d "$payload"
}

gh_open_pr() {
  # $1=branch  $2=titulo  $3=corpo
  local branch="$1"; local title="$2"; local body="$3"
  local payload
  payload=$(python3 -c "
import json,sys
print(json.dumps({'title':sys.argv[1],'head':sys.argv[2],'base':'main','body':sys.argv[3]}))
" "$title" "$branch" "$body")
  _gh_curl POST "/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls" -d "$payload"
}

gh_list_branches_prefix() {
  # $1 = prefixo (ex: edit/edt-). Lista nomes de branches que casam.
  local prefix="$1"
  local page=1
  while :; do
    local resp
    resp=$(_gh_curl GET "/repos/${GITHUB_OWNER}/${GITHUB_REPO}/branches?per_page=100&page=${page}")
    local names
    names=$(echo "$resp" | python3 -c "
import sys,json
try:
  d=json.load(sys.stdin)
  for b in d:
    print(b.get('name',''))
except Exception:
  pass")
    [ -z "$names" ] && break
    echo "$names" | grep -E "^${prefix}" || true
    local count
    count=$(echo "$names" | grep -c .)
    [ "$count" -lt 100 ] && break
    page=$((page+1))
    [ "$page" -gt 5 ] && break
  done
}

gh_compare_branches() {
  # $1=base $2=head. Imprime "ahead_by behind_by total_commits"
  local base="$1"; local head="$2"
  _gh_curl GET "/repos/${GITHUB_OWNER}/${GITHUB_REPO}/compare/${base}...${head}" \
    | python3 -c "
import sys,json
try:
  d=json.load(sys.stdin)
  print(d.get('ahead_by',0), d.get('behind_by',0), d.get('total_commits',0))
except Exception:
  print('0 0 0')"
}

gh_compare_files() {
  # $1=base $2=head. Imprime caminhos dos arquivos alterados.
  local base="$1"; local head="$2"
  _gh_curl GET "/repos/${GITHUB_OWNER}/${GITHUB_REPO}/compare/${base}...${head}" \
    | python3 -c "
import sys,json
try:
  d=json.load(sys.stdin)
  for f in d.get('files',[]):
    print(f.get('filename',''))
except Exception:
  pass"
}

gh_add_label() {
  # $1=numero_pr  $2=label
  local num="$1"; local label="$2"
  _gh_curl POST "/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${num}/labels" \
    -d "{\"labels\":[\"${label}\"]}"
}

export -f _gh_curl gh_get_ref_sha gh_get_file_sha gh_get_file_content \
          gh_create_branch gh_put_file gh_open_pr gh_add_label \
          gh_list_branches_prefix gh_compare_branches gh_compare_files 2>/dev/null || true

#!/usr/bin/env bash
set -euo pipefail

# Publica o commit atual em uma branch automática estável por workflow e abre
# ou reutiliza o PR correspondente. Nunca escreve na main.

: "${GH_TOKEN:?GH_TOKEN obrigatório para abrir ou atualizar PR}"
: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY obrigatório}"
: "${GITHUB_WORKFLOW:?GITHUB_WORKFLOW obrigatório}"

base_branch="${AUTO_PR_BASE:-main}"
owner="${GITHUB_REPOSITORY%%/*}"
workflow_slug="$(
  printf '%s' "$GITHUB_WORKFLOW" |
    tr '[:upper:]' '[:lower:]' |
    sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//' |
    cut -c1-48
)"
if [ -z "$workflow_slug" ]; then
  workflow_slug="workflow"
fi
branch="auto/${workflow_slug}"

current_branch="$(git branch --show-current || true)"
if [ "$current_branch" = "$base_branch" ]; then
  echo "PUBLICACAO_BLOQUEADA_BRANCH_BASE=$base_branch" >&2
  exit 13
fi

remote_sha="$(git ls-remote --heads origin "refs/heads/$branch" | awk '{print $1}')"
if [ -n "$remote_sha" ]; then
  git fetch --no-tags origin "refs/heads/$branch:refs/remotes/origin/$branch"
  git push \
    "--force-with-lease=refs/heads/$branch:$remote_sha" \
    origin "HEAD:refs/heads/$branch"
else
  git push origin "HEAD:refs/heads/$branch"
fi

api="https://api.github.com/repos/${GITHUB_REPOSITORY}"
auth=(-H "Authorization: Bearer ${GH_TOKEN}" -H 'Accept: application/vnd.github+json' -H 'X-GitHub-Api-Version: 2022-11-28')
open_json="$(
  curl --fail-with-body --silent --show-error --get "${auth[@]}" \
    --data-urlencode "state=open" \
    --data-urlencode "head=${owner}:${branch}" \
    "${api}/pulls"
)"
pr_number="$(printf '%s' "$open_json" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const v=JSON.parse(s);process.stdout.write(v[0]?.number?String(v[0].number):'')})")"

run_url="https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID:-desconhecido}"
head_sha="$(git rev-parse HEAD)"
export AUTO_PR_TITLE="chore(${workflow_slug}): atualização automática comprovável"
export AUTO_PR_BODY="## Diagnóstico técnico

O workflow \`${GITHUB_WORKFLOW}\` gerou mudanças e publicou o commit em uma branch automática isolada.

- Branch: \`${branch}\`
- Commit: \`${head_sha}\`
- Run: ${run_url}

Nenhuma escrita foi feita diretamente na \`${base_branch}\`.

## Papo reto do Pivete

O robô fez a atualização, mas deixou em PR para os gates decidirem. Se a próxima execução mudar o mesmo resultado, ela atualiza esta branch em vez de criar várias versões."

if [ -z "$pr_number" ]; then
  payload="$(node -e "process.stdout.write(JSON.stringify({title:process.env.AUTO_PR_TITLE,head:process.env.AUTO_BRANCH,base:process.env.AUTO_BASE,body:process.env.AUTO_PR_BODY,maintainer_can_modify:true}))" \
    AUTO_BRANCH="$branch" AUTO_BASE="$base_branch")"
  # Variáveis posicionadas antes do comando para compatibilidade com shells POSIX.
  payload="$(AUTO_BRANCH="$branch" AUTO_BASE="$base_branch" node -e "process.stdout.write(JSON.stringify({title:process.env.AUTO_PR_TITLE,head:process.env.AUTO_BRANCH,base:process.env.AUTO_BASE,body:process.env.AUTO_PR_BODY,maintainer_can_modify:true}))")"
  created="$(curl --fail-with-body --silent --show-error "${auth[@]}" -X POST "${api}/pulls" -d "$payload")"
  pr_number="$(printf '%s' "$created" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(String(JSON.parse(s).number)))")"
  echo "PR_CRIADO=$pr_number"
else
  payload="$(node -e "process.stdout.write(JSON.stringify({title:process.env.AUTO_PR_TITLE,body:process.env.AUTO_PR_BODY}))")"
  curl --fail-with-body --silent --show-error "${auth[@]}" -X PATCH "${api}/pulls/${pr_number}" -d "$payload" >/dev/null
  echo "PR_ATUALIZADO=$pr_number"
fi

echo "AUTO_PR_BRANCH=$branch"
echo "AUTO_PR_NUMBER=$pr_number"
echo "AUTO_PR_HEAD_SHA=$head_sha"

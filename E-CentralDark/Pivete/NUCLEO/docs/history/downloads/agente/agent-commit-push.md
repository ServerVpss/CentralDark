# AGENTE - agent-commit-push.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\scripts\agent-commit-push.sh
**SHA:** 3572df4a3ad365b9
**Timestamp:** 2026-08-26T19:31:33.470994
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export GIT_TERMINAL_PROMPT=0

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env bash
set -euo pipefail

# Commit e push seguro para o agente.
# Suporta 2 modos:
#   1) Token em variável de ambiente/local: GITHUB_TOKEN_FOR_PUSH ou GITHUB_PAT_ATENDIMENTO
#   2) Deploy key SSH: /home/user/.ssh/arena_atendimentoo_ed25519
#
# Uso:
#   scripts/agent-commit-push.sh "mensagem do commit"
#
# Variáveis opcionais:
#   GITHUB_REMOTE_URL=https://github.com/segredounlock/atendimentoo.git
#   GITHUB_SSH_REMOTE_URL=git@github.com:segredounlock/atendimentoo.git
#   GITHUB_SSH_KEY_PATH=/home/user/.ssh/arena_atendimentoo_ed25519
#   GITHUB_BRANCH=main
#   GIT_AUTHOR_NAME="Arena Agent"
#   GIT_AUTHOR_EMAIL="arena-agent@users.noreply.github.com"
#   RUN_BUILD=1      # roda npm run build antes de commitar
#   RUN_LINT=1       # roda npm run lint antes de commitar

# Carrega token local temporário se existir.
# Estes arquivos NÃO devem ser commitados. Eles são ignorados pelo .gitignore.
# Preferência: .agent.local.env. Alternativa mais fácil de achar no workspace: agent-token.local.
for AGENT_ENV_FILE in ".agent.local.env" "agent-token.local"; do
  if [ -f "$AGENT_ENV_FILE" ]; then
    set -a
    # shellcheck disable=SC1090
    . "./$AGENT_ENV_FILE"
    set +a
  fi
done
unset AGENT_ENV_FILE

BRANCH="${GITHUB_BRANCH:-main}"
HTTPS_REMOTE_URL="${GITHUB_REMOTE_URL:-https://github.com/segredounlock/atendimentoo.git}"
SSH_REMOTE_URL="${GITHUB_SSH_REMOTE_URL:-git@github.com:segredounlock/atendimentoo.git}"
SSH_KEY_PATH="${GITHUB_SSH_KEY_PATH:-/home/user/.ssh/arena_atendimentoo_ed25519}"
COMMIT_MESSAGE="${1:-chore: atualização automática pelo agente}"
TOKEN="${GITHUB_TOKEN_FOR_PUSH:-${GITHUB_PAT_ATENDIMENTO:-}}"

# Ignora placeholders comuns.
case "$TOKEN" in
  ""|"cole_o_token_aqui"|"SEU_TOKEN_NOVO"|"github_pat_xxxxxxxxx") TOKEN="" ;;
esac

if [ ! -d .git ]; then
  echo "Erro: execute este script na raiz do repositório git." >&2
  exit 2
fi

ASKPASS_FILE=""
cleanup() {
  if [ -n "$ASKPASS_FILE" ]; then
    rm -f "$ASKPASS_FILE"
  fi
}
trap cleanup EXIT

export GIT_TERMINAL_PROMPT=0

if [ -n "$TOKEN" ]; then
  AUTH_MODE="token"
  REMOTE_URL="$HTTPS_REMOTE_URL"

  # Usa GIT_ASKPASS temporário para não colocar token na URL remota nem no git config.
  ASKPASS_FILE="$(mktemp)"
  cat > "$ASKPASS_FILE" <<'EOF'
#!/usr/bin/env sh
case "$1" in
  *Username*) printf '%s\n' "x-access-token" ;;
  *Password*) printf '%s\n' "$GITHUB_TOKEN_FOR_PUSH" ;;
  *) printf '\n' ;;
esac
EOF
  chmod 700 "$ASKPASS_FILE"
  export GITHUB_TOKEN_FOR_PUSH="$TOKEN"
  export GIT_ASKPASS="$ASKPASS_FILE"
elif [ -f "$SSH_KEY_PATH" ]; then
  AUTH_MODE="ssh"
  REMOTE_URL="$SSH_REMOTE_URL"
  chmod 600 "$SSH_KEY_PATH" || true
  export GIT_SSH_COMMAND="ssh -i $SSH_KEY_PATH -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
else
  cat >&2 <<MSG
Erro: nenhuma credencial encontrada.
Configure uma das opções:
  1) Token: GITHUB_TOKEN_FOR_PUSH em agent-token.local ou secret do workspace
  2) Deploy key SSH: adicione a chave pública do arquivo DEPLOY_KEY_PUBLIC_ADD_TO_GITHUB.txt no GitHub com write access

Caminho esperado da chave SSH privada:
  $SSH_KEY_PATH
MSG
  exit 2
fi

if [ -n "$(git ls-files '*.env' '.env' '**/.env' 2>/dev/null || true)" ]; then
  echo "Aviso: existem arquivos .env versionados neste repositório." >&2
  echo "Recomendado: remover do Git e rotacionar os segredos expostos." >&2
fi

git config user.name "${GIT_AUTHOR_NAME:-Arena Agent}"
git config user.email "${GIT_AUTHOR_EMAIL:-arena-agent@users.noreply.github.com}"

echo "Autenticação: $AUTH_MODE"
echo "Branch: $BRANCH"

# Mantém a branch atualizada antes de commitar.
git fetch "$REMOTE_URL" "$BRANCH"
CURRENT_BRANCH="$(git branch --show-current || true)"
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  git checkout "$BRANCH"
fi

git pull --ff-only "$REMOTE_URL" "$BRANCH" || git pull --rebase "$REMOTE_URL" "$BRANCH"

# Checks opcionais.
if [ "${RUN_LINT:-0}" = "1" ]; then
  npm run lint
fi

if [ "${RUN_BUILD:-0}" = "1" ]; then
  npm run build
fi

# Commit de todas as alterações.
git add -A
if git diff --cached --quiet; then
  echo "Nenhuma alteração para commitar."
  exit 0
fi

git commit -m "$COMMIT_MESSAGE"

git push "$REMOTE_URL" "HEAD:$BRANCH"

echo "Push concluído em $BRANCH."

```
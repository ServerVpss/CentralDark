# Auto-push do agente para o GitHub

Este projeto pode ser configurado para o agente commitar e enviar alterações direto para a branch `main`, **sem salvar token dentro do repositório**.

> Recomendação: use isso apenas com um token dedicado, de permissão mínima e expiração curta.

## 1. Volte o repositório para privado

Antes de automatizar push, volte o repositório para privado e remova segredos expostos.

Também existem arquivos `.env` versionados neste clone. O ideal é remover do Git e manter apenas `.env.example`.

```bash
git rm --cached .env design-references/nexchat-original/code/.env
printf '\n.env\n**/.env\n' >> .gitignore
git add .gitignore
git commit -m "chore: remove env files from git"
git push origin main
```

Depois, rotacione/revogue todos os tokens e senhas que estavam nesses `.env`.

## 2. Crie um token seguro no GitHub

No GitHub:

1. Abra **Settings**.
2. Vá em **Developer settings**.
3. Abra **Personal access tokens** → **Fine-grained tokens**.
4. Clique em **Generate new token**.
5. Configure:
   - **Repository access**: apenas `segredounlock/atendimentoo`.
   - **Expiration**: curta, por exemplo 7 ou 30 dias.
   - **Permissions**:
     - **Contents**: `Read and write`.
     - **Workflows**: `Read and write` apenas se o agente precisar editar `.github/workflows/*`.
     - **Pull requests**: opcional, apenas se for usar PR em vez de push direto.
6. Gere o token.

Não cole esse token no chat.

## 3. Salve o token como Secret seguro

Se a plataforma/workspace tiver uma área de **Secrets** ou **Environment Variables**, cadastre:

```text
GITHUB_TOKEN_FOR_PUSH=SEU_TOKEN_NOVO
```

Nome alternativo aceito pelo script:

```text
GITHUB_PAT_ATENDIMENTO=SEU_TOKEN_NOVO
```



## Método recomendado sem editar arquivo local: Deploy Key SSH

Se você não consegue editar `agent-token.local`, use uma Deploy Key SSH.

O agente gerou uma chave SSH privada local em:

```text
/home/user/.ssh/arena_atendimentoo_ed25519
```

E a chave pública está no arquivo:

```text
DEPLOY_KEY_PUBLIC_ADD_TO_GITHUB.txt
```

No GitHub:

1. Abra o repositório `segredounlock/atendimentoo`.
2. Vá em **Settings**.
3. Clique em **Deploy keys**.
4. Clique em **Add deploy key**.
5. Em **Title**, coloque:

```text
arena-agent-atendimentoo
```

6. Em **Key**, cole o conteúdo de `DEPLOY_KEY_PUBLIC_ADD_TO_GITHUB.txt`.
7. Marque **Allow write access**.
8. Clique em **Add key**.

Depois disso, o agente consegue fazer push usando SSH:

```bash
scripts/agent-commit-push.sh "chore: configura autopush do agente"
```

Quando terminar a automação temporária, remova a deploy key do GitHub e apague a chave privada:

```bash
rm -f /home/user/.ssh/arena_atendimentoo_ed25519 /home/user/.ssh/arena_atendimentoo_ed25519.pub
```

## Método temporário aceitando risco: arquivo local no workspace

Se não houver painel de Secrets na Arena, use um arquivo local ignorado pelo Git.

Opção mais fácil de achar no workspace:

```text
agent-token.local
```

Abra o arquivo `agent-token.local` no workspace e preencha:

```env
GITHUB_TOKEN_FOR_PUSH=SEU_TOKEN_NOVO
```

Alternativa equivalente:

```bash
cp .agent.local.env.example .agent.local.env
```

Depois o agente consegue rodar:

```bash
scripts/agent-commit-push.sh "feat: alteração feita pelo agente"
```

Quando terminar a automação temporária:

```bash
rm -f .agent.local.env agent-token.local
```

E revogue o token no GitHub.

## 4. Como o agente faz commit/push

Na raiz do repo:

```bash
cd /home/user/atendimentoo
chmod +x scripts/agent-commit-push.sh
scripts/agent-commit-push.sh "feat: minha alteração"
```

O script:

1. atualiza a branch `main` com `git pull`;
2. configura autor do commit;
3. opcionalmente roda lint/build;
4. faz `git add -A`;
5. cria commit;
6. faz push para `main` usando `GIT_ASKPASS`, sem salvar o token no remoto.

## 5. Checks opcionais

Para rodar lint antes do commit:

```bash
RUN_LINT=1 scripts/agent-commit-push.sh "chore: ajuste com lint"
```

Para rodar build antes do commit:

```bash
RUN_BUILD=1 scripts/agent-commit-push.sh "chore: ajuste com build"
```

Para ambos:

```bash
RUN_LINT=1 RUN_BUILD=1 scripts/agent-commit-push.sh "chore: ajuste validado"
```

## 6. Autor do commit

Opcionalmente configure:

```bash
export GIT_AUTHOR_NAME="Arena Agent"
export GIT_AUTHOR_EMAIL="arena-agent@users.noreply.github.com"
```

## 7. Observações de segurança

- Não coloque token em `.env` versionado.
- Não coloque token na URL do remoto salva no Git.
- Não cole token no chat.
- Prefira Fine-grained PAT limitado a um único repositório.
- Revogue tokens antigos ou expostos.
- O ideal em produção é usar branch + Pull Request; push direto em `main` é mais arriscado.

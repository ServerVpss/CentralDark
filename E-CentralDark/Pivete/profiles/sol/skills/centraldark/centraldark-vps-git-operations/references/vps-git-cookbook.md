# VPS Git Cookbook — Sessão 28/08

Passo-a-passo real que funcionou na sessão de reconciliação+deploy.

## Cenário 1: Deploy travado em chattr +i

Sintoma: `centraldark-deploy.sh --apply` sai com `IMUTAVEL_BLOQUEIA_DEPLOY 12`.

```bash
# 1. Medir quais estão com +i (filtro CORRETO)
ssh Segredo-VPS "cd /root/CentralDark && lsattr -R -a . 2>/dev/null | awk '\$1 ~ /^[-aAcCdDeEFijImNPsStTux]+\$/ && \$1 ~ /i/ && \$2 !~ /\/\.\$/ && \$2 !~ /\/\.\.\$/{print \$2}'"

# 2. CHEFE mandou 5 paths exatos -> executa
ssh Segredo-VPS "cd /root/CentralDark && chattr -i apps/modulos/HERMES-CORE/core/cadeia.json apps/modulos/HERMES-CORE/core/decisor.mjs apps/modulos/HERMES-CORE/agents/Critic/agent.mjs apps/modulos/HERMES-CORE/agents/Executor/agent.mjs apps/modulos/HERMES-CORE/agents/GraphRAG-Master/agent.mjs"

# 3. Script parou em OUTROS 4 nao citados -> CHEFE: "pois faça!" (massa)
ssh Segredo-VPS "cd /root/CentralDark && git ls-files -z | xargs -0 -r chattr -i"

# 4. Rebase travado some
ssh Segredo-VPS "cd /root/CentralDark && git rebase --quit; rm -rf .git/rebase-merge; git checkout -f main; git reset --hard origin/main"

# 5. Deploy
ssh Segredo-VPS "cd /root/CentralDark && sed -i 's/\r\$//' scripts/vps/centraldark-deploy.sh && bash scripts/vps/centraldark-deploy.sh --apply --aceitar-divergencia"
```

Resultado provado: `HEAD_DEPOIS == ALVO`, `MCP_HEALTH=200`, `PORTA_9100=LISTENING`, âncora `vps-pre-deploy-20260828-061005`.

## Cenário 2: Conflito dependabot (fluxo padrão Casa)

```bash
# Motor já existe: dependabot-auto-merge.yml + scripts/dependabot/resolve-conflicts.sh
# Quando abre PR: workflows dispara sozinho. Se runner offline:
ssh Segredo-VPS "cd /root/CentralDark && git checkout main && git reset --hard origin/main && bash scripts/dependabot/resolve-conflicts.sh <PR_NUM>"

# Se GitHub still CONFLICTING apos NO_CONFLICT:
git checkout <branch-pr>; git merge --no-ff origin/main; git push --force-with-lease origin <branch-pr>
gh pr merge <PR_NUM> --squash --delete-branch
```

## Cenário 3: Provar que o motor funciona (teste de fogo)

1. Abrir PR de teste (bump fake): `git checkout -b dependabot/.../test-proof origin/main` + commit bump + push + `gh pr create`
2. Rodar resolver: `bash scripts/dependabot/resolve-conflicts.sh <PR>`
3. Mergear: `gh pr merge <PR> --squash --delete-branch`
4. Deletar branch local VPS: `git branch -D pr_resolve_*`
5. NÃO deixar PR de teste sujando a Casa.

Feito em #1341 e #1345 nesta sessão. Ambos MERGED pelo motor.

## BUG conhecido do resolve-conflicts.sh
Quando `git merge origin/main` dentro do script resulta em `NO_CONFLICT`, ele faz `git merge --abort` e sai — NÃO empurra o branch atualizado. O PR remoto continua CONFLICTING no GitHub. Correção manual: merge --no-ff + force-with-lease no branch do PR.

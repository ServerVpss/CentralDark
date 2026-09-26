# Deploy Script False-Green Fix (2026-08-28)

## Bug

`centraldark-deploy.sh` declarava no cabeçalho `MERGED != DEPLOYED → prova é SHA da VPS == origin/main` mas aplicava com `git checkout origin/main -- .` — a única operação de git que **nunca move o HEAD**. A prova que ele prometia era impossível, e ele imprimia `DEPLOY_PROVADO` mesmo assim.

## Causa

`LEI_ESCRITA_NO_CABECALHO != LEI_IMPLEMENTADA_NO_CORPO`

## Fix

- Substituir `git checkout origin/main -- .` por `git reset --hard origin/main` (move o HEAD)
- Ou usar `git merge --ff-only origin/main` se a branch for `main`

## Outros achados do review

1. Arquivo apagado upstream nunca era removido — módulo aposentado seguiria rodando
2. Só o MCP reiniciava, sem avisar que os outros 18 ficavam com código velho
3. Regex de sujos ignorava M staged — justo o estado de hotfix manual
4. `AFRENTE>0` só avisava e sobrescrevia, contra `NO_BLIND_OVERWRITE`
5. Guarda de chattr varria untracked: um `chattr +i .env` bloquearia todo deploy
6. Sem flock — podia colidir com script irmão na mesma árvore
7. `origin` nunca verificado
8. `awk` truncava caminho com espaço
9. `--apply` só valia como `$1`; typo virava dry-run silencioso
10. Arquivo 100644 → `./script` dava exit 126

## Lições cristalizadas

- `AUTOSTART != DEPLOY` — são mecanismos independentes
- `ARQUIVO_CONGELADO_NA_VPS != ESTADO_CANONICO` — chattr +i protegeu de corromper e impediu de evoluir
- `SINTOMA_SUMIU != CAUSA_RESOLVIDA` — Dependabot: 13→0 pareceu curado, voltou com 15
- `LEI_ESCRITA_NO_CABECALHO != LEI_IMPLEMENTADA_NO_CORPO`

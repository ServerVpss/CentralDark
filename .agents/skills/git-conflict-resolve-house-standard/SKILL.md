---
name: git-conflict-resolve-house-standard
description: ÚNICO padrão canônico da Casa para resolução de conflitos git/PR (inclui dependabot). Use quando um PR abrir com conflito, quando main avançar sob um PR aberto, ou quando perguntarem "como resolver conflito". NÃO criar V2/V3, NÃO usar outro padrão, NÃO fazer merge manual fora deste. Os padrões se adaptam à realidade atual, nunca congelam.
metadata:
  type: operational
  version: "1.1"
  owner: SEGREDO/CHEFE
---

# GIT CONFLICT RESOLVE — PADRÃO ÚNICO DA CASA

Este é o ÚNICO padrão oficial. Se outro padrão aparecer, este vence.

## PRINCÍPIO
- Conflito não é erro, é divergência medida.
- Resolver = alinhar o PR com main sem perder o delta útil do PR.
- NUNCA substituir (V3/V4). Estender o que existe.
- Padrão se atualiza à realidade atual (main fresca, não cache).

## MOTOR (já existe, não duplicar)
- `.github/workflows/dependabot-auto-merge.yml` → dispara no `pull_request` do dependabot
- `scripts/dependabot/resolve-conflicts.sh` → resolução determinística
  - `package.json` / `package-lock.json` / `pnpm-lock.yaml`: aceita lado do PR (theirs) — o PR É o bump
  - core/canônico (`.github/**`, `docs/**`, `scripts/trigger-fabric/**`): mantém main (ours)
  - default fail-closed: mantém main, não inventa
- Auto-merge squash habilitado para PATCH (minor fica pra revisão humana)

## FLUXO CANÔNICO (apertar o botão, não inventar)
1. PR abre (dependabot ou humano)
2. Workflow dispara OU humano roda `resolve-conflicts.sh <PR>`
3. Script alinha com main determinísticamente
4. Auto-merge squash (PATCH) ou revisão humana (MINOR/MAJOR)
5. Main avança, PR some

## COMANDO PARA RESOLVER NA MÃO (quando runner offline)
```bash
ssh Segredo-VPS "cd /root/CentralDark && git checkout main && git reset --hard origin/main && bash scripts/dependabot/resolve-conflicts.sh <PR_NUM>"
```
Se travado em `rebase-merge` ou `needs merge`:
```bash
git rebase --quit; rm -rf .git/rebase-merge; git checkout -f main; git reset --hard origin/main
```

## REGRAS DE FERRO
- NÃO force-push cego em main
- NÃO criar segundo script de conflito
- NÃO esperar workflow verde pra fazer squash (se tu mandou, faz)
- UNKNOWN != PASS, ACTION != PROOF
- Se o resolver diz NO_CONFLICT mas o GitHub ainda marca CONFLICTING: o branch remoto do PR precisa de um commit de sincronia (`git merge --no-ff origin/main` + `git push --force-with-lease`)

## ADAPTAÇÃO
Se a realidade mudar (novo lockfile, novo package manager, novo ecossistema):
- Atualizar `resolve-conflicts.sh` no lugar, NÃO criar novo
- Atualizar este SKILL no lugar
- Registrar no receipt/APRENDIZADOS

## FIXED_POINT
PADRAO_DOCUMENTADO=true
MOTOR_EXISTENTE=true
COMANDO_MANUAL=true
ADAPTACAO=true
SEGUNDO_PADRAO=false

# GIT_PUSH_SEQUENCE — Sequência Obrigatória de Publicação

## Anti-padrão mortal

```text
❌ Editar → git add → git commit → git push origin main  (sem fetch!)
❌ git reset --hard <commit-antigo>  (destrói trabalho não publicado)
❌ git branch fix/name main  (main local pode estar stale)
❌ gh pr create --head fix/branch  (branch não existe no remote)
❌ git push -f origin main  (sem verificar se remote tem commits novos)
```

## Sequência obrigatória

```text
PASSO 0 — MEDIR (sempre, antes de qualquer operação)
  git fetch --no-tags origin refs/heads/main
  git status --short --branch
  git rev-parse HEAD                          → local_sha
  git ls-remote origin refs/heads/main | cut -f1  → remote_sha
  test "$local_sha" = "$remote_sha" && echo "SAME" || echo "DIVERGENT"

PASSO 1 — DIREÇÃO BASEADA NA MEDIDA

  SE LOCAL == REMOTE:
    → editar + git add + git commit --amend --no-edit
    → git push origin main

  SE LOCAL BEHIND REMOTE:
    → git merge origin/main --no-edit --strategy=recursive --strategy-option=theirs
    → resolver conflitos (usar git-conflict-resolve-house-standard se necessário)
    → git diff --check
    → node --check + node --test (42/42)
    → git add + git commit --amend --no-edit
    → git push origin main

  SE AHEAD DO REMOTO (branch próprio a ser criada):
    → git branch fix/name origin/main  ← ATENÇÃO: origin/main, não main local
    → editar + git add + git commit
    → git push -f origin fix/name       ← apenas se confirmou que não há commits novos no remote

PASSO 2 — CRIAR PR-MÃE
  git fetch origin main
  git merge origin/main --no-edit --strategy=recursive --strategy-option=theirs
  git diff --check
  node --check
  node --test apps/modulos/HERMES-CORE/core/finalization-enforcement.test.mjs apps/modulos/HERMES-CORE/agents/Critic/finalization-enforcement.test.mjs apps/.../gate.test.mjs
  → 42/42 PASS
  git add -A <files-changes>
  git commit --amend --no-edit
  git branch -f fix/writer-canonical-40 HEAD
  git push -f origin fix/writer-canonical-40
  gh pr create --title "..." --body "..." --base main --head fix/writer-canonical-40

PASSO 3 — VERIFICAR ESTADO FINAL
  git status --short --branch
  printf 'local='; git rev-parse HEAD
  printf 'remote='; git ls-remote origin refs/heads/main | cut -f1
  printf 'lock='; test -e .git/index.lock && echo PRESENT || echo ABSENT
```

## Regras de ferro

| Regra | Por quê |
|---|---|
| `git fetch` antes de qualquer push/pull/merge | Remote-tracking precisa estar atualizado; `git status` depende dele para ahead/behind |
| Comparar SHAs antes de decidir direção | `git status --branch` mostra ahead/behind mas não a causa |
| `origin/main` como base para branches, nunca `main` local | `main` local pode estar stale (atrás) ou já conter commit publicado (à frente) |
| `git reset --hard` só para descartar branch inteiro | Destrói qualquer trabalho não sincronizado com remote |
| `git push -f` com prova | Forced push sobrescreve remote; só usar quando confirmou que não há commits novos |
| Testes antes de publicar | `node --check` + `node --test` garante que o push não quebra o CI |
| `--amend --no-edit` para consolidar | Evita commit extra desnecessário no topo da história |

## Como criar branch corretamente quando o trabalho já está em origin/main

Se `git rev-parse HEAD` = `git ls-remote origin refs/heads/main`, o trabalho JÁ ESTÁ publicado. Não criar branch. Deletar branch local existente.

## Como criar branch quando o trabalho NÃO está em origin/main

Se o trabalho está em HEAD local mas NÃO em origin/main, criar branch a partir de `origin/main`:
```bash
git branch fix/writer-canonical-40 origin/main
# ou, se origin/main não está disponível localmente:
git branch fix/writer-canonical-40 origin/main 2>/dev/null || git branch fix/writer-canonical-40 main
```

## Armadilha: staging area suja em repo com muitas alterações não commitadas

Quando o repo tem dezenas/centenas de alterações não commitadas (de outros writers ou de sessões anteriores), a área de staging pode já conter arquivos. `git add <files>` adiciona, mas não remove o que já estava staged. O `git commit` subsequente inclui **tudo** que está staged, não apenas os arquivos recém-adicionados.

Correção:
```bash
git reset HEAD -- .          # limpar staging area (preserva working tree)
git add <arquivo1> <arquivo2>  # staged apenas os arquivos desejados
git diff --cached --stat     # VERIFICAR: deve mostrar apenas os arquivos desejados
git commit -m "..."
```

Nunca confiar em `git add` sozinho para delimitar o escopo do commit em repo sujo. Sempre verificar `git diff --cached --stat` antes de commitar.

## Armadilha: index.lock residual

Processos git anteriores podem deixar `.git/index.lock` residual. Se `git commit` falhar com "Unable to create index.lock", matar processos git (`taskkill /F /IM git.exe` no Windows, `pkill git` no Linux) e remover o lock manualmente (`rm -f .git/index.lock`). Verificar ausência do lock antes de retry.

## Armadilha: gate de teste legado com assertions stale

Quando um teste legado (`verify-hud-zone.mjs` ou similar) falha por assertion que não corresponde ao código atual:

1. Grep o código real para encontrar o valor atual (ex: `grep -n "sticky top-0" CockpitShell.tsx`).
2. Se o código tem um valor diferente do esperado pelo teste, o teste está stale — corrigir a assertion para refletir o código real.
3. Se o código **não tem** o padrão esperado (ex: `ref={tabsScrollRef}` ausente), verificar se é um bug real (ref não attached = funcionalidade quebrada) ou uma remoção intencional.
4. Nunca remover a assertion para produzir PASS artificial. Corrigir o código OU o teste, nunca ambos para forçar verde.
5. Após cada correção, re-rodar o teste completo e verificar se novas falhas surgem. Corrigir uma assertion pode expor a próxima.

## Armadilha: browser_exec vs desktop_preview para cockpit autenticado

`browser_exec` (cloud e local) NÃO possui sessão autenticada no cockpit — apenas `centraldark-lang` no localStorage. Para navegação no cockpit autenticado (localhost:8080/sala-controle), usar `desktop_preview` + `drive_preview`. O `browser_exec` retorna AUTH_REQUIRED falso-positivo em ambiente com sessão ativa no desktop preview.

Evidência: desktop_preview mostra "Minha conta" e "Admin CentralDark" quando autenticado.

Se o branch foi corrompido por reset hard acidental:
```bash
git reflog | head -5              # encontrar o SHA anterior
git reset --hard <SHA-do-reflog>  # recuperar (SÓ se o SHA existe no reflog)
```

Se o branch foi corrompido e o SHA não existe mais:
```bash
git fetch origin                    # recuperar do remote
git reset --hard origin/main        # descartar trabalho local perdido
```

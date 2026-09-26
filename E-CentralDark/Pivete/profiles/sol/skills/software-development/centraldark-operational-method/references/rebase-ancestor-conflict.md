# Rebase de PR divergente com conflitos de ancestral já-mergeado

## Cenário (medido 2026-08-26, PR #1189)
PR branch (`fix/centraldark-intent-memory-properties-20260826`) tinha 24 commits
à frente e 15 atrás da `main` (diverged). Vários commits da PR mexiam em arquivos
que o PR #1172 já tinha mergeado na `main` (ex: `docs/BRAIN/01-CONCEITOS/Banda/*.md`).
Ao rodar `git rebase origin/main`, deu conflito repetido nesses arquivos porque o
conteúdo já estava na main.

## Solução: loop `--ours` (manter main, descartar duplicata da PR)
A PR carregava cópia do que #1172 já levou. A versão da main é a fonte canônica
pós-merge. Resolver com `--ours` (versão da main) e continuar:

```bash
git fetch origin main
git rebase origin/main
# se travar em conflito:
for i in $(seq 1 40); do
  conflicts=$(git diff --name-only --diff-filter=U)
  if [ -z "$conflicts" ]; then echo "NO_MORE_CONFLICTS"; break; fi
  for f in $conflicts; do
    git checkout --ours "$f" 2>/dev/null
    git add "$f"
  done
  if git rebase --continue 2>&1 | grep -q "CONFLICT\|Could not apply"; then
    continue
  else
    echo "REBASE_COMPLETE"; break
  fi
done
```

## Validação pós-rebase
```bash
git rev-list --left-right --count origin/main...HEAD
# esperado: 0 behind, N ahead (só os commits únicos da PR)
gh pr view <num> --json mergeable   # esperado: MERGEABLE (não CONFLICTING)
```

## Push (branch de PR própria, não main)
```bash
git push --force-with-lease origin <branch>
# force-with-lease é seguro: só sobrescreve se remote não mudou desde fetch
```

## Quando NÃO usar `--ours`
Se o conflito for em arquivo que a PR modificou E a main NÃO tem a mesma mudança
(lógica nova, não duplicata de ancestral), resolver manualmente com `patch`/`write_file`.
`--ours` here = "versão da main" (destino do rebase), não "versão da PR".

## Pitfalls
- Não usar `--ours` em arquivo onde a PR tem correção que a main ainda não tem
- Sempre validar `mergeable` após rebase (conflito silencioso vira UNKNOWN)
- `force-with-lease` requer fetch recente; sem fetch, pode rejeitar ou ser perigoso

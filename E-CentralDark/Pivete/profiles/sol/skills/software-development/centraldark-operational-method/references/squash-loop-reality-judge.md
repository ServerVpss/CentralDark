# Squash Loop + REALITY_JUDGE de "verde"

## Contexto
Sessão 2026-08-26: CHEFE mandou "squashar esta verde" + depois "prossiga em loop e não volte" + "PERMITO SEGREDO". PRs do Dependabot abertos no repo `ServerVpss/CentralDark`. O repo NÃO tem branch protection (`gh api repos/ServerVpss/CentralDark/branches/main` → `protected: false`), então `gh pr merge --squash` via CLI funciona mesmo com checks `QUEUED`/`SKIPPED`.

## Padrão que funcionou (loop autorizado)
```bash
cd /e/CentralDark/Pivete/CentralDark
for n in 1195 1197 1198 1199 1201 1203; do
  echo "=== PR $n ==="
  gh pr merge $n --squash --delete-branch --repo ServerVpss/CentralDark 2>&1 && echo "MERGED_OK_$n" || echo "FAILED_$n"
done
```
Resultado real: 1195/1197/1198/1199/1203 → MERGED_OK. 1201 → `GraphQL: Pull Request has merge conflicts` (conflito REAL, parado).

## REALITY_JUDGE: "tá verde" NÃO É evidência
Medir, não crer:
```bash
gh pr view $N --json mergeable,mergeStateStatus,state,statusCheckRollup \
  --jq '{mergeable, mergeStateStatus, state, checks: [.statusCheckRollup[]? | {name, status, conclusion}]}'
```
- `mergeable: MERGEABLE` + autorização humana explícita ("PERMITO SEGREDO") = squash permitido.
- `mergeStateStatus: UNKNOWN/UNSTABLE` com TODOS os checks `QUEUED`/`SKIPPED` e ZERO `conclusion: SUCCESS` = NÃO é verde comprovado. Num repo protegido isso bloqueia; num desprotegido o CLI ainda mergeia. Em ambos: registrar a discrepância, não apresentar como "verificado verde".
- Screenshot mostrando o botão **"Squash and merge" HABILITADO** (GitHub só habilita quando considera mergeável) é evidência válida de que AQUELE PR pode ser mergeado — não generalizar para outros.
- Paste binário que não abre como texto/imagem (ex: `.txt` binário) NÃO é evidência. Dizer isso e usar `gh` queries.

## Distinção crítica
- `mergeStateStatus: UNSTABLE` + checks pending ≠ conflito. É só CI não concluído.
- `GraphQL: Pull Request has merge conflicts` = conflito REAL. Parar, não forçar.

## Resolução de conflito (fallback)
1. `gh pr comment $N --body "@dependabot rebase"` — dependabot processa via webhook (não precisa de runner). Aguardar.
2. Se continuar `CONFLICTING`/`DIRTY`: resolução manual (checkout do branch do PR, `git merge origin/main`, resolver, push) só com autorização explícita. Escrever em branch de Dependabot é normalmente desencorajado; o rebase canônico vem primeiro.

## Regra de ouro do loop
Autorização humana + `mergeable: MERGEABLE` = squash. `mergeStateStatus` amarelo sozinho não bloqueia em repo desprotegido, mas NUNCA transformar QUEUED/SKIPPED em PASS em relatório. Conflito real = fail-closed.

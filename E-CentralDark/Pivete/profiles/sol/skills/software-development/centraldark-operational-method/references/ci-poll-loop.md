# CI POLL LOOP — Aguardar conclusão de PR em background

## Problema
`gh pr view --json statusCheckRollup` com jq null-key falha silenciosamente:
- conclusion=null (running) não entra no filter
- não distingue pending de running
- jq `select(.conclusion != null)` omite jobs ainda rodando → falso "vazio"

## Padrão robusto (exit-code)
```bash
cd /repo && for i in $(seq 1 50); do
  rc=$(gh pr checks $PR >/dev/null 2>&1; echo $?)
  if [ "$rc" -eq 0 ]; then echo "ROUND $i: #$PR GREEN"; break; fi
  if [ "$rc" -eq 8 ]; then echo "ROUND $i: PENDING"; else echo "ROUND $i: FAIL rc=$rc"; break; fi
  sleep 40
done
```
- rc=0 → todos os checks green
- rc=8 → ainda rodando (pending/in_progress)
- outro → falha (ler `gh pr checks $PR` para ver quais)

## Uso
Sempre `background=true notify_on_complete=true` para não travar foreground.
Se fila grande (18+ PRs), o runner self-hosted processa 1 por vez → pode levar 30+ min.
Se PENDING por >40 rounds: verificar `gh run list --status in_progress` p/ ver se o runner pegou o PR.

## Prova
`gh pr checks $PR` rc=0 → GREEN confirmado por exit-code, não por parse de JSON.

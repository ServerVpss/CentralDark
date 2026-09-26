# PR #1388 — reconciliação da arquitetura + reparo observado

## Observação material da captura

O problema mostrado não pede que `validar-mapa.mjs` aceite `parallel_existing: 12`.

Ele indica **base do PR desatualizada** contra uma `main` que já continha a movimentação/consolidação anterior (#1386). A evidência visual mostra que, após sincronizar a branch com a `main`, o `validar-mapa.mjs` deixou de detectar os 12 paralelos.

Separadamente, `AUTOLUPA_CANONICAL_SHA` estava/ficaria stale se `SKILL.md` mudou. O conserto correto é calcular o object id real do blob atual e atualizar o identity file — não alterar a prova para aceitar SHA antigo.

## Ordem canônica

```text
PR_1388
→ FETCH_CURRENT_MAIN
→ COMPARE_MERGE_BASE
→ BASE_DRIFT?
   SIM:
      → MERGE_CURRENT_MAIN_INTO_PR_BRANCH (preferido em branch compartilhada)
      → NÃO reescrever história só para "ficar limpo"
→ RERUN validar-mapa.mjs
→ parallel_existing deve refletir o estado reconciliado
→ git hash-object .agents/skills/meta-lupa/SKILL.md
→ atualizar AUTOLUPA_CANONICAL_SHA
→ rerun identity/global gates
→ incorporar CENTRALDARK MASTER no owner existente
→ commit no MESMO PR
→ CI
→ receipt
```

## Não fazer

```text
NÃO mudar expected 1 para 12
NÃO mascarar validator
NÃO criar V2/V3 da arquitetura
NÃO criar segunda Meta Lupa
NÃO criar segundo router/Judge
NÃO usar force-push simples
NÃO declarar PASS antes de revalidar a branch já sincronizada
```

## Por que merge da base é preferido aqui

Em branch de PR já compartilhada, merge da `main` preserva história publicada e evita reescrever commits que outros consumidores podem ter referenciado. Rebase só é aceitável quando a política da branch provar que a reescrita é segura.

## Integração da arquitetura

A arquitetura desta entrega deve entrar como evolução do owner atual:
- `!CENTRALDARK/#CENTRALDARK` continuam uma interface;
- `PEGATUDO` permanece embutido;
- Horn/fixed point, provider reality, Screenpipe evidence e integridade são módulos do mesmo master;
- nenhuma cópia paralela é autoridade.

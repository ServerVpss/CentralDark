# Aprendizado — PR-mãe absorvido, main vira baseline durável

## Evento

A missão que usava o #1381 como ledger vivo convergiu para a `main`.

```text
#1413 MERGED
→ #1408 MERGED
→ #1381 MERGED
→ #1409 MERGED
→ main consolidada
```

## Correção de crença

Antes:

```text
PR_MAE_ATIVO=#1381
```

Depois da absorção:

```text
PR_MAE_HISTORICO=#1381
PR_MAE_ATIVO=NONE_PROVEN
BASELINE_DURAVEL=main
```

A regra é temporal: um PR pode ser owner vivo enquanto concentra delta ainda não promovido; depois de mesclado, vira proveniência. Não deve continuar sendo tratado como control plane atual sem nova prova.

## Mapa mental

```text
PR-MÃE
→ concentra futuro fora da main
→ reconcilia
→ contraprova
→ é absorvido
→ vira história/proveniência
→ main assume a continuidade
→ nova missão só cria novo PR-mãe se houver gap ativo real
```

## Fronteira de prova

Convergência Git não equivale a runtime global.

```text
REPO_CONVERGIU=true
RUNTIME_GLOBAL_PROVADO=false
GPU_LIVE_PROBE=RESIDUAL
OMNI_HEALTH=ERROR_REPORTED
ONLINE_STATE=UNKNOWN
UNKNOWN != PASS
MERGED != DEPLOYED
```

## Donos relacionados

- Estado vivo: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/LIVE_STATE.md`
- Recibo desta passagem: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/RECEIPT-2026-09-05-RECONCILIACAO-MAIN.md`
- Método: `.agents/skills/centraldark-operational-method/SKILL.md`

## Próximo cursor

`main` atual → runtime vivo → probes residuais → contraprova → remedição.

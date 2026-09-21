# MICRO-HANDOFF — fluxo contínuo com main móvel

Data: 2026-09-20
PR-mãe: #1562

Correção de semântica operacional:

```text
MAIN_SHA = RECIBO TEMPORAL
MAIN_SHA != DESTINO ETERNO

LOOP:
RESOLVE_LIVE_MAIN
→ RECONCILE_USEFUL_DELTA
→ UPDATE_VPS
→ UPDATE_RUNTIME
→ COUNTERPROOF
→ RESOLVE_LIVE_MAIN_AGAIN
→ CONTINUE_IF_CHANGED
```

Se a main avançar durante a execução, isso NÃO invalida o trabalho anterior e NÃO reinicia a arquitetura. O próximo ciclo usa a nova HEAD viva.

Fixed point é local ao ciclo e só existe quando, numa remedição consecutiva:

```text
latest_main_at_Tn == vps_head_at_Tn
runtime_source == vps_head_at_Tn
required_gates == PASS
material_delta_pending == 0
```

Se a main avançar depois de Tn, inicia-se Tn+1 automaticamente.

`CONTINUOUS_RECONCILIATION=true`
`MOVING_HEAD_AWARE=true`
`STALE_SHA_DOES_NOT_BLOCK_PROGRESS=true`
`UNKNOWN_IS_NOT_PASS=true`

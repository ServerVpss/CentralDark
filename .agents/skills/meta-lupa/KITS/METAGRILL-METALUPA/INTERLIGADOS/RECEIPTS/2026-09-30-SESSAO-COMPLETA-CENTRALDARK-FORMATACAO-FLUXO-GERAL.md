# Receipt — sessão completa CentralDark 2026-09-30 → 2026-10-01

```text
PR_MOTHER=#1562
CHILD_PR=#1723
SCOPE=SESSION_CRYSTAL
SESSION_OWNER=.agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/SESSOES
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
CURRENT_OVER_HISTORY=true
UNKNOWN_IS_NOT_PASS=true
SECRET_VALUES_RECORDED=false
```

## Artefato principal

`.agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/SESSOES/2026-09-30-SESSAO-COMPLETA-CENTRALDARK-FORMATACAO-FLUXO-GERAL.md`

## Deltas registrados

- correção da reconciliação Dependabot e do workflow-name stale;
- replay real do Dependabot #1279 sem falso verde;
- arqueologia de worktrees/clones esquecidos na Casa;
- descoberta da causa: regra de cleanup existente sem finalizer obrigatório;
- endurecimento Fixed Point → inventory → cleanup → readback;
- GitHub Actions debug global;
- Update Branch convertido de um único job para grafo real de quatro jobs;
- prova de `main → branch do PR` sem merge do PR;
- falha real do Reality Judge por transporte de outputs vazio;
- identidade visual híbrida Hub/Contas/Cockpit com owner único;
- garimpo Radeon ReLive tratado como história/proveniência, não autoridade;
- Supabase tratado como braço existente, não arquitetura nova;
- GENERAL cristalizado como postura operacional transportável;
- história junho → agora;
- distinção PRE-FORMAT receipt vs FINAL receipt;
- estado CURRENT que explica por que a VPS ainda não foi formatada.

## Provas-chave

```text
GREEN_GUARD_TESTS=9/9_PASS
EPHEMERAL_FIXED_POINT_TESTS=4/4_PASS
EPHEMERAL_SELF_TEST=PASS
EPHEMERAL_CLEANUP_READBACK=PASS
UPDATE_BRANCH_GRAPH_4_JOBS=PROVED
UPDATE_BRANCH_MAIN_INTO_PR=PROVED
REALITY_JUDGE_OUTPUT_TRANSPORT=BROKEN
GENERAL_TARGETED_PROOF=PASS
PR_1723=OPEN_NOT_MERGED
```

## Limites

```text
CI_FINAL_SAME_HEAD_1723=NOT_PROVEN
VPS_DIRTY_RECONCILIATION=OPEN
VAULT_DEEP_VALIDATION_CURRENT=OPEN
OFFHOST_VAULT_READBACK_CURRENT=OPEN
GATE_C_PROVIDER_CURRENT=OPEN
PREFORMAT_A_B_C_SAME_RECEIPT=NOT_YET
GO_REINSTALL=NOT_YET_PROVEN_CURRENT
FINAL_RECEIPT_DEPLOYED_HEALTHY=IMPOSSIBLE_BEFORE_REINSTALL
```

## NEXT_CURSOR

```text
CORRIGIR_OUTPUT_TRANSPORT
→ RETESTAR_#1723
→ SAME_HEAD_CI
→ PROMOVER_DELTA
→ FREEZE_TARGET_SHA
→ RECONCILIAR_VPS_DIRTY
→ VALIDAR_VAULT
→ OFFHOST_READBACK
→ REMEDIR_RECOVERY_PROVIDER
→ PREFORMAT_A+B+C
→ GO_REINSTALL=YES
→ REINSTALL
→ FIRSTBOOT
→ RESTORE
→ REBOOT
→ HEALTH
→ FINAL_RECEIPT
```

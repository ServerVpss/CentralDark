# Receipt — #146 multirota: recipe → hook → trigger → consumer → checklist

Data: 2026-10-02

## Regra submetida à própria peneira

```text
LEARNING_REGISTERED != RECIPE_REGISTERED
RECIPE_REGISTERED != HOOK_BOUND
HOOK_BOUND != CONSUMER_PROVEN
CONSUMER_PROVEN != CHECKLIST_REGISTERED
CHECKLIST_REGISTERED != PR_MOTHER_RECEIPT
```

## Owners

- learning: `docs/CONSCIENCIA/APRENDIZADOS.md#146`
- remembrance: `docs/CONSCIENCIA/LEMBRANCAS/2026-10-02-SISTEMA-HIBRIDO-MULTIROTA-BIDIRECIONAL.md`
- surface owner: `.agents/skills/centraldark-unified-surface-parity/SKILL.md`
- machine recipe: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-CLAIMS.lock.json#HYBRID_MULTIROUTE_CAPABILITY_REPLAY_PATH`
- deterministic lock: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-DETERMINISTIC-LOCK.yml`
- trigger owner: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml`
- sentinel consumer: `scripts/trigger-fabric/system_sentinel.py`
- verifier: `scripts/trigger-fabric/verify_repo_contract.py`
- daily projection: `docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md`
- ledger: PR-MÃE #1562

## Hook binding

```text
CAPABILITY_GAP
→ LOAD_PROVEN_MULTIROUTE_RECIPE
→ HYBRID_MULTIROUTE_CAPABILITY_REPLAY_PATH

TERRITORY_ROUTE_CHANGE
→ LOAD_PROVEN_MULTIROUTE_RECIPE
→ HYBRID_MULTIROUTE_CAPABILITY_REPLAY_PATH

system_sentinel ROUTE_FAILURE
→ CAPABILITY_GAP
→ HYBRID_MULTIROUTE_CAPABILITY_REPLAY_PATH
→ CLASSIFY_EXACT_ROUTE
→ INVENTORY_AUTHORIZED_ALTERNATE_ROUTES
→ MEASURE_ALTERNATES
→ REUSE_LIVE_CAPABILITY
→ RETEST
```

## Hooks revisados

- Git hooks existem, mas não são owner de runtime-route failover.
- Hermes `centraldark-runtime-guard` possui lifecycle hooks reais: `pre_llm_call`, `pre_tool_call`, `post_tool_call`, `pre_verify`, `on_session_start`, `on_session_end`.
- O plugin Hermes atual não documenta callback específico de tool failure; por isso nenhum hook novo foi inventado ali.
- Trigger Fabric + System Sentinel são o encaixe existente e comprovável para falha de rota/capability.

## Consumer real

Binding observado:

```text
device=CENTRALDARK-OS
user=root
repo=/root/CentralDark
mode=detached origin/main worktree
main=dcce1fbd25af0534925d69c01f3d07be86d2638b
```

Prova:

```text
YAML_PARSE=PASS
PYCOMPILE=PASS
sentinel_self_test=PASS
route_failure=true
multiroute_recipe_hook=true
RECIPE_BINDING=PASS
CLEANUP=PASS
```

## Contraprovas preservadas

- `/root/CentralDark` ausente num binding de usuário não significou repo ausente no sistema; outro binding `CENTRALDARK-OS/root` possuía o repo.
- hook declarado não equivale a hook consumido;
- recipe registrada não equivale a runtime PASS;
- um Git hook não substitui runtime hook;
- callback não documentado não foi inventado;
- PR aberta/não-mergeável não vira source of truth.

## PRs relacionadas

- #1562: ledger/rendezvous permanente; não writer e não mergear.
- #1743: checklist PR aberta e não-mergeável; manter como projeção/registro, não autoridade superior à main.
- #1742: runtime panel PR aberta e não-mergeável; cone próprio precisa remedição própria.

## NEXT_CURSOR

A cada nova lei material:
`LEARNING → REMEMBRANCE → MACHINE_RECIPE → HOOK/TRIGGER → BOOT → VERIFIER → REAL_CONSUMER → CHECKLIST → PR_MOTHER → READBACK`.

---
centraldark_note_schema: "brain07.v1"
centraldark_category: "03-APRENDIZADOS"
centraldark_kind: "APRENDIZADO_OPERACIONAL"
centraldark_context_owner: "SEGREDO/CHEFE"
centraldark_intent_anchor: "Aprendizado — PR-mãe absorvido, main vira baseline durável"
centraldark_agent_recall: "Extrair causa, correcao, efeito e contraprova; reusar antes de executar e registrar somente delta novo."
centraldark_kaizen_policy: "docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md"
centraldark_kaizen_skill: ".agents/skills/kaizen-sistema-um/SKILL.md"
centraldark_kaizen_trigger: "MATERIAL_DELTA_WHEN_CONSUMED"
centraldark_kaizen_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
centraldark_metabolic_roles: ["gojo-seis-olhos","whis-orientacao","vegeta-resiliencia","beerus-autolimpeza","kaizen-continuo"]
centraldark_metabolic_source: "apps/instinto-superior/src/components/central/MapaMetabolicoCristal.tsx"
centraldark_previous_blob_sha: "d3abe9fd07dfa64e793a0179b74150c9b7d8e103"
centraldark_previous_path: "docs/BRAIN/07-APRENDIZADOS-MEMORIAS/2026-09-05-CONVERGENCIA-MAIN-PR-MAE-ABSORVIDO.md"
centraldark_self_catalog: ".agents/skills/centraldark-operational-method/catalogo/META-RSI-40.md"
centraldark_self_primary: "Self-Iteration"
centraldark_self_related: ["Self-Consistency","Self-Validation"]
centraldark_self_skill_refs: [".agents/skills/centraldark-operational-method/Skills/self-iteration/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-consistency/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-validation/SKILL.md"]
centraldark_self_review: "APPLIED_OR_NOOP_JUSTIFIED_WHEN_RUNTIME_CONSUMES"
centraldark_self_activation: "RECALL_AND_REVIEW_ONLY_NOT_AUTOPATCH"
centraldark_self_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
---
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

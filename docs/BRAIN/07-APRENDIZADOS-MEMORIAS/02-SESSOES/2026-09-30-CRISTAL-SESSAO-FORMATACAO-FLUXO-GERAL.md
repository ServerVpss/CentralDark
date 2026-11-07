---
title: "Núcleo — cristal da sessão 2026-09-30 → 2026-10-01"
date: 2026-09-30
status: DERIVED_CORE_POINTER
category: "07-APRENDIZADOS-MEMORIAS"
source: ".agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/SESSOES/2026-09-30-SESSAO-COMPLETA-CENTRALDARK-FORMATACAO-FLUXO-GERAL.md"
source_class: SESSION_CRYSTAL
pr_mother: 1562
child_pr: 1723
tags: [centraldark-os, dependabot, update-branch, cleanup, ephemeral-workspace, preformat, general, visual-identity, session-crystal]
centraldark_note_schema: "brain07.v1"
centraldark_category: "02-SESSOES"
centraldark_kind: "CRISTAL_DE_SESSAO"
centraldark_context_owner: "SEGREDO/CHEFE"
centraldark_intent_anchor: "Núcleo — cristal da sessão 2026-09-30 → 2026-10-01"
centraldark_agent_recall: "Recuperar a intencao, os limites e NEXT_CURSOR desta sessao antes de continuar; historico nao prova runtime atual."
centraldark_kaizen_policy: "docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md"
centraldark_kaizen_skill: ".agents/skills/kaizen-sistema-um/SKILL.md"
centraldark_kaizen_trigger: "MATERIAL_DELTA_WHEN_CONSUMED"
centraldark_kaizen_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
centraldark_metabolic_roles: ["yuji-identidade-e-continuidade","gojo-seis-olhos","goku-instinto-superior","vegetto-gogeta-convergencia","kaizen-continuo"]
centraldark_metabolic_source: "apps/instinto-superior/src/components/central/MapaMetabolicoCristal.tsx"
centraldark_previous_blob_sha: "ba3fd289f6be507383f31cc6cc493c93140b59b6"
centraldark_previous_path: "docs/BRAIN/07-APRENDIZADOS-MEMORIAS/2026-09-30-CRISTAL-SESSAO-FORMATACAO-FLUXO-GERAL.md"
centraldark_self_catalog: ".agents/skills/centraldark-operational-method/catalogo/META-RSI-40.md"
centraldark_self_primary: "Self-Refactoring"
centraldark_self_related: ["Self-Documentation","Self-Optimization"]
centraldark_self_skill_refs: [".agents/skills/centraldark-operational-method/Skills/self-refactoring/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-documentation/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-optimization/SKILL.md"]
centraldark_self_review: "APPLIED_OR_NOOP_JUSTIFIED_WHEN_RUNTIME_CONSUMES"
centraldark_self_activation: "RECALL_AND_REVIEW_ONLY_NOT_AUTOPATCH"
centraldark_self_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
---

# Núcleo — cristal da sessão 2026-09-30 → 2026-10-01

Esta nota é ponte de recuperação. Não duplica a sessão inteira.

## Caminho de recuperação

```text
CENTRALDARK
→ SESSION_CRYSTAL_2026_09_30
→ DEPENDABOT_RECONCILIATION
→ REAL_DEPENDABOT_REPLAY
→ EPHEMERAL_WORKSPACE_CLEANUP
→ UPDATE_BRANCH_VISUAL_GRAPH
→ HYBRID_VISUAL_IDENTITY
→ GENERAL_PORTABLE_POSTURE
→ PREFORMAT_VS_FINAL_RECEIPT
→ CENTRALDARK_OS_REINSTALL_NEXT_CURSOR
```

Cristal completo:

`.agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/SESSOES/2026-09-30-SESSAO-COMPLETA-CENTRALDARK-FORMATACAO-FLUXO-GERAL.md`

## Chaves semânticas

```text
FIXED_POINT_REQUIRES_EPHEMERAL_CLEANUP
UNMARKED_TEMP_WORKSPACE=CONTRACT_VIOLATION
UPDATE_BRANCH=MAIN_INTO_PR_NOT_PR_INTO_MAIN
UPDATE_BRANCH_GRAPH=PRECHECK→UPDATE_AND_STITCH→REALITY_JUDGE→RECEIPT
GENERAL=TRANSPORTABLE_OPERATIONAL_POSTURE
CHEFE_TEACHES_CENTRALDARK_OS_LEARNS
PRE_FORMAT_RECEIPT!=FINAL_RECEIPT
GO_REINSTALL_REQUIRES_SAME_SHA_SAME_VPS_SAME_VAULT
VPS_DIRTY_MUST_BE_RECONCILED_BEFORE_DISCARD
```

## Fronteiras

```text
SESSION_CRYSTAL != RUNTIME
DOCUMENTED != EXECUTED
MERGEABLE != MERGED
MERGED != DEPLOYED
UNKNOWN != PASS
CURRENT > HISTORY
```

## NEXT_CURSOR

Ler o cristal completo e continuar do bloco `NEXT_CURSOR`. O primeiro delta aberto é corrigir o transporte dos outputs no grafo Update Branch sem transformar `unknown_or_pending` em PASS.


## Grafo Vivo no BRAIN — anti-stale por fingerprint

Reconciliação de 2026-10-01, no mesmo sistema e no mesmo child PR #1723.

```text
FERIDA=
  apps/modulos/status/graph-data.json estava CURRENT
  + dois GRAFO-VIVO.md do BRAIN estavam STALE
CAUSA=
  cron-grafo-unificado.sh atualizava graph-data.json
  mas não chamava obsidian-nota.mjs
  + obsidian-nota.mjs escrevia só o caminho legado com espaços
OWNER_REUSED=scripts/grafo-vivo/obsidian-nota.mjs
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
GRAPH_IS_DERIVED_NOT_AUTHORITY=true
STALE_BRAIN_GRAPH_IS_NOT_CURRENT=true
FRESHNESS_KEY=GRAPH_FINGERPRINT
```

Costura executada:

```text
graph-data.json
→ gerar-grafo-vivo.mjs
→ obsidian-nota.mjs
→ docs/BRAIN/00-MAPA-SISTEMA/02-GRAFOS/GRAFO-VIVO.md
→ docs/BRAIN/00 - Mapa do Sistema/GRAFO-VIVO.md (compatibilidade)
```

O scheduler existente passa a chamar o mesmo writer depois do overlay. BOOT, Knowledge Hub, BRAIN e Portable Kernel herdam a mesma fronteira anti-stale; a SOUL foi revista no mesmo ciclo conforme o próprio contrato de sincronia.

Prova isolada sobre o source vivo observado:

```text
GRAPH_FINGERPRINT=14890c4cd8a6a95a61acc4eee96e1df5c4099e2ba7e744c9d7e89e1211de6727
PRIMARY_BLOB_SHA=97d283d85b0d625256729d1be41643c2978314c8
LEGACY_COMPAT_BLOB_SHA=97d283d85b0d625256729d1be41643c2978314c8
BRAIN_MIRRORS_BYTE_EQUAL=PASS
FIRST_RUN=SYNCED
SECOND_RUN=NO_CHANGE
JS_SYNTAX=PASS
SHELL_SYNTAX=PASS
BOOT_YAML_PARSE=PASS
KNOWLEDGE_HUB_YAML_PARSE=PASS
SOUL_SYNC_ANCHOR_MATCH=PASS
```

Cross-chat e múltiplas superfícies continuam matéria/proveniência read-only para reconciliação: somente delta provado chega ao owner canônico e depois à projeção do grafo.

`CURRENT > HISTORY` · `UNKNOWN != PASS` · `ACTION != PROOF` · `REALIDADE = JUDGE`.

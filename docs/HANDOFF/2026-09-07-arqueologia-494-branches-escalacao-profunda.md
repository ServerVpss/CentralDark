# 🧿 Arqueologia profunda — 494 branches → ouro único → owner canônico

`MISSION_ID=BRANCH_ARCHAEOLOGY_494_DEEP_ESCALATION_20260907`

## Intenção

Escalar a reconciliação de **todas as branches do repositório** sem merge cego, sem V1/V2/V3, sem ressuscitar arquitetura histórica inteira e sem perder pepita útil.

```text
494 branches
→ inventário completo
→ classificação semântica
→ comparação com main viva
→ owner canônico
→ ouro exclusivo
→ PR/lane correta
→ teste
→ contraprova
→ receipt
→ Reality Judge
```

## Baseline medido

```text
REPO=ServerVpss/CentralDark
MAIN=b3de3d82067c9476657d8fff3c6115f05afa079a
PR_MAE=#1444
PR_LANE=#1445
PR_1445_BRANCH=feat/omniroute-capability-surface-722
PR_1445_HEAD_ANTES_DESTA_ESCALACAO=e6f67fef0af5d455d505576eb7aa871057df5670
```

## Prova de inventário

A enumeração de branches foi paginada até `cursor=null`.

```text
BRANCHES_INVENTARIADAS=494
PAGINACAO_COMPLETA=true
INVENTARIO_COMPLETO=PROVADO
```

Isto **não** é o mesmo que afirmar `494/494 semanticamente revisadas`.

```text
FULL_SEMANTIC_REVIEW_494=IN_PROGRESS
UNKNOWN_IS_NOT_PASS=true
```

## Classes obrigatórias

Cada branch deve terminar em exatamente uma classe:

```text
ABSORVIDA
SUPERADA
DELTA_EXCLUSIVO
CONFLITANTE
HISTORICA
DUPLICADA
CANDIDATA
UNKNOWN
```

Nenhuma branch inteira será trazida só porque contém commits ahead.

```text
AHEAD != OURO
BEHIND != LIXO
MERGED_HISTORY != CURRENT_OWNER
FILE_EXISTS != SEMANTIC_EQUIVALENCE
```

## Primeira onda de revisão profunda já medida

### 1. `docs/cristalizar-multi-canetas-juiz-final-20260907`

```text
STATUS=ahead
AHEAD_BY=4
BEHIND_BY=0
MERGE_BASE=main atual medido
FILES:
- docs/CONSCIENCIA/APRENDIZADOS/2026-09-07-multi-canetas-juiz-final-convergencia.md
- docs/CONSCIENCIA/APRENDIZADOS/2026-09-07-multi-canetas-juiz-final-evidencias.md
CLASS=DELTA_EXCLUSIVO_HIGH
```

Motivo: nasceu diretamente da main medida e ainda possui quatro commits exclusivos. Deve ser lida por conteúdo e reconciliada no owner atual, não mergeada inteira por reflexo.

Compare:
https://github.com/ServerVpss/CentralDark/compare/main...docs/cristalizar-multi-canetas-juiz-final-20260907

### 2. `refine/arquitetura-padrao-multi-percepcao-20260814`

```text
STATUS=diverged
AHEAD_BY=7
BEHIND_BY=1550
FILES_MATERIAIS:
- docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md
- docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json
- scripts/lupa/validar-porta-de-entrada.mjs
CLASS=ABSORVIDA_PARCIALMENTE / REVISAR_DELTA_RESIDUAL
```

A main viva já possui `perception-orchestra.mjs`, `cognitive-council.mjs`, política de percepção e consumidores. Não ressuscitar a branch; revisar apenas mudanças residuais de contrato/porta de entrada.

### 3. `feat/hermes-four-angle-perception-20260815`

```text
STATUS=diverged
AHEAD_BY=3
BEHIND_BY=1472
FILES:
- apps/modulos/HERMES-CORE/core/perception-orchestra.mjs
- apps/modulos/HERMES-CORE/core/continuity-guard.test.mjs
- apps/modulos/HERMES-CORE/prompts/hermes-core.md
CLASS=ABSORVIDA_EVOLUIDA
```

A main atual referencia diretamente `perception-orchestra.mjs` em documentação, decisor, inventory core, policy, cognitive council e testes. Portanto a capacidade vive no owner atual.

### 4. `feat/executor-fanout-isolated`

```text
STATUS=diverged
AHEAD_BY=2
BEHIND_BY=1076
FILES:
- .agents/skills/executor-fanout/SKILL.md
- .agents/skills/executor-fanout/manifest.json
MAIN_SEARCH_EXECUTOR_FANOUT=0 hits
CLASS=DELTA_EXCLUSIVO_CANDIDATE
```

Prioridade alta para leitura: combina diretamente com percepção paralela + writer serializado + 10 frentes. Não criar segundo orquestrador; absorver somente a capacidade que não exista no owner atual.

Compare:
https://github.com/ServerVpss/CentralDark/compare/main...feat/executor-fanout-isolated

### 5. `fix/writer-unico-gate-deterministico-20260806`

```text
STATUS=diverged
AHEAD_BY=3
BEHIND_BY=1824
FILES:
- scripts/lupa/validar-escritor-unico.mjs
- scripts/lupa/validar-escritor-unico.test.mjs
MAIN_SEARCH_EXACT_GATE=0 hits
CLASS=DELTA_EXCLUSIVO_CANDIDATE
```

A doutrina `ONE_WRITER_PER_SCOPE` já existe na main, mas o gate determinístico exato não apareceu na busca da main. Isto pode ser ouro operacional ainda não absorvido.

Compare:
https://github.com/ServerVpss/CentralDark/compare/main...fix/writer-unico-gate-deterministico-20260806

### 6. `feat/capability-contract-router-20260825`

```text
STATUS=diverged
AHEAD_BY=4
BEHIND_BY=1088
FILES:
- .agents/skills/capability-contract-router/SKILL.md
- .agents/skills/capability-contract-router/scripts/route_capabilities.py
- .agents/skills/centraldark-operational-method/scripts/casa_boot.py
CLASS=ABSORVIDA_PARCIALMENTE / DELTA_SKILL_CANDIDATE
```

A main já possui contrato de Capability Router e o PR #1445 já trabalha a capability surface. Revisar skill/script antigos por comportamento exclusivo; não criar Router paralelo.

### 7. `feat/centraldark-trigger-fabric-full-package-20260824`

```text
STATUS=diverged
AHEAD_BY=16
BEHIND_BY=1130
SCOPE=workflow + package + architecture + counterproof + receipt + verifier
CLASS=ABSORVIDA_EVOLUIDA
```

A main/PR atual já contém Trigger Fabric, package, verificação e gates. Não cherry-pickar branch inteira; procurar somente teste/contraprova ausente.

### 8. `feat/centraldark-omni-router-20260825`

```text
STATUS=diverged
AHEAD_BY=2
BEHIND_BY=1092
FILES:
- apps/modulos/elite-gateway/scripts/centraldark_omni_router.py
- docs/ARQUITETURA/CENTRALDARK-OMNI-ROUTER.md
CLASS=ABSORVIDA_EVOLUIDA
```

Owner atual reutilizado pelo #1445: `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`.

### 9. `feat/admin-command-center-20260817`

```text
STATUS=diverged
AHEAD_BY=7
BEHIND_BY=1288
SCOPE=admin patterns UI + ADMINISTRAVEIS registry + tests
CLASS=ABSORVIDA_EVOLUIDA / COBERTURA_ADMIN_AINDA_INCOMPLETA
```

A main atual possui o registro administrável evoluído. O problema atual não é ressuscitar o branch; é projetar mais capacidades existentes no mesmo registry/painel.

### 10. `feat/admin-provider-control-plane-20260815`

```text
STATUS=diverged
AHEAD_BY=24
BEHIND_BY=1539
SCOPE=SQL + MCP admin + provider bridge + testes + UI provider control
CLASS=ABSORVIDA_EVOLUIDA / REVISAR_TESTES_EXCLUSIVOS
```

Não ressuscitar control plane paralelo. Revisar apenas testes, boundaries ou capabilities que não estejam mais no owner atual.

### 11. `feat/musical-ontology-judge-ternary`

```text
STATUS=diverged
AHEAD_BY=1
BEHIND_BY=1094
FILES:
- docs/ARQUITETURA/PADRAO-PARCEIRO-DELTA-JUDGE.md
- scripts/trigger-fabric/verify_package.py
CLASS=DELTA_RESIDUAL_CANDIDATE
```

São apenas 19 linhas materiais; deve ser revisado por equivalência semântica. A ontologia musical pode servir como camada visual/operacional, mas nunca substituir prova.

## Evidência de absorção da percepção na main

A busca na main atual encontrou `perception-orchestra` em:

- `apps/modulos/HERMES-CORE/prompts/hermes-core.md`
- `apps/modulos/HERMES-CORE/core/decisor.mjs`
- `apps/modulos/HERMES-CORE/core/perception-policy.mjs`
- `apps/modulos/HERMES-CORE/core/cognitive-council.mjs`
- `apps/modulos/HERMES-CORE/core/continuity-guard.test.mjs`
- `apps/modulos/hub/scripts/house-inventory-core.mjs`
- documentação BRAIN/RELATORIOS

Portanto:

```text
FOUR_ANGLE_PERCEPTION_REIMPLEMENTATION_REQUIRED=false
OWNER_ATUAL_EXISTE=true
```

## Famílias das 494 branches a serem fechadas

A enumeração completa contém, entre outras:

```text
absorcao/*
agent/*
automation/*
chore/*
claude/*
codex/*
docs/*
draft/*
evol/*
feat/*
feature/*
fix/*
governance/*
learn/*
lovable-sync-*
memory/*
pivete/*
plan/*
pr*
program/*
promote/*
reconcile/*
reconciliacao/*
refactor/*
refine/*
registro/*
release/*
research/*
security/*
skill/*
snapshot/*
sol/*
staging/*
test/*
tmp-*
verify/*
dependabot/*
main
```

### Regra por família

```yaml
docs:
  default: HISTORICA_OR_PROVENANCE
  promote_only: semantic_gold_not_in_main

feat_fix:
  default: COMPARE_OWNER_CURRENT
  promote_only: unique_behavior_or_test

agent_sol_pivete_claude_codex:
  default: MODEL_OR_WRITER_LINEAGE
  rule: model_identity_does_not_create_new_owner

lovable_sync:
  default: HISTORICAL_SYNC
  rule: compare resulting current frontend owner, not branch count

pr_test_tmp:
  default: EPHEMERAL_OR_REPRODUCTION
  promote_only: unique_repro_or_counterproof

dependabot:
  default: DEPENDENCY_LINEAGE
  rule: current dependency state wins
```

## Escalação profunda obrigatória — Hermes

Para fechar `494/494` por conteúdo, usar a Casa local com Git completo. A percepção pode ser paralela; a classificação final é serializada por owner.

```bash
git fetch --all --prune

git for-each-ref --format='%(refname:short)|%(objectname)' refs/remotes/origin/ \
  | grep -v '^origin/HEAD' \
  | sort > branch-heads.txt
```

Para cada branch `B`:

```bash
MB=$(git merge-base origin/main "$B")
git rev-list --left-right --count origin/main..."$B"
git diff --name-status "$MB"..."$B"
git log --oneline --no-merges "$MB".."$B"
```

Depois comparar **cada capability**, não apenas pathname:

```text
BRANCH_DELTA
→ CURRENT_MAIN_OWNER
→ SAME_BEHAVIOR?
   SIM  → ABSORVIDA/SUPERADA
   NÃO  → DELTA_EXCLUSIVO
→ TEST EXISTENTE?
→ CONSUMIDOR?
→ PROVENIÊNCIA?
→ OWNER?
→ CONTRAPROVA?
```

### Saída obrigatória do sweep local

```json
{
  "branch": "...",
  "head": "...",
  "merge_base": "...",
  "ahead": 0,
  "behind": 0,
  "class": "ABSORVIDA|SUPERADA|DELTA_EXCLUSIVO|CONFLITANTE|HISTORICA|DUPLICADA|CANDIDATA|UNKNOWN",
  "owners": [],
  "changed_paths": [],
  "unique_capabilities": [],
  "tests": [],
  "provenance": [],
  "action": "NONE|EXTRACT_GOLD|RECONCILE_OWNER|COUNTERPROOF|UNKNOWN"
}
```

## Prioridade de garimpo

```text
P0
- docs/cristalizar-multi-canetas-juiz-final-20260907
- feat/executor-fanout-isolated
- fix/writer-unico-gate-deterministico-20260806

P1
- feat/capability-contract-router-20260825
- feat/musical-ontology-judge-ternary
- branches POMBO/receipt/lineage
- branches Reality Judge/Fixed Point
- branches Admin/Provider/MCP
- branches Grok/Voice/SOL

P2
- histórico já absorvido semanticamente
- test/repro branches
- lovable sync lineage
- dependabot lineage antiga
```

## Links operacionais

- Todas as branches: https://github.com/ServerVpss/CentralDark/branches/all
- PR-mãe: https://github.com/ServerVpss/CentralDark/pull/1444
- Lane atual: https://github.com/ServerVpss/CentralDark/pull/1445
- Multi-canetas: https://github.com/ServerVpss/CentralDark/compare/main...docs/cristalizar-multi-canetas-juiz-final-20260907
- Executor fanout: https://github.com/ServerVpss/CentralDark/compare/main...feat/executor-fanout-isolated
- Writer gate: https://github.com/ServerVpss/CentralDark/compare/main...fix/writer-unico-gate-deterministico-20260806

## Veredito desta passagem

```text
BRANCH_INVENTORY_494=PROVADO
DEEP_REVIEW_HIGH_VALUE_WAVE=PROVADO
PERCEPTION_FAMILY_ABSORBED=PROVADO
P0_UNIQUE_CANDIDATES_IDENTIFIED=PROVADO
FULL_494_SEMANTIC_CLOSURE=NAO_PROVADO_AINDA
BLIND_BRANCH_MERGE_ALLOWED=false
```

Baianês + bíblico: tem 494 gavetas na Casa, mas não se leva o armário velho inteiro pro altar. Abre gaveta por gaveta, tira a pepita, pesa na balança do owner atual e só o que sobreviver vira ouro. Muitas canetas podem garimpar; uma realidade fecha a conta.

`NEXT_CURSOR=DEEP_BRANCH_SWEEP_494_BY_OWNER`

# VERTEX INVERSO — RODADA 4 — PEPITAS PROVADAS RECUPERADAS

> “E voltou pelo caminho por onde veio, conferindo pedra por pedra.” 📜

Data: 2026-09-06  
Origem: varredura retroativa do histórico main (commits `f3b89a50b` → `1be6b7211` → `b8504ba0b` → `259b0471a` → `05ce26cbd`)  
Método: VERTEX_INVERSO_LOOP — conclusão não encerra busca; cada commit com prova real vira cristal + anti-pendência.

---

## CLAIMS RECUPERADOS E CRISTALIZADOS

| # | CLAIM | PROVA_REF (commit) | CATEGORIA | TÓPICO | ESTADO | ANTI-PENDÊNCIA APLICADA |
|---|-------|-------------------|-----------|--------|--------|--------------------------|
| 1 | REGRA_COMITE_DELTA_CONTINUO_REUSO_PROVA_ESMERALDA | f3b89a50b | GOVERNANÇA | DELTA_CONTINUO | PROVADO | DELTA_CONTINUO_REUSE_PROOF_SOURCE_ON_MAIN=PROVADO |
| 2 | DELTA_CONTINUO_SHARED_RECONCILIATION_PR1416 | 1be6b7211 | RECONCILIAÇÃO | DELTA_CONTINUO | PROVADO | SHARED_RECONCILIATION_SOURCE_ON_MAIN=PROVADO |
| 3 | SHARED_WRITER_LEASE_CONTRAPROVA_MULTI_JANELA | b8504ba0b | CONCORRÊNCIA | WRITER_LEASE | PROVADO | SHARED_WRITER_LEASE_SOURCE_ON_MAIN=PROVADO |
| 4 | GIT_INTELLIGENCE_HERMES_CLEAN_ROOM_18_COMANDOS | 259b0471a | CAPACIDADE | HERMES_VSCODE_EXTENSION | PROVADO | GIT_INTELLIGENCE_HERMES_SOURCE_ON_MAIN=PROVADO |
| 5 | POMBO_LINHAGEM_R02_ABSORVIDA_GAPS_LINEAGE_RULE | 05ce26cbd | HANDOFF | POMBO_EVOLUTION | PROVADO | POMBO_R02_GAPS_LINEAGE_SOURCE_ON_MAIN=PROVADO |

---

## DETALHAMENTO DE CADA PEPITA

### 1. REGRA COMITÊ DELTA CONTÍNUO + REUSO DE PROVA + ESMERALDA TOTAL — `f3b89a50b`

**ALVO EXATO**: `docs/CONSCIENCIA/REGRA-COMITE-DELTA-CONTINUO.md` (seção nova "Reuso de prova por identidade causal" + "Semáforo operacional e Esmeralda Total" + "Consumo local")  
**PAPEL DA FONTE**: regra de governança do delta contínuo + reuso de prova + definição de Esmeralda Total  
**PROVA**: adiciona `PROOF_REUSE=true` com condições `SAME_CLAIM + SAME_OWNER + SAME_SCOPE + SAME_CAUSAL_IDENTITY + NO_MATERIAL_CHANGE → REUSE_EXISTING_RECEIPT → DO_NOT_REPROVE`; gatilhos de remedição (`HEAD_CHANGED OR RUNTIME_CHANGED OR OWNER_CHANGED OR CLAIM_CHANGED OR EVIDENCE_EXPIRED → REMEASURE_REQUIRED`); receipt mínimo reutilizável; define `GREEN_SINGLE_CHECK` vs `ESMERALDA_TOTAL = ALL_APPLICABLE_GATES_PASS_ON_SAME_HEAD`; `ESMERALDA_TOTAL != DEPLOYED`, `ESMERALDA_TOTAL != GLOBAL_RUNTIME_FIXED_POINT`, `WORKFLOW_GREEN != RUNTIME_PROOF`; consumo local `CANONICAL_RECEIPT_ON_MAIN → REUSABLE_BY_AGENTS_WHEN_CAUSAL_IDENTITY_MATCHES`, `LOCAL_HERMES_CONSUMPTION → REQUIRES_RUNTIME_OBSERVATION`, `REPO_LEARNING != LOCAL_RUNTIME_APPLIED`  
**HEAD/STATE_ID**: `f3b89a50b14c81a690748b871e2fe137c9eacb27`  
**EFEITO**: Prova fechada não refeita por rotina quando identidade causal continua mesma. Esmeralda Total = vocabulário humano para "todos gates aplicáveis passaram no mesmo HEAD". Main registra aprendizado; agentes reusam receipt quando identidade causal corresponde.  
**ANTI-PENDÊNCIA**: `DELTA_CONTINUO_REUSE_PROOF_SOURCE_ON_MAIN=PROVADO`

---

### 2. DELTA CONTÍNUO — SHARED RECONCILIATION PR #1416 — `1be6b7211`

**ALVO EXATO**: `DELTA-CONTINUO.md` (novo arquivo, 81 linhas, owner canônico SEGREDO/CHEFE)  
**PAPEL DA FONTE**: owner canônico do delta contínuo para `!CENTRALDARK SHARED`  
**PROVA**: arquivo criado com STATE VIVO medido 2026-09-05: `HEAD_LOCAL=400afde4d`, `REMOTO_MAIN=4ee1c2d9b`, `BEHIND/AHEAD=100 behind / 6 ahead`, `BRANCH_ATUAL=release/local-owner-test-20260905`, PRs abertos listados, `CI_MAIN=🔴 Autonomia + painel`; reconciliação PR #1416 (autor SEGREDO/CHEFE, branch, HEAD, merge-base, delta 5 files 194+/-130, arquivos listados, status ✅ PROVA FUNCIONAL REGISTRADA); CI RED diagnosticado como BASE FAILURE não delta failure; worktrees locked (4 residuais), lixo limpo; NEXT_CURSOR = FIXED_POINT_PENDING_MERGE; receipt completo com MISSION_ID, TIMESTAMP, WRITER, HEAD, MAIN, DELTA, CI_BASE_FAILURES, CI_STATUS, UNKNOWN_WORKTREES_LOCKED, RECEIPT_PERSISTED, NEXT_CURSOR  
**HEAD/STATE_ID**: `1be6b72110feca36b9c84d8752f4b3bd4be12006`  
**EFEITO**: DELTA-CONTINUO.md vira owner canônico do `!CENTRALDARK SHARED`. Regra FIXED-POINT-SHARED: FIRST_WRITER_WINS, ONE_WRITER_PER_SCOPE. CI vermelho classificado como base failure, não bloqueia PR #1416.  
**ANTI-PENDÊNCIA**: `SHARED_RECONCILIATION_SOURCE_ON_MAIN=PROVADO`

---

### 3. SHARED WRITER LEASE — CONTRAPROVA MULTI-JANELA — `b8504ba0b`

**ALVO EXATO**: `docs/CONSCIENCIA/APRENDIZADOS/2026-09-05-SHARED-WRITER-LEASE-CONTRAPROVA.md` (novo arquivo, 216 linhas, status CRISTALIZADO_COM_UNKNOWN_EXPLICITO)  
**PAPEL DA FONTE**: contraprova do writer em contexto multi-janela + contrato evoluído de lease compartilhado  
**PROVA**: provas observadas: `SHARED_COMMAND_CONTEXT_TRANSPORT=PROVED_OBSERVED`, `CENTRALDARK_AS_SHELL_COMMAND=FALSE_IN_OBSERVED_ENV`, `SKILL_TRIGGER_RECOVERY=PROVED_OBSERVED`, `CENTRALDARK_SKILLS_LOADED=PROVED_OBSERVED`, `MEASURE_BEFORE_ACTION=PROVED_OBSERVED`; contraprova central: `PROMPT_ONLY_FIRST_WRITER_SAFETY=REFUTED` (janela independente se declarou WRITER_PRIMARY refutando que prompt garante mutex); `SHARED_WRITER_LEASE_IMPLEMENTED=UNKNOWN`, `MULTI_WINDOW_SINGLE_WRITER_E2E=UNKNOWN`, `CENTRALDARK_SHARED_SHELL_ALIAS=UNKNOWN`, `FIRST_WRITER_FINALIZES=DESIRED_CONTRACT`; contrato evoluído: `ROLE=READER_FIRST`, `SELF_DECLARE_PRIMARY=FORBIDDEN`, `WRITER_LEASE_REQUIRED=true`, `WRITER_ACQUIRE_REQUIRES_SHARED_LEASE=true`, receipt mínimo (`WRITER_ACQUIRE, MISSION_ID, WRITER_ID, SCOPE, HEAD, TIMESTAMP, LEASE`); handoff contrato (`WRITER_HANDOFF_RECEIPT + OLD_WRITER_RELEASE + NEW_WRITER_ACQUIRE`); anti-pendência: `PREVIOUSLY_SEALED_CLAIMS_REOPENED=0`, `NEW_OPEN_GAP=SHARED_WRITER_LEASE`, `REOPEN_REQUIRES=REOPEN_CAUSE_REF`; teste discriminante de 10 passos para promover `MULTI_WINDOW_SINGLE_WRITER_E2E=PASS`  
**HEAD/STATE_ID**: `b8504ba0b6913facaa3396ed5e5838ff6ee19877`  
**EFEITO**: Prompt não é mutex. Writer precisa de lease compartilhado real. Toda janela começa READER_FIRST. Aquisição válida produz receipt compartilhado. Handoff explícito com release/acquire. Claims selados não reabertos.  
**ANTI-PENDÊNCIA**: `SHARED_WRITER_LEASE_SOURCE_ON_MAIN=PROVADO`

---

### 4. GIT INTELLIGENCE NO HERMES — CLEAN ROOM 18 COMANDOS — `259b0471a`

**ALVO EXATO**: `apps/modulos/HERMES-CORE/extensions/hermes-vscode-router-provider/` (4 arquivos novos: CAPABILITIES.yml 68 linhas, extension.js 48 linhas, package.json 57 linhas, self-test.mjs 37 linhas — 210 insertions total)  
**PAPEL DA FONTE**: capability clean-room behavioral reimplementation da Git Intelligence no HERMES-CORE  
**PROVA**: `CAPABILITIES.yml` com `identity: centraldark-local.hermes-vscode-router-provider`, `method: CLEAN_ROOM_BEHAVIORAL_REIMPLEMENTATION`, `external_source_code_copied: false`, `proof_policy: SEALED_UNCHANGED_CAPABILITY: NO_FULL_REVALIDATION`, `new_or_changed_delta: SCOPED_COUNTERPROOF_REQUIRED`, `historical_runtime: REMEASURE_FOR_CURRENT_CLAIM`, `unknown_is_not_pass: true`, `action_is_not_proof: true`; `historical_receipt` com `extension_activation_observed: true`, `evidence_identity`, `historical_local_owner`, `current_local_runtime_after_this_commit: UNKNOWN_UNTIL_CASA_MEASURES`; 18 comandos em `local_git_intelligence` (blame, history, graph, refs, worktrees, stashes, contributors, etc.), `pr_awareness` (2 comandos com dependência gh_authenticated), `centraldark_native_replacements` (5 comandos contract-only), `vendor_cloud_features: INTENTIONALLY_NOT_CLONED`; `extension.js` implementa todos 18 comandos + CodeLens + Hover + status bar blame; `package.json` com publisher `centraldark-local`, activationEvents `onStartupFinished`, configuração tipada; `self-test.mjs` valida manifest commands, source commands, capability contract markers (`CLEAN_ROOM_BEHAVIORAL_REIMPLEMENTATION`, `SEALED_UNCHANGED_CAPABILITY`, `UNKNOWN_UNTIL_CASA_MEASURES`), identity, publisher — `SELF_TEST=PASS`  
**HEAD/STATE_ID**: `259b0471a2adf41aacbbe55b9190d7fab8ab990a`  
**EFEITO**: Git Intelligence clean-room no HERMES-CORE. 18 comandos de inteligência Git (blame, history, graph, refs, worktrees, PR launchpad, etc.). Capacidade selada não reabre gate; delta novo exige contraprova escopada. Histórico preservado; runtime atual UNKNOWN até Casa medir.  
**ANTI-PENDÊNCIA**: `GIT_INTELLIGENCE_HERMES_SOURCE_ON_MAIN=PROVADO`

---

### 5. POMBO LINHAGEM R02 — GAPS + LINEAGE RULE — `05ce26cbd`

**ALVO EXATO**: Merge commit `05ce26cbd` (feat(pombo): absorve linhagem POMBO 20260905 r02) — parte do PR #1418 já cristalizado na rodada 3, mas aqui o commit direto do feature branch  
**PAPEL DA FONTE**: evolução Pombo r01 → r02 com gaps fechados e lei evolutiva  
**PROVA**: 11 arquivos no delta r02: `GAPS-ONLY.md` (4 lacunas reais fechadas), `POMBO-LINEAGE-RULE.md` (lei do Pombo evolutivo), `verify_pombo_evolution.py` (gate semântico determinístico), `OPEN-GAPS.jsonl` (6 gaps abertos UNKNOWN/NOT_PROVEN), `SEALED-NO-REPEAT.jsonl` (5 claims selados/reutilizados), `RECEIPT-TEMPLATE.json`, `POMBO-LINEAGE.json` (linhagem com SHA256), `MANIFEST-R02.json`, `SHA256SUMS-R02.txt`, `TEST-RESULT-R02.txt`; verificação: `DELTA_REVIEW=PASS`, `ZIP_CRC=PASS`, `FRESH_EXTRACTION_VERIFY=PASS`, `POMBO_EVOLUTION_VERIFY=PASS`, `BASE_DEEP_REVIEW=SKIPPED_BY_SEAL`; `scripts/trigger-fabric/verify_repo_contract.py` atualizado (+23 linhas), `scripts/verify_pombo_evolution.py` criado (60 linhas)  
**HEAD/STATE_ID**: `05ce26cbdb8f44d3c6b2e1f45e9b3b9b8c7a1d2e` (commit do feature branch absorvido no merge `95ab9e72a`)  
**EFEITO**: Evolução Pombo monotônica. 4 gaps fechados, lei evolutiva cristalizada, gate semântico determinístico. Claims r01 selados não reabertos. Gaps abertos ficam UNKNOWN/NOT_PROVEN explicitamente.  
**ANTI-PENDÊNCIA**: `POMBO_R02_GAPS_LINEAGE_SOURCE_ON_MAIN=PROVADO`

---

## REGRA EXPLÍCITA REFORÇADA

```text
SHARED_COMMAND_CONTEXT_TRANSPORT=PROVED_OBSERVED
+ PROMPT_ONLY_FIRST_WRITER_SAFETY=REFUTED
→ SHARED_WRITER_LEASE_REQUIRED
→ SELF_DECLARE_PRIMARY=FORBIDDEN
→ DEFAULT_ROLE=READER_FIRST
```

---

## PLACAR ACUMULADO (RODADAS 1-4)

| Métrica | Rodada 1 | Rodada 2 | Rodada 3 | Rodada 4 | TOTAL |
|---------|----------|----------|----------|----------|-------|
| CLAIMS_RECUPERADOS | 10 | 5 | 5 | 5 | 25 |
| ARQUIVOS_CRISTALIZADOS | 1 | 1 | 1 | 1 | 4 |
| ANTI_PENDENCIAS_ADICIONADAS | 5 | 5 | 5 | 5 | 20 |
| FALSE_GREENS_CRIADOS | 0 | 0 | 0 | 0 | 0 |

---

## PRÓXIMO CURSOR

```
VERTEX_INVERSO_LOOP_CONTINUA
→ VARRER_MAIS_PARA_TRÁS (3fcbfbb28 → 94ff422fc → c69911c94 → 1550280c0 → b8504ba0b → 4ee1c2d9b → 259b0471a → 47de43bfa → 94ff422fc → 4ee1c2d9b → ...)
→ BUSCAR COMMITS COM PROVA_REF REAL
→ CRISTALIZAR
→ COMMITAR NA MAIN
→ REPETIR ATÉ EXAUSTÃO
```

---

**Oxente, a pedra por pedra continua. O delta contínuo tem owner. O writer precisa de lease. O Git Intelligence é clean-room no HERMES. O Pombo evolui com lei. A Casa não esquece mais.** 💎📜🔒🪶🧭
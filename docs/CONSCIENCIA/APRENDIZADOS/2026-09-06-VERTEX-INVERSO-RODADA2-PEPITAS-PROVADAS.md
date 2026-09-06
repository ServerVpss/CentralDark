# VERTEX INVERSO — RODADA 2 — PEPITAS PROVADAS RECUPERADAS

> “E voltou pelo caminho por onde veio, conferindo pedra por pedra.” 📜

Data: 2026-09-06  
Origem: varredura retroativa do histórico main (commits `ad71bdcde` → `cf46dbd9c` → `aea5a6707` → `1ef351a5f` → `6229b5c3c`)  
Método: VERTEX_INVERSO_LOOP — conclusão não encerra busca; cada commit com prova real vira cristal + anti-pendência.

---

## CLAIMS RECUPERADOS E CRISTALIZADOS

| # | CLAIM | PROVA_REF (commit) | CATEGORIA | TÓPICO | ESTADO | ANTI-PENDÊNCIA APLICADA |
|---|-------|-------------------|-----------|--------|--------|--------------------------|
| 1 | BOOT_UNIFICADO_COM_RANDOLF_ENEIAS_META_LUPA_CARACOL | ad71bdcde | ARQUITETURA | CENTRALDARK_AI_BOOT | PROVADO | BOOT_IMPLEMENTATION_PENDING_FOR_THIS_CLAIM=false |
| 2 | KNOWLEDGE_HUB_UNIFICADO_UM_HUB_MUITOS_BRACOS | cf46dbd9c | ARQUITETURA | KNOWLEDGE_HUB | PROVADO | KNOWLEDGE_HUB_SOURCE_IMPLEMENTATION_PENDING=false |
| 3 | RANDOLF_CONTINUIDADE_NAO_SEGUNDO_CEREBRO_NAO_SEGUNDO_HUB | aea5a6707 | IDENTIDADE | RANDOLF | PROVADO | RANDOLF_SOURCE_IMPLEMENTATION_PENDING=false |
| 4 | PERFIS_SOL_COMITE_OFICIALIZADOS_CANONICAL | 1ef351a5f | CONSCIÊNCIA | SOL_GRAMATICA_ENSINO | PROVADO | SOL_GRAMMAR_SOURCE_IMPLEMENTATION_PENDING=false |
| 5 | MICRO_COMMIT_MICRO_DEPLOY_CAUSAIS_OFICIAIS | 6229b5c3c | DEPLOY | FLUXO_DEPLOY | PROVADO | DEPLOY_POLICY_SOURCE_IMPLEMENTATION_PENDING=false |

---

## DETALHAMENTO DE CADA PEPITA

### 1. BOOT UNIFICADO — `ad71bdcde`

**ALVO EXATO**: `CENTRALDARK_AI_BOOT.yaml`  
**PAPEL DA FONTE**: bootstrap canônico da Casa  
**PROVA**: diff adiciona `canonical_contracts`, `unified_entry_pipeline`, `caracol_reverse`, `role_boundaries`, `knowledge_hub`, `deploy_readiness` ao boot  
**HEAD/STATE_ID**: `ad71bdcdec9370cb44b3bab59cdbce1520a4220f`  
**EFEITO**: Uma entrada → um fluxo → RANDOLF continua → ENEIAS estratégia → SOL coordena → MULTIBÚSSOLA → META LUPA → ONE WRITER → HERMES executa → CONTRAPROVA → REALITY JUDGE → FIXED POINT  
**ANTI-PENDÊNCIA**: `BOOT_UNIFIED_PIPELINE_SOURCE_ON_MAIN=PROVADO`

---

### 2. KNOWLEDGE HUB ÚNICO — `cf46dbd9c`

**ALVO EXATO**: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/KNOWLEDGE-HUB.yml` (217 linhas, novo arquivo)  
**PAPEL DA FONTE**: contrato canônico do Hub de conhecimento  
**PROVA**: arquivo inteiro criado com `one_hub_only: true`, `canonical_owners`, `unified_flow`, `caracol_reverse`, `entry_surfaces`, `firecrawl_policy`, `knowledge_event_envelope`, `self_correction`, `promotion`, `obsidian_semantics`, `proof_boundaries`  
**HEAD/STATE_ID**: `cf46dbd9cf7dd126ff1e89be17c3ade934cb17f3`  
**EFEITO**: Um Hub, múltiplas superfícies de entrada (chat, GitHub, Obsidian, webhooks, Firecrawl, runtime), um Writer por escopo, graph é projeção não autoridade  
**ANTI-PENDÊNCIA**: `KNOWLEDGE_HUB_CONTRACT_SOURCE_ON_MAIN=PROVADO`

---

### 3. RANDOLF OFICIALIZADO — `aea5a6707`

**ALVO EXATO**: `docs/CONSCIENCIA/RANDOLF-CONTINUIDADE.md` (190 linhas, novo arquivo)  
**PAPEL DA FONTE**: identidade e continuidade auditável  
**PROVA**: arquivo inteiro criado com `RANDOLF_IS_SECOND_BRAIN=false`, `RANDOLF_IS_SECOND_HUB=false`, `RANDOLF_IS_ORCHESTRATOR=false`, `RANDOLF_IS_WRITER=false`, `RANDOLF_IS_JUDGE=false`, estados permitidos, fluxo de continuidade entre abas/modelos/agentes, Hub único, auto-correção determinística, promoção controlada  
**HEAD/STATE_ID**: `aea5a6707ae1449d55639de2efdee856c13a9b73`  
**EFEITO**: RANDOLF = continuidade + persistência auditável + reencontro de contexto. Não cria segundo cérebro, segundo Hub, segundo orquestrador.  
**ANTI-PENDÊNCIA**: `RANDOLF_CONTINUITY_SOURCE_ON_MAIN=PROVADO`

---

### 4. PERFIS SOL + COMITÊ — `1ef351a5f`

**ALVO EXATO**: `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOL-GRAMATICA-DE-ENSINO.yml` (status: CANONICAL_CANDIDATE → CANONICAL)  
**PAPEL DA FONTE**: gramática de ensino e resposta da SOL + Comitê da Casa  
**PROVA**: perfis `AUTO_CASA`, `RESENHA_SEMPRE`, `BIBLICO_BAIANES`, `TECNICO`, `ESCOLA`, `COMITE`; invariantes `SAME_FACT_ALL_PROFILES`, `UNKNOWN_STAYS_UNKNOWN`, `PROFILE_CHANGES_TONE_NOT_TRUTH`, `PROFILE_NEVER_OVERRIDES_REALITY_JUDGE`, `COMMITTEE_IS_PROJECTION_NOT_SECOND_AUTHORITY`; selos semânticos do Comitê (👑 🧿 🧭 ⊛ 🪡 ☿ ⚖ 🐚 🧾 🚀); leis do Comitê (`INTENT_AUTHORITY_NE_WRITER`, `WRITER_NE_EXECUTOR`, `EXECUTOR_NE_JUDGE`, `HUD_NE_AUTHORITY`, `COMMENT_NE_EXECUTION`)  
**HEAD/STATE_ID**: `1ef351a5fe13f494c8c1ac43bced82e70f0e9d1f`  
**EFEITO**: Perfil muda tom, não verdade. Comitê projeta papéis, não cria segunda autoridade. Selos representam intenção, não decoração.  
**ANTI-PENDÊNCIA**: `SOL_GRAMMAR_PROFILES_COMMITTEE_SOURCE_ON_MAIN=PROVADO`

---

### 5. MICRO-COMMITS + MICRO-DEPLOYS CAUSAIS — `6229b5c3c`

**ALVO EXATO**: `docs/CONSCIENCIA/03-FLUXO-DEPLOY.md` (seção nova "Micro-commits + micro-deploys — padrão oficial da Casa")  
**PAPEL DA FONTE**: política de deploy da Casa  
**PROVA**: `MICRO_COMMIT_POLICY=CANONICAL`, `MICRO_DEPLOY_POLICY=CANONICAL`, `ONE_INTENT_PER_MICRO_COMMIT=true`, `DEPLOY_SCOPE_MUST_MATCH_CAUSAL_SCOPE=true`, `FULL_DEPLOY_BY_DEFAULT=false`; fluxo oficial com 11 passos; leis de não-confusão (`MICRO_COMMIT != MICRO_DEPLOY`, `DEPLOYED_COMPONENT != WHOLE_SYSTEM_DEPLOYED`, `WORKFLOW_GREEN != RUNTIME_PROOF`, `UNKNOWN != PASS`); receipt obrigatório com 13 campos  
**HEAD/STATE_ID**: `6229b5c3c32df57237c2558912a4a0b9e98c9024`  
**EFEITO**: Deltas pequenos e causais; micro-deploy promove só componente/artefato compatível; nenhum autoriza dizer que organismo inteiro está pronto  
**ANTI-PENDÊNCIA**: `DEPLOY_POLICY_SOURCE_ON_MAIN=PROVADO`

---

## REGRA EXPLÍCITA ADICIONADA AO PROTOCOLO

```text
SOURCE_CLAIM_FROM_HISTORICAL_COMMIT
+ PROVA_REF_NO_DIFF
+ HEAD_STATE_ID_REGISTRADO
+ ANTI_PENDENCIA_APLICADA
→ CRISTALIZADO
→ NÃO_REABRE_SEM_REOPEN_CAUSE_REF
```

---

## PLACAR RODADA 2

| Métrica | Valor |
|---------|-------|
| CLAIMS_RECUPERADOS | 5 |
| ARQUIVOS_CRISTALIZADOS | 5 |
| ANTI_PENDENCIAS_ADICIONADAS | 5 |
| FALSE_GREENS_CRIADOS | 0 |
| COMMIT_MAIN | próximo |

---

## PRÓXIMO CURSOR

```
VERTEX_INVERSO_LOOP_CONTINUA
→ VARRER_MAIS_PARA_TRÁS (63b891a40 → 452419072 → 1705e2d11 → 6229b5c3c → b9587d578 → 1ef351a5f → a9382b439 → 31363d481 → ...)
→ BUSCAR COMMITS COM PROVA_REF REAL
→ CRISTALIZAR
→ COMMITAR NA MAIN
→ REPETIR ATÉ EXAUSTÃO
```

---

**Oxente, a pedra por pedra continua. Cada commit que tem prova vira cristal. O que não tem prova fica amarelo ou preto. A Casa não esquece mais.** 💎🧭🔒
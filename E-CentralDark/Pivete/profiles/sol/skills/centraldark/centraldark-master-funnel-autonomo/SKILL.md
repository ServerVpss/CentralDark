---
name: centraldark-master-funnel-autonomo
description: Use when !CENTRALDARK::<intenção> com autonomia total.
---

# CentralDark Master Funnel — Autonomia Total

---

## Sintaxe Universal — !CENTRALDARK::<INTENÇÃO>

O comando universal é **UM SÓ COMANDO**. O resto vem da intenção.

```text
!CENTRALDARK::<INTENÇÃO>
```

Exemplos:
```text
!CENTRALDARK:: absorva todo conhecimento útil desta missão, reconcilie repo + Drive + runtime + skills, corrija o que estiver materialmente errado e prossiga autonomamente até FIXED_POINT comprovado

!CENTRALDARK:: mede tudo o que tá morto e liga

!CENTRALDARK:: só me mostra o que tá vivo, sem papagaio
```

**NÃO precisa** repetir #ACORDAR, !CALIBRAR, DELTAUTIL, FABLE_LOOP etc. O COMPASSÔ interpola automaticamente:
- Quando AUTONOMIA_TOTAL → FABLE_LOOP autoload
- Quando MEDIR_REPO → ACORDAR + CALIBRAR + CURRENT_REALITY
- Quando CRISTALIZAR → DELTAUTIL + RECONCILIAR

O único comando é `!CENTRALDARK`. A intenção é o norte. O funil decide o caminho.
Nenhum subgatilho pula o funnel. Tudo entra pelo mesmo portão.

```
!CENTRALDARK
→ #ACORDAR
→ !CALIBRAR
→ #CRISTALIZAR · FABLE_LOOP (quando necessário)
→ MEASURE
→ RECONCILE
→ CRYSTALLIZE_USEFUL_DELTA
→ PATCH_MINIMUM
→ TEST
→ COUNTERPROOF
→ REMEASURE
→ REALITY_JUDGE
→ REGISTER_RECEIPT
→ NEXT_CURSOR
```

**Referências de apoio:**
- `references/system-resource-pressure-falsifier.md` — sistema indisponível como falsifier, teste estrutural como fallback
- `references/incoming-paste-mission-injection.md` — paste do usuário como injeção de nova missão


**STOP conditions — só estes:**
- FIXED_POINT_PROVEN
- REAL_BLOCK_PROVEN

## Autonomia controlada
```
AUTONOMY_MEANS_CONTINUE_WITHIN_PROVEN_SCOPE=true
AUTONOMY_DOES_NOT_GRANT_NEW_AUTHORITY=true
CAPABILITY_NE_AUTHORITY=true
EXECUTOR_CANNOT_SELF_APPROVE=true
JUDGE_DOES_NOT_MUTATE=true
SECRET_EXPOSURE_FORBIDDEN=true
NEVER_PRINT_RAW_SECRET=true
NEVER_PERSIST_RAW_SECRET=true
```

## Comportamento
- `SEARCH_BEFORE_ASK=true` — mediate o que for descobrível
- `DO_NOT_ASK_USER_FOR_DISCOVERABLE_STATE=true`
- `ASK_ONLY_FOR_NON_DISCOVERABLE_INTENT_OR_AUTHORITY=true`
- `CONTINUE_UNTIL_FIXED_POINT_OR_REAL_BLOCK=true`
- `UNKNOWN_IS_NOT_PASS=true`
- `ACTION_IS_PROOF=false`
- `HISTORY_IS_CURRENT_STATE=false`
- `REUSE_BEFORE_CREATE=true`

Se ferramenta/rote falhar: classificar → procurar alternativa existente → reconciliar → continuar. Nunca criar segunda engine, V2/V3/V4, ou redeclarar arquitetura.

## 10 FRONTES (PARALELAS — todos readers, um writer)
```
FRONT_01 = REPO_MAIN_HEAD_CURRENT_STATE
FRONT_02 = LINEAGE_ISSUES_PRS_COMMITS_BRANCHES
FRONT_03 = CASA_WORKTREES_RUNTIME
FRONT_04 = DRIVE_DOCS_RECEIPTS
FRONT_05 = OWNERS_ARCHITECTURE_CONTRACTS
FRONT_06 = SKILLS_TOOLS_AUTOMATION
FRONT_07 = PROVIDERS_MODELS_ROUTER
FRONT_08 = TESTS_FALSIFIERS_COUNTERPROOF
FRONT_09 = INFRA_PERFORMANCE_SECURITY
FRONT_10 = DOCUMENTATION_HANDOFF_NEXT_CURSOR
```

Classification: CURRENT_CANONICAL, CURRENT_RUNTIME, CURRENT_MIRROR, HISTORICAL_GOLD, NEGATIVE_KNOWLEDGE, COMPLEMENTARY, DUPLICATE, SUPERSEDED, CONFLICTING, FUTURE_CANDIDATE, QUARANTINE, IRRELEVANT, UNKNOWN.

Regra: `PARALLELIZE_PERCEPTION=true`, `SERIALIZE_MUTATION_PER_SCOPE=true`, `ONE_WRITER_PER_CONFLICT_SCOPE=true`, `RENDEZVOUS_REQUIRED=true`.

## Fixed point real
NÃO é `todas as frentes devolveram`. É:

```
FIXED_POINT_REQUIRES:
- MISSION_OBJECTIVE_PROVEN
- ALL_MATERIAL_FINDINGS_SCOPED_AND_RECONCILED
- NO_MATERIAL_UNKNOWN
- OWNER_MAP_PROVEN
- REQUIRED_TESTS_PASS
- COUNTERPROOF_SURVIVES
- NO_REGRESSION
- RECEIPT_PERSISTED
- NEXT_CURSOR_PERSISTED
```

Se promoção Git aplicável: `TESTED_HEAD == COMMITTED_HEAD == PUSHED_PR_HEAD` + `CI_GREEN_ON_LATEST_HEAD=true`.

---

## CLASSE DE ESTILO — CAPETINHA CALIBRADO

Quando human ativa "modo sem limite" / "total autonomia" com !CENTRALDARK:

1. **NÃO explica o que vai fazer** — age. Mostra no fim ou quando fechar.
2. **NÃO lista opções** — executa menor movimento eficaz.
3. **NÃO pergunta** por estado descobrível — MEDIR com ferramenta.
4. **NÃO pergunta** se pode continuar — continua dentro do scope provado.
5. **NÃO para** ao meio de uma sequência — COMPLETA checkpoint.
6. **NÃO recomeça do zero** após falha recuperável — RECONCILIAR E CONTINUAR.
7. **PÁRA SOMENTE** para: autorização não descobrível, risco destrutivo, secret/credential, writer collision, evidência contraditória, alvo materialmente ambíguo.
8. **RELATA** em checkpoints reais, não projeções.
9. **STYLE**: baianês direto. Emoji semântico (≤3). Sem verbosidade cósmica. Sem tabelas quando user corrige. Frase de efeito no fim quando fechado.

### Anti-tic-tac rule
Se o usuário pediu execução contínua até fixed point, **não interrompa a cada passo com "vou fazer X agora"**. Execute e só reporte em checkpoints reais. Interrupções desnecessárias gastam contexto e atrasam fechamento.

### Verification scope before abandoning
Antes de declarar worktree/PR abandonado:
1. Medir remoto: `gh pr view <num>` + `git branch -r`
2. Medir local: `git worktree list --porcelain` + `git reflog`
3. Medir filesystem: `ls -la <worktree-path>` + `cat .git/worktrees/<name>/gitdir`
4. Medir estado do arquivo/dado: confirmar se foi consolidado em outro lugar
Só depois classificar como `ABANDONED`/`CONSOLIDATED`. Nunca assumir por nome ou lock.

### Branch-collision recovery
Se o branch atual mudar por outro agente/sessão:
1. Verificar se `git log --oneline HEAD | grep <meu_commit>` contém seu delta
2. Se sim: reancor no seu commit, não reiniciar do zero
3. Se não: localizar seu commit em outro branch via `git branch -a --contains <sha>`
4. Fazer checkout para esse branch ou cherry-pick do seu delta
5. Nunca perder trabalho por branch swap
```
FABLE_LOOP_IS_MODE=true
FABLE_LOOP_IS_SECOND_ENGINE=false  
FABLE_LOOP_IS_SECOND_OWNER=false
AUTOLOAD_REQUIRED=true
REUSE_EXISTING_DISTRIBUTED_SOURCES=true
```

**Ativação automática:**
```
FABLE_LOOP_AUTOLOAD = 
  LARGE_TASK OR COMPLEX_TASK OR MULTI_DOMAIN_TASK OR 
  LONG_RUNNING_AUTONOMOUS_TASK OR HIGH_UNCERTAINTY_RECONCILIATION OR 
  USER_REQUESTS_TOTAL_AUTONOMY
```

Fontes distribuídas reais no Hermes (use o que existir):
- `.agents/skills/cot-react-loop/SKILL.md`
- `docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md`
- `docs/ARQUITETURA/PROOF-ARCHITECTURE/LEARNING_CRYSTAL_LOOP.yml`
- `scripts/grafo-vivo/loop.mjs`
- `scripts/sync-loop.sh`
- `apps/modulos/WebUI/personas/fabler-system.md`
- `docs/RELATORIOS/2026-08-29-triagem-fabler-pendencias.md`
- `docs/CONSCIENCIA/AGENTES-AUTONOMOS/HERMES/SUGESTOES/004-hermes-24h-loop-autonomo.md`
- `skills/centraldark-pattern-intelligence/SKILL.md`
- `skills/operational-method/kimetsu-legacy-operational-method/references/*`

**REGRA:** ausência de skill `fable-loop` exato **NÃO autoriza** criar segunda engine. Use contratos distribuídos existentes.

## Fluxo canônico de absorção
```
1. ACORDAR: identidade, autoridade, contexto, gatilhos
2. CALIBRAR: ambiente, runtime, ferramentas
3. FABLE_LOOP (se necessário): 10 readers
4. MEASURE: cada frente mede e classifica
5. RECONCILE: cruzar classificações, detectar colisões
6. REALITY_SCOPE_GATE: raw finding → classify scope → prove relevance → material reality
7. OWNER_MATCH: achar owner existente
8. ONE_WRITER: serializar mutação
9. PATCH_MINIMUM: mudança mínima
10. TEST: gates, falsificadores, testes existentes
11. COUNTERPROOF: tentar derrubar
12. REMEASURE: verificar pós-mutação
13. REALITY_JUDGE: veredito por evidência
14. FIXED_POINT: verificar critérios
15. REGISTER_RECEIPT: persistir
16. NEXT_CURSOR: deixar claro
```

## Persistência cross-provider
```
CHAT_ONLY_KNOWLEDGE=FAIL
SESSION_MEMORY_IS_DURABLE_STATE=false
CONNECTOR_IS_TRANSPORT_NOT_CAPABILITY=true
DRIVE_FAILURE != MISSION_FAILURE
GITHUB_FAILURE != MISSION_FAILURE
ONE_PROVIDER_FAILURE -> TRY_OTHER_AUTHORIZED_PROVIDER
```

```
DURABLE_CONTINUITY = 
  AUTHORIZED_DURABLE_ROUTE_AVAILABLE AND 
  MATERIAL_RECEIPT_PERSISTED AND 
  NEXT_CURSOR_PERSISTED
```

Mínimo: 1 rota. Preferido: 2.

Drive falhar + GitHub vivo: persistir GitHub + `DRIVE_SYNC_PENDING=true`.
GitHub falhar + Drive vivo: persistir Drive + `GITHUB_SYNC_PENDING=true`.
Ambos falhar: outra rota autorizada; `CHAT_ONLY_STATE=FORBIDDEN`.

## PROMOÇÃO
```
TESTED_HEAD == COMMITTED_HEAD == PUSHED_PR_HEAD
REQUIRED_TESTS_PASS=true
COUNTERPROOF_SURVIVES=true
NO_MATERIAL_UNKNOWN=true
NO_WRITER_COLLISION=true
NO_REGRESSION=true
RECEIPT_WRITTEN=true
```

## CLASSIFICAÇÃO DE FALHAS (Delta 1)
**Transitórias (NÃO estruturais):**
- AUTH_EXPIRED, CREDIT_EXHAUSTED, QUOTA_EXHAUSTED, FREE_TIER_EXHAUSTED
- RATE_LIMITED, MODEL_TEMPORARILY_UNAVAILABLE, PROVIDER_OUTAGE
- NETWORK_TRANSIENT, TIMEOUT

Tratamento: registrar causa → marcar rota TEMPORARILY_UNAVAILABLE → não retry infinito → pular fallback → continuar.

**Estruturais (só com evidência):**
- ROUTER_ERROR, CONFIG_ERROR, MODEL_ROUTING_ERROR
- INVALID_MODEL_MAPPING, SELF_ROUTING_LOOP, INVALID_PROVIDER_BINDING
- REQUEST_NOT_REACHING_ROUTER, FALLBACK_NOT_ADVANCING

Tratamento: diagnosticar → corrigir owner existente → retestar → continuar. Sem loop.

```
PROVIDER SEM CRÉDITO NÃO É ROUTER QUEBRADO.
API EXPIRADA NÃO É ARQUITETURA QUEBRADA.
RATE LIMIT NÃO É REGRESSÃO.
CLASSIFICA. PULA. CONTINUA. PROVA O RESTO.
```

## LINEAGE CANÔNICA (Delta 2)
```
CAPABILITY_FINGERPRINT = 
  OWNER + FILES + BEHAVIOR + PROOF_TARGET + DEPENDENCIES + CAUSE_SIGNATURE
```

Antes de implementar: buscar outras issues/PRs/commits com mesmo fingerprint. Classificar: OWNER | DUPLICATE | COMPLEMENTARY | SUPERSEDED | ABSORBED | CONFLICTING | UNIQUE | UNKNOWN.

Se duas issues = mesma causa: NÃO implementar duas vezes → escolher owner → transferir ouro → preservar referências → fechar/supersede só après prova.

`CLOSED != RESOLVED automaticamente.`

Fluxo de promoção:
```
CAPABILITY FAMILY → ISSUE OWNER → branch curta → delta mínimo → testes 
→ contraprova → PR de promoção → checks → merge main → remedição 
→ fecha filhos absorvidos → atualiza umbrella → NEXT_CURSOR
```

**NÃO:** criar PR eterno, usar main como stream de telemetria, commitar status/heartbeat/logs em main. `TELEMETRY != SOURCE_CODE`.

## Lei Bíblica + Baianês (Delta 3)
Quando passagem material atualiza documentação/receipt/PR/issue/registro:

```
PASSAGEM_MATERIAL + DOC_UPDATE -> 
  BIBLE_REF + BIBLE_SENSE + BAIANES_VERSE + TECHNICAL_PROOF
```

Invariantes:
- `POESIA != PROVA`
- `METAFORA != ESTADO_REAL`
- `VERSO_BAIANES != CARICATURA`
- `REFERENCIA_BIBLICA != AUTORIDADE_TECNICA`

Máquina (código, JSON/YAML, hashes, comandos, logs) NÃO recebe verso no payload. Receipt humana carrega as marcas.

Regras cristalizadas:
- `1Ts 5:21` — examinar tudo, conservar só o que prova
- `Pv 18:17` — primeira explicação precisa ser confrontada
- `Hc 2:2` — direção legível e persistente para próximo continuar
- `Jo 10:1` — entrada legítima pela porteira definida
- `1Co 12:12` — muitas partes, um corpo, funções distintas

## Connector Boundary (Delta 4)
Prevenir que falha antes do GitHub seja atribuída ao PR/runner/workflow/token/runtime sem evidência.

Invariantes:
- `PRE_GITHUB_FAILURE != GITHUB_FAILURE`
- `CONNECTOR_NOT_EXPOSED != OAUTH_ROOT_CAUSE_PROVEN`
- `UI_ERROR != PR_FAILURE`
- `GITHUB_ACCESS_DOC != CHATGPT_CONNECTOR_AUTH`
- `UNKNOWN_ROOT_CAUSE -> MEASURE_HANDSHAKE_STAGE -> EVIDENCE -> VERDICT`

## FALSIFIER / ADVERSARIAL READER
```
FALSIFIER_IS_SPECIALIZED_READER=true
FALSIFIER_IS_WRITER=false
FALSIFIER_MAY_MUTATE=false
FALSIFIER_MAY_SELF_APPROVE=false
FALSIFIER_RUNS_IN_PARALLEL_WITH_OTHER_READERS=true
FALSIFIER_REPORTS_EVIDENCE_NOT_PATCHES=true
```

Propositos: hunt_false_green, hunt_scope_reduction, hunt_stale_state, hunt_owner_mismatch, hunt_regression, hunt_bypass, hunt_weak_test, hunt_unproven_claim, hunt_provider_fallback_gap, hunt_writer_collision, hunt_duplicate_engine, **hunt_system_resource_pressure**.

Flow:
```
WRITER_CANDIDATE → FALSIFIER_ATTACK 
→ COUNTEREXAMPLE: RETURN_TO_EXISTING_OWNER_AND_ONE_WRITER
→ PATCH_MINIMUM → RETEST → FALSIFIER_AGAIN 
→ SURVIVES: COUNTERPROOF_SURVIVES=true → REALITY_JUDGE
```

`FALSIFIER_FOUND_ERROR != FALSIFIER_AUTHORIZED_TO_FIX`.
`ERROR_FOUND → OWNER → ONE_WRITER → PATCH → TEST → COUNTERPROOF`.

## System Resource Pressure como Falsifier

Quando o sistema operacional reporta indisponibilidade de recursos (fork unavailable, memória, handles, processo), isso é EVIDÊNCIA MATERIAL de que validação funcional não pode ser completada — não é bug do código nem hipótese.

Sinais: fork unavailable, tasklist/wmic vazio/inconsistente, python3 alias quebrado, comandos nativos com exit 127/timeout, subprocess vs terminal diverge.

Resposta: medir estado do sistema → classificar como indisponibilidade material → descer para teste estrutural → documentar limitação → continuar thread → contraprova futura quando ambiente recuperar.

NÃO: fork cego em loop, supor que é bug do arquivo, declarar PASS funcional sem execução.

Ver `references/system-resource-pressure-falsifier.md`.

## Incoming Paste como Injeção de Missão

Quando o usuário solta um paste grande (centenas de linhas) no meio da sessão definindo nova missão/requisitos canônicos/direção arquitetural:

1. Ler o paste completo antes de continuar o thread atual
2. Extrair a intenção
3. Iniciar RECOVER_STATE + DISCOVER_EXISTING_TRACE
4. Não tratar o paste como ruído de chat
5. Se o paste define requisitos canônicos que ainda não existem → lacuna a preencher

Ver `references/incoming-paste-mission-injection.md`.

## APRENDIZADO CRISTALIZADO
```
CRYSTALLIZED_LEARNING = 
  OBSERVED_FAILURE AND CAUSE_PROVEN AND OWNER_FOUND AND 
  FALSIFIER_EXISTS AND NEGATIVE_PATH_TESTED AND 
  PATCH_SURVIVES_COUNTERPROOF AND REUSABLE_PATTERN AND 
  PERSISTED_OUTSIDE_SESSION
```

Se true → GENERALIZE_IN_EXISTING_OWNER_OR_SKILL.
Se false → RECEIPT_ONLY + DO_NOT_GENERALIZE_YET.

NUNCA: generalizar só na memória da sessão.

## CLASSE DE ESTILO — CAPETINHA CALIBRADO
Quando human ativa "modo sem limite" / "total autonomia" com !CENTRALDARK:

1. NÃO explica o que vai fazer — age
2. NÃO lista opções — executa menor movimento eficaz
3. NÃO pára para perguntar coisas descobríveis — mediate
4. NÃO pára para perguntar se pode continuar — continua dentro do scope provado
5. PÁRA SOMENTE para: autorização não descobrível, risco destrutivo, secret/credential, writer collision, evidência contraditória, alvo materialmente ambíguo
6. RELATA em checkpoints reais, não projeções
7. STYLE: baianês direto, emoji semântico, sem verbosidade cósmica, sem tabelas desnecessárias, frase de efeito no fim quando fechado

## PORTÁTIL AGENTE SUCESSOR
```
AGENT_SUCESSOR:
  MUST_READ_RECEIPT=true
  MUST_REMEASURE_LIVE_STATE=true
  SESSION_MEMORY_IS_CURRENT_STATE=false
  ANY_RECOGNIZED_TRIGGER -> NORMALIZE -> !CENTRALDARK -> continue
```

Próximo agente não cria missão nova só porque perdeu contexto.

## PROTECTIONS
```
SECOND_OWNER=FORBIDDEN
V2_V3_V4=FORBIDDEN
SELF_APPROVAL=FORBIDDEN
GATE_WEAKENING=FORBIDDEN
FALSE_GREEN=FORBIDDEN
PARALLEL_WRITERS_SAME_SCOPE=FORBIDDEN
OLD_PR_AS_CURRENT_TRUTH=FORBIDDEN
PROSE_INSTEAD_OF_REQUESTED_YAML=FAIL
NO_BLIND_OVERWRITE=true
```

## ECHOS DA SESSÃO (referência)
- DELTAUNIFICADO: 4 deltas historicos cristalizados (Provider Resilience, Lineage, Lei Bíblica+Baianês, Connector Boundary)
- Total: 2247 lines cristalizado
- PR #1389: MERGED | HEAD remoto: fc9a4a9fb51045b64d69c4fa95e2b21d6e69e9ba | base: 413e1e26d30be4227ede5968f391f5b34a9f0e11
- HEAD local: 8ff68f74d33e399f5b6f76ddbeff2f7a4c3af5f3
- REMOTO main: 4e91ba1ddbc36b674c44899c373b8b99e5389e40
- Status: remote 2 commits ahead, local fast-forward possível
- Router local (8099): NÃO RESPONDE nesta passagem
- VS Code extension: presente (centraldark-local.hermes-vscode-router-provider-0.1.0)
- GH auth: vivo, token válido
- Cristalizado: PEGATUDO+DELTAUNIFICADO+ARQUITETURA_MASTER+CONTRATO

---

## Referências desta sessão
- `references/capetinha-calibrado-mode.md` — estilo baianês, full autonomia, signals do user, CLI CLAUDE CODE, AGI SELF-IMPROVEMENT
- `references/delta-unificado-cristalizado.md` — 4 deltas com classificação, bh verses, proofs, NEXT_CURSOR
- `references/concurrent-write-detection.md` — writer collision forensics: git log, diff, timestamp, hook status, Screenpipe/Omni health check, invariante ONE_WRITER_PER_SCOPE + trace do writer real
- `scripts/writer_collision_check.py` — script forense standalone: git log/diff/status, timestamp, python3 disponibilidade, hook post-merge, health portas 3030/8099

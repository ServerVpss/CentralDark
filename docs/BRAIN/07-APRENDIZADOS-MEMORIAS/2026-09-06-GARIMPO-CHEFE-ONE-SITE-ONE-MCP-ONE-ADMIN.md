# GARIMPO-CHEFE → ONE SITE / ONE MCP / ONE ADMIN — reconciliação 2026-09-06

**Natureza:** aprendizado + plano de reconciliação no BRAIN existente.  
**Autoridade de intenção:** SEGREDO/CHEFE.  
**Owner:** `docs/BRAIN/07-APRENDIZADOS-MEMORIAS/`.  
**Baseline medido:** `main@f60ad71810fb9009bcc1a576d77305d61f9d1add`.  
**Escopo desta entrega:** desenho, inventário, reconciliação e guardas. **Sem deploy, restart, DNS, Caddy/Nginx, banco, secret ou cutover.**

```text
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
CURRENT_GT_HISTORY=true
UNKNOWN_IS_NOT_PASS=true
DOCUMENTED_IS_NOT_EXECUTED=true
ACTION_IS_NOT_PROOF=true
ZERO_REGRESSION_REQUIRED=true
EXTEND_DONT_REPLACE=true
NO_V2_V3_V4_PARALLEL_PRODUCT=true
RAW_GARIMPO_NOT_DIRECT_TO_GIT=true
```

## 1. Intenção reconciliada

```text
UMA_VONTADE_DO_CHEFE
→ UMA_CASA
→ UMA_PORTA_HUMANA
→ UM_ADMIN
→ UM_MCP_LOGICO
→ UMA_ROTA_API_CANONICA
→ MUITAS_CAPACIDADES_INVISIVEIS
→ HERMES/EXECUTORES SUBSTITUIVEIS
→ REALIDADE + RECEIPT
```

O destino não é colocar ferramentas inteiras, IDEs ou motores de terceiros "por trás" da CentralDark. O destino é **extrair capacidade útil**, adaptar ao owner existente e torná-la uma capacidade nativa do organismo único.

```text
THIRD_PARTY_SYSTEM
→ IDENTIFY_CAPABILITY
→ IDENTIFY_EXISTING_CENTRALDARK_OWNER
→ EXTRACT_CONTRACT/PATTERN
→ REIMPLEMENT_OR_ADAPT_MINIMAL_CAPABILITY
→ TEST_AGAINST_REAL_CONSUMER
→ COUNTERPROOF
→ ABSORB

THIRD_PARTY_RUNTIME_AS_HIDDEN_SECOND_BRAIN = FORBIDDEN
```

## 2. O que o GARIMPO significa

A fonte local indicada pelo CHEFE é:

```text
E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE
```

Ela contém HTML/TXT/logs/imagens/pacotes e outras matérias históricas. O GARIMPO é **fonte de matéria**, não autoridade do estado atual.

Fluxo já compatível com o método canônico:

```text
RAW_PACKAGE_OR_FILE
→ IDENTIFY
→ HASH_WHEN_BYTES_AVAILABLE
→ SECRET_SCREEN
→ TEXT/SEMANTIC_EXTRACTION
→ DEDUPE
→ PROVENANCE
→ CURRENT_OWNER_MATCH
→ DELTA_UTIL
→ COUNTERPROOF
→ PERSIST_ONLY_NON_SENSITIVE_DELTA
```

Regras:

```text
RAW_HTML != CURRENT_STATE
RAW_LOG != CURRENT_STATE
OLD_CHAT != CURRENT_STATE
SCREENSHOT != RUNTIME_PROOF
SAME_CONTENT_MULTIPLE_SOURCES = ONE_DELTA + MANY_PROVENANCES
SIMILAR_FILENAME != DUPLICATE_PROOF
SECRET_LIKE_CONTENT = QUARANTINE_NOT_MEMORY
```

Nesta reconciliação, o lote textual priorizado confirmou repetidamente: uma Casa, uma porta humana, muitas capacidades invisíveis; Hermes não vira segundo cérebro; extensão segura supera substituição; zero regressão; preservar legado e banco; não criar V2/V3/V4; e absorver o ouro de motores/ferramentas em owners CentralDark.

## 3. Correção histórica importante

Uma hipótese histórica tratava o PR `#1302` como veículo para remover `centraldark_omni_router.py`. A medição viva de 2026-09-06 refutou isso: **PR #1302 é um Dependabot de `@headlessui/react`, fechado sem merge**.

```text
OLD_CLAIM_PR1302_OMNI_REMOVAL = REFUTED
DO_NOT_REUSE_THIS_CLAIM=true
```

Nenhuma decisão arquitetural futura deve citar #1302 como prova de absorção do Omni.

## 4. Estado CURRENT que governa este plano

### GitHub

```text
MAIN=f60ad71810fb9009bcc1a576d77305d61f9d1add
OPEN_PRS_AT_MEASUREMENT=0
ISSUE_133=OPEN   # HUB + API Gateway
ISSUE_134=OPEN   # inventário de subdomínios
ISSUE_604=OPEN   # unificação operacional total
ISSUE_1380=OPEN  # Fixed Point Fabric
PR_1439=MERGED   # sweep persistente + contrato HUB
```

### Contratos já existentes que devem ser reutilizados

- `CENTRALDARK_AI_BOOT.yaml`: `fronts: ADAPTIVE_1_TO_10`, loop autônomo até fixed point/fronteira humana, reuse proof, one writer.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml`: `!CENTRALDARK` expande ciclo completo e já inclui `DELTA_UTIL`.
- `SECOND-BRAIN.yml`: BRAIN_VAULT + GraphRAG + skills + sincronização Casa/VPS/GitHub.
- `.agents/skills/centraldark-operational-method/`: método único e receipt de GARIMPO/MCP.
- `apps/modulos/mcp/`: owner do MCP.
- `apps/modulos/hub/` + `apps/modulos/oauth-broker/`: superfície/controle de HUB e conectores.
- `api.centralldark.com`: direção canônica de gateway/rota de APIs descrita nos owners existentes.

## 5. Gap real do Omni Router

A `main` atual ainda referencia materialmente:

```text
apps/modulos/elite-gateway/scripts/centraldark_omni_router.py
scripts/boot_omni_router.py
scripts/launch_omni_router.py
scripts/launch_omni_router.sh
scripts/launch_omni_router_direct.py
```

E contratos atuais ainda apontam o Omni como transport/model router, inclusive `ENGINE_BINDING.yml`, `RUNTIME-PLUG-CONTRACT.yml`, `MASTER-CYCLE.yml` e `SECOND-BRAIN.yml`.

Portanto:

```text
OMNI_CAPABILITIES_ABSORBED = PARTIAL
OMNI_SEPARATE_IMPLEMENTATION_PRESENT = YES
OMNI_RUNTIME_CURRENTLY_RUNNING = UNKNOWN_UNTIL_LIVE_MEASUREMENT
```

**Não apagar nem substituir agora.** Primeiro mapear consumidores e capacidade por capacidade.

Capacidades a absorver/reconciliar:

```text
MODEL_ROUTING
PROVIDER_SELECTION
FALLBACK
HEALTH
OPENAI_COMPATIBLE_SURFACE
MODEL_TOUCH_RECEIPT
EVIDENCE_HOOKS
TRACE/MISSION CORRELATION
```

Destino lógico:

```text
CENTRALDARK CORE
├─ HUB ADMIN / CONNECTORS
├─ API GATEWAY
├─ MCP NORMAL + ADMIN SCOPES
├─ MODEL/CAPABILITY ROUTING
├─ FALLBACK
├─ EVIDENCE / RECEIPTS
├─ MEMORY / GRAPH / GARIMPO
└─ HERMES EXECUTION
```

`OMNI` pode sobreviver como genealogia/compatibilidade durante a transição, mas não deve criar autoridade ou cérebro paralelo.

## 6. ONE MCP

Direção canônica já registrada:

```text
ONE_MCP_SERVICE=true
NORMAL=/mcp
ADMIN=/admin/mcp
NORMAL_AND_ADMIN_ARE_SCOPES_OR_ENTRYPOINTS
NORMAL_ADMIN != TWO_BRAINS
```

Há material legado/documental que ainda descreve apps/processos normal/admin separados. Isso é **RECONCILIATION_REQUIRED**, não autorização para apagar processos. O runtime real precisa ser medido antes de qualquer convergência física.

## 7. ONE SITE / ONE ADMIN

A issue #133 já define:

```text
hub.centralldark.com = painel/admin/conectores
api.centralldark.com = gateway/rota única
mcp.centralldark.com = tools/MCP
```

A intenção mais nova do CHEFE comprime a experiência humana para **uma porta**. Isso não obriga desligar subdomínios imediatamente.

Transição segura:

```text
CENTRALDARK HUMAN FRONT DOOR
→ ADMIN/HUB MODULE
→ API/MCP/GRAPH/STATUS AS INTERNAL ROUTES OR COMPATIBILITY ALIASES
```

Até contraprova de consumidores:

```text
LEGACY_SUBDOMAIN = COMPATIBILITY_ALIAS_CANDIDATE
NO_BLIND_DNS_CUTOVER=true
NO_BLIND_CADDY_CHANGE=true
```

## 8. Dez frentes consecutivas

### FRENTE 1 — GARIMPO SEMÂNTICO
Inventariar todos HTML/TXT/logs do `GARIMPO-CHEFE`, hash quando bytes disponíveis, extrair intenção/delta, quarantine de segredo, dedupe e provenance.

### FRENTE 2 — PORTA HUMANA ÚNICA
Reutilizar CentralDark App/HUB/painel existentes. Definir qual superfície é o front door local e qual é o front door web sem criar segundo painel.

### FRENTE 3 — HUB ADMIN
Mapear tabs/rotas/conectores atuais, `oauth-broker`, Supabase/schema, contas e permissões. Resolver gaps somente no owner existente.

### FRENTE 4 — MCP ÚNICO
Medir processo/runtime atual, normal `/mcp`, admin `/admin/mcp`, tool catalog e auth. Convergir implementação somente após provar consumidores.

### FRENTE 5 — API ÚNICA
Inventariar rotas reais, aliases e owners. Consolidar gateway/policy/fallback sem big bang e sem quebrar APIs atuais.

### FRENTE 6 — ABSORÇÃO OMNI
Inventariar cada referência/consumidor. Classificar `KEEP_AS_COMPAT | MOVE_TO_OWNER | DERIVED | HISTORICAL | DELETE_AFTER_ABSORPTION`.

### FRENTE 7 — CAPACIDADES DE MODELOS/FERRAMENTAS
Modelos/CLIs/providers são braços substituíveis. Absorver contratos úteis, não identidade/autoridade externa. Testar fallback e provenance por provider.

### FRENTE 8 — PERCEPÇÃO LOCAL
Screenpipe/browser/terminal/files são sensores. Provar transporte `sensor → consumer → receipt`; sensor bloqueado não vira fixed point verde.

### FRENTE 9 — CONTINUIDADE / BRAIN / HANDOFF
Persistir intenção, owner, evidence, counterproof, last-good-state e next cursor. Reutilizar receipt causal, não repetir prova selada.

### FRENTE 10 — INFRA / CUTOVER / FIXED POINT
Só depois das 1–9: precheck, backup/rollback, consumer matrix, same-head tests, duas amostras estáveis quando temporal, counterproof e micro-cutover reversível.

## 9. Gate de infraestrutura antes de execução

```text
MEASURE
→ DIAGNOSE
→ CAUSE
→ OWNER
→ CONSUMER_MATRIX
→ MINIMAL_REMEDIATION
→ PRECHECK
→ ROLLBACK_PLAN
→ TEST_NON_PROD_OR_READ_ONLY
→ COUNTERPROOF
→ HUMAN_GATE_WHEN_RISK_MATERIAL
→ MICRO_CUTOVER
→ REMEASURE
```

### NO-GO imediato

Nenhum destes é autorizado por este documento sozinho:

```text
DB_MIGRATION
DNS_CUTOVER
CADDY/NGINX_MUTATION
PM2/SYSTEMD/DOCKER_RESTART
SECRET_ROTATION
FIREWALL_CHANGE
DELETE_LEGACY_RUNTIME
FULL_DEPLOY
```

## 10. Critério de promoção

```text
CURRENT_HEAD_MEASURED=true
RAW_GARIMPO_SECRET_SCREEN=PASS
OWNER_COLLISIONS=0
WRITER_COLLISIONS=0
DUPLICATE_RUNTIME_BRAINS=0
ONE_MCP_CONSUMERS_PROVED=true
FRONT_DOOR_COMPATIBILITY_PROVED=true
OMNI_CAPABILITIES_MAPPED=100%
OMNI_CONSUMERS_MAPPED=100%
API_ROUTE_MATRIX_COMPLETE=true
ROLLBACK_PROVED=true
SAME_HEAD_APPLICABLE_GATES=PASS
RUNTIME_COUNTERPROOF=PASS
```

Se qualquer denominador material estiver ausente:

```text
FIXED_POINT=NO
STATUS=UNKNOWN_OR_PENDING
```

## 11. Próximo cursor da Casa

```text
!CENTRALDARK
→ GARIMPO_CHEFE_FULL_TEXT_INVENTORY
→ CURRENT_RUNTIME_PORT_PROCESS_ROUTE_INVENTORY
→ ONE_SITE_OWNER_RESOLUTION
→ ONE_MCP_RUNTIME_DISCRIMINATING_TEST
→ OMNI_CONSUMER_CAPABILITY_MATRIX
→ API_HUB_MCP_ROUTE_MATRIX
→ ZERO_REGRESSION_PLAN
→ CONTRAPROVA
→ DELTA_MINIMO
→ FIXED_POINT_OR_NEXT_CURSOR
```

O ouro histórico entra como candidato. A realidade viva decide o que sobrevive.

## 12. Garimpo técnico adicional — Horn, continuidade e observabilidade

Quatro materiais adicionais foram reconciliados contra os owners atuais sem criar motor novo.

### Horn / ponto fixo

O material que descreve fatos, regras, propagação, modelo mínimo e contradições reforça uma capacidade que **já existe** na Casa através de `SPIRAL-TRAVERSAL.yml`, `spiral_traversal.py` e Fixed Point Fabric.

```text
HORN_INSPIRATION = REUSE_EXISTING_OWNER
CREATE_NEW_HORN_ENGINE = false
FORWARD_FIXED_POINT = KEEP
REVERSE_FIXED_POINT = KEEP
NEGATIVE_GOAL_REFUTATION = KEEP
FRAGMENT_DROP_ZERO = KEEP
DUPLICATE_TRAVERSAL_ZERO = KEEP
```

A referência externa é minério de fundamentação. Ela não substitui owner, boot, runtime truth, CARACOL, MetaLupa ou Fixed Point Fabric.

### JARVIS / FRIDAY

Os materiais de JARVIS/FRIDAY são aproveitados somente onde descrevem **continuidade, modularidade, isolamento de falha, percepção → decisão → ação → integridade e troca de braço sem perder estado**.

```text
MODEL_CHANGE != MEMORY_RESET
ENGINE_CHANGE != MISSION_RESET
ARM_FAILURE → PRESERVE_LAST_GOOD_STATE + NEXT_CURSOR
FRIDAY_AS_NEW_SOUL = false
FRIDAY_AS_NEW_CORE = false
FRIDAY_RUNTIME_CLAIMS_WITHOUT_RECEIPT = UNKNOWN
EXTERNAL_FICTION_OR_ANALOGY = CONCEPTUAL_MINERAL_ONLY
```

A Casa já possui o owner `JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`; portanto a melhoria deve ser absorvida nesse organismo e não fundar identidade concorrente.

### DevTools / rastro operacional

A inspeção de UI mostrou uma diferença que deve permanecer canônica:

```text
VISIBLE_AGENT_STATUS != PRIVATE_REASONING
EXECUTION_TRACE != CHAIN_OF_THOUGHT
CLASS_NAME != COMPUTED_BEHAVIOR
```

Um elemento chamado `loading-shimmer-tertiary` foi observado com `animation-name: none` e `background-image: none`; nome visual não prova animação efetiva.

O painel CentralDark deve preferir rastro operacional verificável:

```text
STATE
ACTION
TARGET
TOOL_OR_CAPABILITY
OBSERVED_RESULT
EVIDENCE_REF
STATUS
COUNTERPROOF
RECEIPT
NEXT_CURSOR
```

Nunca depender de exposição de raciocínio privado para auditabilidade. O que interessa é a cadeia observável de ação, evidência, teste e resultado.

## 13. Teste vivo do fallback de revisão — PR #1444

Em `2026-09-06T13:27:35Z`, no PR #1444, o `chatgpt-codex-connector[bot]` publicou que o limite de uso de Codex para code reviews foi atingido.

```text
PR=1444
PR_HEAD_AT_EVENT=7bc061bf80f2e94427927ffae6dc769d8c33ee83
CODEX_REVIEW_STATE=UNUSABLE
CAUSE=USAGE_LIMIT_REACHED
FALLBACK_TRIGGER_PRESENT=true
```

O contrato existente já determina:

```text
CODEX_REVIEW_WHEN_AVAILABLE_AND_MEASURED
→ ZENDRIVE_REVIEW_FALLBACK_WHEN_CODEX_UNAVAILABLE_OR_UNUSABLE
→ CODERABBIT_REVIEW_AS_PARALLEL_OR_SECONDARY_CONSULTATIVE_SIGNAL
→ SIGNAL_WATCHER
→ HERMES_REPRODUCE_AND_TEST
→ META_LUPA_COUNTERPROOF
→ RECEIPT
```

O bridge existente lê Rabbit A, Rabbit B e Zendrive de forma independente. Falha/ausência de Rabbit não deve impedir o receipt Zendrive de seguir para Signal Watcher e mineralizer.

```text
RABBIT_UNAVAILABLE_DOES_NOT_BLOCK_ZENDRIVE=true
CODEX_USAGE_LIMIT_COUNTS_AS_UNUSABLE=true
ZENDRIVE_ROLE=REVIEW_ONLY
ZENDRIVE_IS_NOT_MERGE_AUTHORITY=true
```

Dependabot permanece um mutador especializado de dependências. Zendrive não o substitui como mutador; quando Dependabot falha, Zendrive pode entrar como diagnóstico/revisão consultiva e o owner/Writer existente executa a remediação após teste.

```text
DEPENDABOT_FAILURE
→ PERSISTENT_GAP_SWEEP
→ CAUSE + OWNER
→ ZENDRIVE/CODERABBIT/CODEX AS CONSULTATIVE_CAPABILITIES_WHEN_APPLICABLE
→ HERMES_TEST
→ WRITER_MINIMAL_REMEDIATION
→ COUNTERPROOF
```

### Estado do E2E neste receipt

```text
CODEX_FAILURE_EVENT=PROVED
FALLBACK_CONTRACT=PROVED_IN_SOURCE
ZENDRIVE_BRIDGE=PROVED_IN_SOURCE
ZENDRIVE_AUTOMATIC_ENTRY_AFTER_THIS_EVENT=EVIDENCE_MISSING_UNTIL_RUNTIME_RECEIPT
STATUS=FALLBACK_TRIGGER_PRESENT_E2E_PENDING_RECEIPT
```

Não transformar ausência de receipt imediato em falha definitiva: a Casa pode estar processando. Remedir antes de qualquer veredito.

## 14. Lei fundamental — tudo que tocar deve cristalizar o aprendizado material

A partir deste ponto, cada alteração material feita no organismo deve deixar um rastro reutilizável no **owner existente**, sem fabricar documento, regra, job ou arquitetura paralela somente para registrar atividade.

```text
MATERIAL_TOUCH
→ MEASURE_BEFORE
→ OWNER
→ CAUSE_OR_INTENT
→ MINIMAL_DELTA
→ TEST
→ COUNTERPROOF
→ MEASURE_AFTER
→ RECEIPT
→ CRYSTALLIZE_IN_EXISTING_OWNER
→ REUSE_ON_NEXT_MATCH
```

Se a peça foi tocada e houve aprendizado material, esse aprendizado deve sobreviver à sessão/modelo/agente. Se não houve ganho informacional, registrar `NO_CHANGE` quando necessário e **não** criar commit artificial.

```text
EVERY_MATERIAL_TOUCH_MUST_LEAVE_RECEIPT=true
EVERY_PROVEN_IMPROVEMENT_MUST_CRYSTALLIZE=true
EVERY_REFUTED_HYPOTHESIS_MUST_MINERALIZE=true
EVERY_UNKNOWN_MUST_KEEP_REOPEN_CONDITION=true
CRYSTALLIZATION_TARGET=EXISTING_CANONICAL_OWNER
NO_NEW_INFORMATION_NO_NEW_RULE=true
NO_NEW_INFORMATION_NO_NEW_COMMIT=true
NO_NEW_INFORMATION_NO_NEW_PR=true
```

O objetivo da regra é evitar repetir investigação, evitar regressão e fazer a Casa começar cada ciclo acima do último estado comprovado.

A formulação administrativa normativa vive em `docs/SEGURANCA/ADM-INVENTARIO-COMANDO-UNIVERSAL.md` e deve ser carregada no boot/reconciliação.
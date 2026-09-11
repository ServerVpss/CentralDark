---
title: "PEGATUDO cross-surface — extração sem criar segundo sistema"
status: "OPERATIONAL_REFERENCE"
owner: ".agents/skills/distinct-engineering-compiler/SKILL.md"
composes:
  - ".agents/skills/session-intelligence-harvester/SKILL.md"
  - ".agents/skills/screenpipe-live-observer/SKILL.md"
  - ".agents/skills/knowledge-compiler/SKILL.md"
  - ".agents/skills/meta-lupa/SKILL.md"
  - ".agents/skills/capability-contract-router/SKILL.md"
  - ".agents/skills/centraldark-operational-method/SKILL.md"
  - ".agents/skills/skill-workshop/SKILL.md"
  - ".agents/skills/openai-docs/SKILL.md"
---

# #PEGATUDO — modo de garimpo cross-surface do owner existente

`#PEGATUDO`, `!PEGATUDO` e pedidos equivalentes significam **aplicar o garimpo total já existente** sobre todas as superfícies materiais disponíveis, deduplicar por capacidade/causa/owner e absorver somente delta útil no organismo CentralDark atual.

```text
PEGATUDO_IS_ALIAS_NOT_NEW_SKILL=true
PEGATUDO_IS_NOT_NEW_BRAIN=true
PEGATUDO_IS_NOT_NEW_ROUTER=true
PEGATUDO_IS_NOT_NEW_API=true
PEGATUDO_IS_NOT_NEW_PORT=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION=true
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
```

## Regra central

```text
MUITAS_SUPERFICIES
→ EXTRAIR CAPACIDADES/DELTAS
→ NORMALIZAR EVIDENCIA
→ DEDUPE POR SOURCE|CAUSE|CLAIM|SCOPE|TIME
→ LOCALIZAR OWNER EXISTENTE
→ PROVAR GAP REAL
→ MENOR DELTA
→ UM WRITER POR ESCOPO
→ TESTE + CONTRAPROVA + REMEDICAO
→ REGISTRO
```

Quantidade de janelas, modelos, sessões, contas, conectores ou mensagens não multiplica verdade. O denominador útil é o conjunto de deltas causalmente independentes que sobreviveram ao dedupe.

## 10 frentes canônicas do PEGATUDO

As frentes são lentes de varredura. Não são dez sistemas nem dez writers.

```text
F1  LIVE_VISUAL        = Screenpipe / frame / accessibility / OCR quando necessário
F2  SESSION_HISTORY    = chats, receipts, logs e sessões históricas via harvester
F3  GITHUB_REALITY     = main, PR, issue, workflow, check, commit, diff
F4  BROWSER_CHAT       = ChatGPT, Copilot web e outras superfícies autenticadas observáveis
F5  IDE_TERMINAL       = VS Code, terminal, Git, SSH e ferramentas de desenvolvimento
F6  TASKS_AUTOMATION   = Kanban, tasks, hooks, schedules, notifications e follow-through
F7  CONNECTORS         = conectores/MCP/hub já disponíveis e suas capacidades reais
F8  RUNTIME_MODELS     = Hermes, router, providers, modelos, fallback e resource-fit
F9  PRIVACY_SECURITY   = redaction, CSP, credenciais, limites de autoridade e logs seguros
F10 CONVERGENCE        = owner, consumidor, prova, contraprova, fixed point e next cursor
```

Para cada frente:

```text
DISCOVER
→ CURRENT_STATE
→ CAPABILITY
→ OWNER
→ GAP?
→ EVIDENCE
→ COUNTERPROOF
→ DELTA_ONLY
→ NEXT
```

## Reanchor visual automático

Quando Screenpipe estiver disponível e o contexto visual for material:

```text
#ACORDAR | !CALIBRAR | REANCHOR
→ HEALTH_FIRST
→ ACTIVITY_SUMMARY / KEYWORD_SEARCH COM TERMOS DA MISSAO
→ ACCESSIBILITY_OR_STRUCTURED_SEARCH_FIRST
→ FRAME/OCR SOMENTE QUANDO NECESSARIO
→ CRUZAR COM GIT/RUNTIME/ARQUIVO ORIGINAL
→ EMITIR VISUAL_DELTA
→ CARACOL RECEBE METADATA, NAO NOVA CAUSALIDADE
→ DEDUPE
→ CONTINUAR MISSAO
```

`VISUAL_DELTA` é observação. Não substitui o Git, runtime, arquivo original, log causal, Writer ou Reality Judge.

## Superfícies atuais típicas

Exemplos de superfícies que podem entrar quando observáveis e relevantes:

```text
CHATGPT
GITHUB_COPILOT
HERMES
BROWSER
IDE
TERMINAL
OBSIDIAN
KANBAN
GITHUB
MCP/HUB
```

Elas são adapters/fronts do mesmo organismo. Nenhuma delas vira owner ou governo só por estar aberta.

## Browser e sessão autenticada — usar contexto sem extrair segredo

É permitido aproveitar uma sessão autenticada já aberta como **canal/superfície de trabalho** quando o runtime autorizado oferece essa capacidade. Isso não autoriza ler, copiar, persistir ou transmitir segredos de storage.

```text
AUTHENTICATED_BROWSER_SESSION_CAN_BE_CONTEXT=true
BROWSER_SESSION_IS_NOT_AUTHORITY=true
DO_NOT_EXTRACT_COOKIES=true
DO_NOT_EXTRACT_AUTH_TOKENS=true
DO_NOT_EXTRACT_PRIVATE_STATE_TOKENS=true
DO_NOT_EXTRACT_SESSION_STORAGE_SECRETS=true
DO_NOT_EXTRACT_LOCAL_STORAGE_SECRETS=true
DO_NOT_EXTRACT_EXTENSION_STORAGE_SECRETS=true
DO_NOT_COMMIT_BROWSER_SECRET_STATE=true
DO_NOT_PUT_SECRET_VALUES_IN_RECEIPTS=true
```

DevTools pode ser usado para observar comportamento, erros, requests e estado não sensível. A presença de valores em Local/Session/Extension Storage não torna esses valores material de garimpo.

## CSP e erros de navegador

Mensagem CSP `report-only` é evidência de política/telemetria, não falha funcional automática.

```text
CSP_REPORT_ONLY_EVENT = OBSERVATION
CSP_REPORT_ONLY_EVENT != FUNCTIONAL_FAILURE
UNSAFE_EVAL_BLOCKED != ROOT_CAUSE_UNLESS_SAME_TARGET_BEHAVIOR_PROVES_IT
ROUTER_WARNING != ROUTER_FAILURE
```

Só promover causa se houver correlação discriminante com o mesmo alvo e remedição T0→T1.

## Screenpipe indisponível não paralisa a Casa inteira

```text
SCREENPIPE_UNAVAILABLE
→ MARK_SCREENPIPE_BRANCH=UNAVAILABLE|UNKNOWN
→ TRY_OTHER_EXISTING_SENSOR_OR_TOOL
→ CONTINUE_INDEPENDENT_FRONTS
→ DO_NOT_CREATE_PARALLEL_PORT
→ DO_NOT_CREATE_SECOND_API
→ DO_NOT_INVENT_SCREENPIPE_PASS
```

Uma ferramenta ou API parada não implica organismo parado quando outra capacidade existente cobre o fato necessário. Porém, nenhuma alternativa pode fingir equivalência sem prova.

## Modelos/providers e fallback

```text
MODEL_OR_PROVIDER_UNAVAILABLE
→ CAPABILITY_CONTRACT_ROUTER
→ FIND_EXISTING_COMPATIBLE_ROUTE
→ PROVE_TRANSPORT_AND_CAPABILITY
→ CONTINUE
```

`FREE_TIER`, conta adicional, provider alternativo ou engine local são recursos candidatos, não PASS automático. Credenciais permanecem fora de logs/commits.

## CARACOL

PEGATUDO alimenta o CARACOL com catálogo/metadados de capacidades e gaps. Não cria arestas semânticas novas por proximidade visual.

```text
PEGATUDO_DELTA
→ NORMALIZED_METADATA
→ CARACOL_TRAVERSAL
→ OWNER/CONSUMER/PROOF_TARGET EXISTENTES

CARACOL_NAVIGATION != CAUSALITY
VISUAL_PROXIMITY != SEMANTIC_EDGE
```

## CARACOL evoluído — travessia de capacidades sob demanda

O CARACOL não percorre apenas nós já conhecidos do grafo. Quando a volta encontra um GAP real, ele pode consultar a **prateleira canônica de capacidades** sem transformar catálogo externo em autoridade.

```text
CARACOL_CAPABILITY_AWARE=true
CARACOL_DYNAMIC_LOAD=true
CARACOL_LOAD_ONLY_WHAT_IS_NEEDED=true
CATALOG_IS_SENSOR_NOT_AUTHORITY=true
UPSTREAM_IS_PROVENANCE_NOT_GOVERNANCE=true
EXTERNAL_DOC_IS_EVIDENCE_SOURCE_NOT_OWNER=true
```

Fluxo:

```text
🐚 !CARACOL
→ nó/gap material atual
→ OWNER existente?
   ├─ SIM → continuar owner atual
   └─ NÃO/UNKNOWN → skill-workshop FIND por capacidade
                   → comparar candidatos com owners locais
                   → INSPECT somente o escolhido
                   → openai-docs quando o gap depender de produto OpenAI atual
                   → ligar evidência à origem/commit/caminho
                   → MetaLupa / contraprova
                   → STITCH_DELTA no owner existente
                   → TESTE
                   → REALITY JUDGE
                   → REGISTRA
                   → nova volta
```

A **Auréola Canônica** vira o rastro visual da volta, não um segundo motor:

```text
⭕ !AURÉOLA CANÔNICA
→ mostra fonte consultada
→ capability escolhida
→ owner que recebeu o delta
→ prova/contraprova
→ UNKNOWN restante
→ próximo cursor do CARACOL
```

Regras de contenção:

```text
SKILL_FOUND != SKILL_NEEDED
SKILL_PRESENT != RUNTIME_PROVEN
DOC_FOUND != FACT_VERIFIED
CATALOG_ENTRY != EXECUTABLE_AUTHORITY
CARACOL_TRAVERSAL != SEMANTIC_EDGE
NO_NEW_SKILL_IF_EXISTING_OWNER_CAN_ABSORB=true
NO_BULK_LOAD_OF_SKILL_BODIES=true
NO_PARALLEL_CREATOR=true
```

Resultado esperado: o CARACOL vira uma **travessia adaptativa do mesmo organismo**. Ele encontra a ferida, busca apenas a ferramenta mental necessária, devolve o delta ao owner certo e continua a volta sem carregar a biblioteca inteira nem abrir arquitetura paralela.

## Critério de fixed point

Não declarar `100%` porque dez recomendações foram listadas ou executadas verbalmente.

```text
PEGATUDO_FIXED_POINT somente se:
- 10 frentes aplicáveis foram medidas ou marcadas NOT_APPLICABLE com razão;
- deltas duplicados foram colapsados;
- cada gap material tem owner e proof target;
- nenhuma mutação concorrente existe no mesmo escopo;
- checks/testes aplicáveis pertencem ao mesmo HEAD/target;
- contraprova foi executada onde material;
- MATERIAL_UNKNOWN_FOR_PROMOTION=0;
- NO_NEW_INFORMATION numa nova rodada discriminante.
```

```text
RECOMMENDATION_COUNT != FIXED_POINT
UI_CLICK != PROOF
SCREENSHOT != CURRENT_RUNTIME
HISTORY != CURRENT
DOCUMENTED != EXECUTED
UNKNOWN != PASS
```

## Saída comprimida

```text
PEGATUDO_RECEIPT:
  observed_at:
  fronts_measured:
  fronts_not_applicable:
  independent_deltas:
  duplicate_deltas_dropped:
  canonical_owners:
  mutations_serialized:
  capability_sources_consulted:
  capability_selected:
  aureola_trace:
  evidence_refs:
  material_unknowns:
  fixed_point: PROVEN|NOT_PROVEN
  next_cursor:
```

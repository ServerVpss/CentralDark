# Absorção de capacidades OmniRoute → Roteador CentralDark

Status: `IMPLEMENTATION_LANE`
Issue de origem: #722
PR-mãe de rendezvous: #1444
Owner de runtime: `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`
Superfície: `/roteador`

## Intenção do CHEFE

```text
CHEFE_PEDIU=true
INTENCAO_DO_CHEFE=DELTA_UTIL
AGENTE_DECIDE_SE_E_UTIL=false
FULL_REQUESTED_MATERIAL_MUST_BE_PROCESSED=true
REUSE_BEFORE_CREATE=true
ZERO_REGRESSION=true
ONE_SYSTEM_ONLY=true
```

O pedido não é importar um segundo produto nem perguntar ao agente quais capacidades "valem a pena". O pedido é processar as capacidades da fonte, reconciliar cada uma contra a CentralDark viva e absorver a capacidade pedida no owner correto, preservando a intenção e escolhendo apenas a implementação técnica mais segura.

## Fonte externa pinada

```text
SOURCE_REPO=diegosouzapw/OmniRoute
SOURCE_REF=release/v3.8.51
SOURCE_COMMIT=f9a1cc8a9b7336e394ef921c753f5da691798df9
SOURCE_LICENSE=MIT
SOURCE_LICENSE_FILE=LICENSE
```

A licença MIT permite uso, cópia, modificação e redistribuição com preservação do aviso de copyright/licença em cópias ou porções substanciais. Esta lane prefere reimplementação/adaptação de capacidade e contrato em linguagem CentralDark, em vez de copiar cegamente o control plane externo.

## O que foi medido na fonte

A fonte expõe, entre outras famílias, gateway multi-provider, providers/nodes/models, fallback, 19 estratégias públicas de routing, quota-share, quota telemetry, free-tier radar, API keys, OAuth, Chat/Responses/Messages, compatibilidade Gemini, embeddings, mídia, moderation, rerank, search, compression, cache, usage/cost, logs/audit, health, settings, CLI tools, embedded services, system ops, cloud, pricing, memory, skills, MCP, A2A, ACP, AgentBridge, Traffic Inspector, playground, evals, guardrails, webhooks, tunnels, plugins, i18n e desktop shell.

O inventário operacional está em:

```text
apps/instinto-superior/public/centraldark/router-capabilities.json
```

Cada família possui:

```text
CAPABILITY_ID
SOURCE_AREA
CENTRALDARK_OWNER
DECISION
STATE
PROOF_NOTE
```

## Owner CentralDark existente

O owner de roteamento já existe e não é substituído:

```text
apps/modulos/elite-gateway/scripts/centraldark_omni_router.py
```

O owner atual já possui:

- superfície OpenAI-compatible;
- `/v1/chat/completions`;
- `/v1/responses`;
- streaming;
- `/v1/models`;
- `/health`;
- providers `nous`, `hermes`, `google`, `claude-code`, `xai`, `abacus`, `openai`;
- fallback automático configurável;
- política free-only;
- tentativas visíveis;
- redaction de dados sensíveis;
- `MODEL_TOUCH` via Evidence Envelope/agent-log.

Isso é base nativa, não paridade completa com a fonte externa.

```text
CURRENT_ROUTER_NATIVE != OMNIROUTE_FULL_PARITY
MAPPED_CAPABILITY != IMPLEMENTED_CAPABILITY
SOURCE_FEATURE != CENTRALDARK_RUNTIME_PROOF
```

## Superfície única

A UI existente `apps/instinto-superior` é TanStack Start com file-based routing. Portanto a extensão correta é uma rota no owner existente, não `src/pages` nem outro painel.

```text
Header CentralDark
→ botão Roteador
→ /roteador
→ capability registry
→ health probe opcional do owner existente
→ status + owner + decisão + prova
```

O botão representa a capability e não apenas abre um arquivo. Ele mostra o mapa completo processado e separa:

```text
NATIVE
OWNER_EXISTS
ADAPTATION_REQUIRED
OWNER_DISCOVERY_REQUIRED
RUNTIME_UNKNOWN
```

### Runtime probe

A superfície pode medir `GET /health` quando o ambiente do frontend fornecer:

```text
VITE_CENTRALDARK_ROUTER_URL
```

Nenhum token é colocado no bundle por esta lane. Sem URL, CORS ou runtime observável:

```text
LIVE_STATE=UNKNOWN|UNCONFIGURED
```

Nunca converter ausência de probe em FAIL nem PASS.

## Arquitetura de absorção

```text
INTENCAO DO CHEFE
→ DELTA_UTIL=true
→ PINAR FONTE + LICENCA + SHA
→ INVENTARIAR CAPACIDADES
→ COMPARAR COM OWNERS CENTRALDARK
→ REUSE EXISTING OWNER
→ ADAPTAR GAP NO MESMO OWNER
→ EXIBIR NO MESMO ROTEADOR CENTRALDARK
→ TESTAR NO HEAD EXATO
→ CONTRAPROVAR
→ RECEIPT
→ PROXIMA FAMILIA
```

### Restrições

```text
SECOND_ROUTER=false
SECOND_BRAIN=false
SECOND_MCP=false
SECOND_HUB=false
SECOND_APP=false
V2_V3=false
BLIND_COPY=false
SECRET_IN_UI=false
PROVIDER_BYPASS=false
```

## Fase atual desta implementação

Esta passagem entrega a primeira superfície nativa e o inventário rastreável. Ela não declara que dezenas de subsistemas externos foram magicamente implementados.

```text
CAPABILITY_SOURCE_PIN=PROVEN_BY_GITHUB
LICENSE=PROVEN_BY_SOURCE
CAPABILITY_REGISTRY=IMPLEMENTED_IN_BRANCH
CENTRALDARK_ROUTER_BUTTON=IMPLEMENTED_IN_BRANCH
CENTRALDARK_ROUTER_ROUTE=IMPLEMENTED_IN_BRANCH
LIVE_RUNTIME=UNKNOWN_UNTIL_DEPLOY_AND_PROBE
FULL_RUNTIME_PARITY=NOT_CLAIMED
```

O registro serve de denominador. As próximas implementações reduzem `ADAPTATION_REQUIRED` e `OWNER_DISCOVERY_REQUIRED` sem inventar outro organismo.

## Contraprova obrigatória

Antes da promoção:

1. JSON do capability registry deve ser válido e conter o pin da fonte.
2. Nenhuma capability pedida pode sumir silenciosamente do denominador.
3. Build/lint do `apps/instinto-superior` devem permanecer aplicáveis.
4. A rota `/roteador` deve pertencer ao file router existente.
5. O menu deve continuar funcionando na home e na nova rota.
6. Nenhum segredo deve estar presente no manifest/UI.
7. Nenhum segundo router/backend deve ser criado.
8. O HEAD testado deve ser o HEAD promovido.

## Receipt schema

```text
CAPABILITY_ID=
SOURCE_REPO=diegosouzapw/OmniRoute
SOURCE_REF=release/v3.8.51
SOURCE_COMMIT=f9a1cc8a9b7336e394ef921c753f5da691798df9
SOURCE_LICENSE=MIT
CENTRALDARK_OWNER=
REUSE_OR_REIMPLEMENT=
FILES_TOUCHED=
TEST=
COUNTERPROOF=
RUNTIME_RESULT=
RECEIPT=
NEXT_CURSOR=
```

`PAPAGAIO=OFF · UNKNOWN_IS_NOT_PASS=true · ZERO_REGRESSION=true`

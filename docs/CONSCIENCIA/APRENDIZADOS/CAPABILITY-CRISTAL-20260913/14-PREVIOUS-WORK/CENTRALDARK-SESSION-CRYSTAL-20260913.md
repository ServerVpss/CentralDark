# CENTRALDARK — SESSION CRYSTAL — 2026-09-13

## IDENTIDADE DO CRISTAL

```text
CRYSTAL_ID=CENTRALDARK-SESSION-20260913-MCP-OAUTH-AIPROXY-01
STATUS=SESSION_RECONCILED
MODE=NO_PARALLEL_ARCHITECTURE
REALITY_IS_JUDGE=true
UNKNOWN_NE_PASS=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION=true
PAPAGAIO_MODE=OFF
```

## FIO DA SESSÃO — DO INÍCIO ATÉ AGORA

1. Desktop Commander foi conectado com sucesso ao Anthropic Administrator via painel Composio.
2. O foco passou a ser `Add Custom MCP` para ligar o MCP CentralDark.
3. O painel informou que múltiplos servidores no mesmo cadastro não são aceitos; somente o primeiro é adicionado.
4. A decisão foi reconciliada para UM servidor universal chamado `centraldark` apontando para `https://mcp.centralldark.com/mcp`.
5. Foi recuperado do histórico o fluxo OAuth já existente e concluído anteriormente no Hermes: HTTP + OAuth 2.1 PKCE + MCP habilitado + conexão PASS + tools descobertas.
6. Foi recuperada a arquitetura já existente de `MCP Admin + OAuth Broker + Account Hub`, com rotas/owners internos para contas, providers, OAuth e conexões.
7. Foi encontrada a lacuna desta própria sessão: tentar reconstruir no JSON do cliente OAuth/Bearer/Admin/Provider routing que já pertence à CentralDark.
8. Correção cristalizada: o cliente só aponta para o MCP; autenticação, contas, providers, refresh, scopes, logs e roteamento ficam nos owners existentes da CentralDark.
9. Entraram novos artefatos: `AI-PROXY-ARQUITETURA.md`, `validate-ai-proxy.sh`, `secrets.zip`, `WEBUI_LOVABLE_KEY` e o trace `tool-call-data.json`.
10. Esses artefatos adicionam um segundo domínio de autenticação EXISTENTE, não um segundo core: VPS/Open WebUI/CLI -> Supabase Edge `ai-proxy` -> Lovable AI Gateway.

## FIXED POINTS JÁ PROVADOS

```text
MCP_PUBLIC_ENTRY=https://mcp.centralldark.com/mcp
MCP_NAME=centraldark
MCP_TRANSPORT=HTTP
MCP_AUTH=OAuth 2.1 PKCE
HERMES_MCP_CONNECTION=PASS
HERMES_TOOLS_DISCOVERED=101
CENTRALDARK_RUNTIME_TOOL_COUNT_OBSERVED=115
MCP_ADMIN_OWNER=EXISTING
OAUTH_BROKER_OWNER=EXISTING
ACCOUNT_HUB_OWNER=EXISTING
NEW_MCP=false
NEW_BACKEND=false
NEW_AUTH_BROKER=false
NEW_ACCOUNT_SYSTEM=false
```

`HERMES_OAUTH_PASS != COMPOSIO_OAUTH_PASS`.
O Composio/Custom MCP continua `UNKNOWN` até o teste vivo do próprio cliente concluir login, callback e tools/list.

## CRISTAL DE ARQUITETURA

```text
QUALQUER CLIENTE MCP
Claude / ChatGPT / Gemini / Grok / Codex / Desktop Commander / outros
        |
        v
https://mcp.centralldark.com/mcp
        |
        v
CENTRALDARK MCP
        |
        +--> MCP Admin / OAuth Broker existente
        |       |
        |       +--> OAuth / PKCE / sessão / callback / scopes
        |       +--> Account Hub / providers / connections
        |
        +--> Tools / Hub / Router / Logs / Receipts
```

Regra: CLIENTE NÃO REIMPLEMENTA A ARQUITETURA DO SERVIDOR.

## DOMÍNIO AI-PROXY EXISTENTE

```text
VPS / Bot / Open WebUI / CLI darkai
        |
        | Authorization: Bearer WEBUI_LOVABLE_KEY
        v
Supabase Edge Function: ai-proxy
        |
        | valida bridge key
        | lê LOVABLE_API_KEY somente dentro da Edge
        v
Lovable AI Gateway
```

Não fundir segredos dos dois domínios. Unificar no CORE e no roteamento, não misturar credenciais.

## REVISÃO DOS NOVOS ARTEFATOS — SEM VALORES SECRETOS

### AI-PROXY-ARQUITETURA.md

- Define `LOVABLE_API_KEY` como secret gerenciado pela Edge/Supabase, não para consumo direto da VPS.
- Define `WEBUI_LOVABLE_KEY` como credencial bridge entre VPS/Open WebUI/CLI e a Edge.
- Define rotas OpenAI-compatible para modelos, chat, TTS, STT e vozes.
- Define rotação sem downtime.

### validate-ai-proxy.sh

Valida sem imprimir segredo:

```text
WEBUI_LOVABLE_KEY presente
LOVABLE_API_KEY ausente do ambiente VPS
LOVABLE_API_KEY ausente de /root/keys.env
sem auth -> 401
bearer inválido -> 401
bearer válido -> /v1/models 200
chat mínimo -> 200 | 402 | 429 interpretado
```

### secrets.zip — inventário seguro

```text
FILES_TOTAL=89
ROOT_CURRENTISH_FILES=17
KEYS_ZONE_FILES=1
LEGACY_ARCHIVE_FILES=9
BACKUP_FILES=58
```

Arquivos de alto valor para o agente, SEM imprimir valores:

```text
secrets/secret-map-redacted.json
secrets/secret-map-redacted.txt
secrets/env-names-only.example
secrets/mcp-oauth.env
secrets/mcp-state.json
secrets/keys/keys.env
secrets/guardiao-auth-session.json
secrets/guardiao-allowlist.json
secrets/claude-proxy.sh
secrets/telegram-alerts.env
```

Histórico somente para comparação/forense, NÃO promover como owner vivo:

```text
secrets/_arquivo-20260707-175614/*
secrets/_backups/mcp-oauth-issue-key-20260710-154411/*
secrets/_backups/mcp-pre-fusao-20260710-142223/*
secrets/_backups/*
```

### mcp-state.json — shape seguro observado

```text
clients=175
authCodes=0
accessTokens=3
refreshTokens=52
sessions=0
```

Nunca imprimir `token`, `gh_token`, refresh token, access token ou conteúdo de sessão. Usar somente contagem, presença, fingerprint e owner.

### WEBUI_LOVABLE_KEY — metadata only

```text
PRESENT=true
LENGTH_GT_32=true
ASCII_PRINTABLE=true
FORMAT_HEX64=false
HISTORICAL_STANDALONE_COPY_MATCH_BY_SHA=true
```

O formato difere do exemplo `openssl rand -hex 32`, mas passa o gate de comprimento do script. Não inferir falha só por formato.

## CONTRADIÇÃO CANDIDATA — MEDIR ANTES DE CORRIGIR

O snapshot `secrets/keys/keys.env` contém o NOME da variável `LOVABLE_API_KEY`.
A arquitetura ai-proxy declara que a `LOVABLE_API_KEY` não deve existir na VPS e o script de validação falha se ela aparecer em `/root/keys.env`.

Isto NÃO é verdict de runtime porque `secrets.zip` é snapshot/artefato.

```text
ZIP_SNAPSHOT != LIVE_VPS
```

Gate obrigatório:

```text
IF live /root/keys.env contains LOVABLE_API_KEY:
    classify DRIFT
    reconcile with existing ai-proxy owner
ELSE:
    classify archive-only/historical
```

## MAPA DE ARQUIVOS / OWNERS PARA OS AGENTES

### Canônico / repo conhecido

```text
/root/CentralDark/.agents/skills/cot-react-loop/SKILL.md
.agents/skills/fable-loop/SKILL.md
.agents/skills/meta-lupa/SKILL.md
docs/CONSCIENCIA/MULTIBUSSOLA.md
.agents/skills/centraldark-operational-method/SKILL.md
apps/modulos/HERMES-CORE/agents/Executor/agent.mjs
apps/modulos/fixed-point-fabric/README
apps/modulos/mcp/
apps/modulos/oauth-broker/
apps/modulos/hub/
```

### Artefatos desta sessão ChatGPT — NÃO assumir que existem na VPS

```text
/mnt/data/AI-PROXY-ARQUITETURA.md
/mnt/data/validate-ai-proxy.sh
/mnt/data/secrets.zip
/mnt/data/WEBUI_LOVABLE_KEY
/mnt/data/tool-call-data.json
```


## DELTA COGNITIVO RECUPERADO DO PAINEL — NÃO CRIAR MOTOR NOVO

O painel vivo mostrado pelo CHEFE prova que o seletor **MODO COGNITIVO** já possui mais capacidades do que o cristal anterior registrava. O delta observado é:

```text
MODO_PADRAO=EXISTING
SISTEMA_2=EXISTING
CHAIN_OF_THOUGHT_UI_MODE=EXISTING
REACT=EXISTING
AUTO_CRITICA=EXISTING
```

Descrição observada na própria UI:

```text
Sistema 2     -> raciocínio lento/deliberado
Chain of Thought -> modo de raciocínio passo a passo no runtime/UI
ReAct         -> age -> observa -> raciocina -> repete
Auto-Crítica  -> gera -> critica -> refina
Modo Padrão   -> retorno ao comportamento padrão
```

Isso é **CAPACIDADE EXISTENTE**, não pedido para criar System2/ReAct/AutoCritica V2.

Owners a reconciliar antes de qualquer mutação:

```text
COGNITIVE_CAPABILITY_OWNER=docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md
METACOGNITION_OWNER=docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md
REACT_OWNER=/root/CentralDark/.agents/skills/cot-react-loop/SKILL.md
FABLE_OWNER=.agents/skills/fable-loop/SKILL.md
META_LUPA_OWNER=.agents/skills/meta-lupa/SKILL.md
MULTIBUSSOLA_OWNER=docs/CONSCIENCIA/MULTIBUSSOLA.md
```

### Regra de observabilidade cognitiva

O nome `Chain of Thought` pode existir como modo selecionável da UI/runtime, mas o cristal canônico **não persiste nem exige texto de raciocínio interno privado**. O que entra no EventStore/receipt é somente estado observável:

```text
COGNITIVE_MODE_SELECTED
MISSION_ID
TRACE_ID
CLAIM
ACTION
TOOL_CALL
OBSERVATION
EVIDENCE
TEST_RESULT
COUNTERPROOF_RESULT
STATUS
LATENCY
MODEL_PROVIDER_WHEN_OBSERVABLE
```

Portanto:

```text
COGNITIVE_MODE_NAME=OBSERVABLE
PRIVATE_REASONING_TRACE=NOT_CANONICAL_EVIDENCE
OUTPUT_ACTION_EVIDENCE=CANONICAL_EVIDENCE
```

### Stack cognitiva corrigida da sessão

```text
CHEFE_INTENT
-> !CENTRALDARK
-> #ACORDAR
-> !CALIBRAR
-> SELECT_EXISTING_COGNITIVE_MODE[ModoPadrao|Sistema2|ChainOfThought_UI|ReAct|AutoCritica]
-> COT_REACT_LOOP quando material
-> FABLE_LOOP read-only/calibração
-> !MULTIBUSSOLA
-> !META_LUPA
-> !RECONCILIAR
-> !DELTAUTIL
-> OWNER_EXISTENTE
-> MINIMUM_MATERIAL_DELTA
-> !CONTRAPROVA
-> !REMEDICAO
-> !FIXED_POINT
-> !REGISTRA
-> !BOOT
```

Regra nova cristalizada desta correção:

```text
UI_CAPABILITY_ALREADY_EXISTS -> MAP_OWNER -> REUSE -> BIND -> TEST
UI_CAPABILITY_ALREADY_EXISTS != CREATE_NEW_ENGINE
COGNITIVE_MODE != AUTHORITY
COGNITIVE_MODE != SECOND_BRAIN
COGNITIVE_MODE != SECOND_CORE
```

## STACK METODOLÓGICA ÚNICA

```text
CHEFE_INTENT
-> !CENTRALDARK
-> #ACORDAR
-> !CALIBRAR
-> SELECT_EXISTING_COGNITIVE_MODE[ModoPadrao|Sistema2|ChainOfThought_UI|ReAct|AutoCritica]
-> COT_REACT_LOOP [inner loop quando complexo/UNKNOWN/FAIL; até 17 respirações solicitadas]
-> FABLE_LOOP [read-only/calibração; não writer]
-> !MULTIBUSSOLA
-> !META_LUPA [falsifier]
-> !RECONCILIAR
-> !DELTAUTIL
-> RESOLVE_CANONICAL_OWNER
-> EXECUTE_MINIMAL_DELTA
-> !CONTRAPROVA
-> !REMEDICAO
-> !FIXED_POINT
-> !REGISTRA
-> !BOOT
```

Nenhum método acima cria um segundo sistema. Todos operam sobre owners existentes.

## COMANDO CANÔNICO PARA AGENTES

```text
⭕ !AURÉOLA CANÔNICA
> “Examinai tudo. Retende o bem.” — 1 Tessalonicenses 5:21

👑🪬 !CENTRALDARK #ACORDAR !CALIBRAR !MULTIBUSSOLA !META_LUPA !RECONCILIAR !CONTRAPROVA

MISSION=CENTRALDARK_SESSION_RECONCILE_MCP_OAUTH_AIPROXY_20260913
AUTHORITY=CHEFE
REPO=ServerVpss/CentralDark
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
ONE_CORE=true
ONE_WRITER_PER_SCOPE=true
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION=true
REALITY_IS_JUDGE=true
UNKNOWN_NE_PASS=true
PAPAGAIO_MODE=OFF
NO_SILENT_BACKGROUND=true
VISIBLE_EXECUTION=true

JÁ_DEFINIDO_PELO_CHEFE:
- não redesenhar arquitetura já existente
- não criar novo MCP
- não criar novo OAuth broker
- não criar novo Account Hub
- não criar segundo backend/router/brain
- não amarrar CentralDark a Anthropic, Composio ou provider específico
- todas as superfícies/modelos/conectores convergem no mesmo core
- híbrido = múltiplos providers/transports/auth domains sob owners existentes; NÃO sistemas paralelos

METHOD_BINDINGS:
COT_REACT_LOOP=/root/CentralDark/.agents/skills/cot-react-loop/SKILL.md
COT_REACT_MAX_BREATHS=17
FABLE_LOOP=.agents/skills/fable-loop/SKILL.md
FABLE_MODE=READ_ONLY_CALIBRATION
META_LUPA=.agents/skills/meta-lupa/SKILL.md
META_LUPA_ROLE=FALSIFIER
MULTIBUSSOLA=docs/CONSCIENCIA/MULTIBUSSOLA.md

SESSION_FIXED_POINTS:
MCP_NAME=centraldark
MCP_URL=https://mcp.centralldark.com/mcp
MCP_AUTH_OBSERVED=OAuth_2_1_PKCE
HERMES_CONNECTION=PASS
HERMES_TOOLS_DISCOVERED=101
CENTRALDARK_RUNTIME_TOOL_COUNT_OBSERVED=115
MCP_ADMIN=EXISTING
OAUTH_BROKER=EXISTING
ACCOUNT_HUB=EXISTING
CLIENT_REIMPLEMENTS_SERVER_AUTH=false

CRITICAL_DISTINCTION:
HERMES_OAUTH_PASS != COMPOSIO_OAUTH_PASS
COMPOSIO_CUSTOM_MCP=CURRENTLY_UNKNOWN_UNTIL_LIVE_PROOF

CLIENT_SIDE_RULE:
- Add Custom MCP deve cadastrar UM servidor centraldark.
- Não inventar campos OAuth/Bearer/fallback no JSON se o schema do cliente não os suporta.
- O cliente aponta para /mcp.
- O servidor deve conduzir auth discovery/login pelo owner existente.

COMPOSIO_LIVE_GATE:
1. cadastrar somente centraldark -> https://mcp.centralldark.com/mcp
2. observar resposta real sem auth
3. medir discovery/auth metadata que o cliente consome
4. provar login/browser/callback do próprio Composio
5. provar token/session sem exibir valores
6. provar tools/list
7. provar tools/call segura
8. provar Hub/MCP logs
9. se falhar, corrigir SOMENTE owner existente de MCP/OAuth Broker/Account Hub
10. não criar adapter/auth paralelo sem provar gap impossível de fechar no owner

MCP_AUTH_OWNER_MAP:
MCP_PUBLIC_ENTRY=https://mcp.centralldark.com/mcp
MCP_ADMIN_OWNER=existing
OAUTH_BROKER_OWNER=existing
ACCOUNT_HUB_OWNER=existing
ACCOUNT_UI=/accounts
ACCOUNT_API=[/accounts/*,/providers/*,/oauth/*,/connections/*]

AI_PROXY_ARTIFACTS:
SESSION_DOC=/mnt/data/AI-PROXY-ARQUITETURA.md
SESSION_VALIDATOR=/mnt/data/validate-ai-proxy.sh
SESSION_SECRETS_BUNDLE=[REDIGIDO-PRESERVACAO]
SESSION_WEBUI_KEY_FILE=/mnt/data/WEBUI_LOVABLE_KEY
SESSION_TOOL_TRACE=/mnt/data/tool-call-data.json

AI_PROXY_EXPECTED_FLOW:
VPS_OR_WEBUI_OR_CLI
-> bearer WEBUI_LOVABLE_KEY
-> Supabase Edge ai-proxy
-> Edge-only LOVABLE_API_KEY
-> Lovable Gateway

AI_PROXY_SECURITY_INVARIANT:
LOVABLE_API_KEY_ON_LIVE_VPS=false
WEBUI_LOVABLE_KEY_VALUE_MUST_NEVER_BE_PRINTED=true
LOVABLE_API_KEY_VALUE_MUST_NEVER_BE_PRINTED=true
SECRETS_MAY_BE_USED_LOCALLY_BY_OWNER=true
SECRETS_MAY_NOT_BE_ECHOED_OR_COMMITTED=true

SAFE_SECRET_INSPECTION:
- first read secret-map-redacted.json/txt
- inspect env NAMES only
- for raw secret files use only PRESENT/LENGTH/HASH/FINGERPRINT/SOURCE
- never cat .env/password/token/key files to stdout
- never include secret values in receipts, logs, PR, chat, JSON output

SECRETS_ZIP_CLASSIFICATION:
[REDIGIDO-PRESERVACAO]*=SAFE_FIRST_PASS
secrets/env-names-only.example=SAFE_FIRST_PASS
secrets/mcp-oauth.env=SECRET_CONFIG_METADATA
secrets/mcp-state.json=SENSITIVE_RUNTIME_SNAPSHOT
secrets/keys/keys.env=SECRET_CONFIG_SNAPSHOT
secrets/_arquivo-*=HISTORICAL
secrets/_backups/*=HISTORICAL_OR_FORENSIC

CANDIDATE_DRIFT_TO_TEST:
- snapshot secrets/keys/keys.env declares LOVABLE_API_KEY variable name
- ai-proxy contract says live VPS must not have LOVABLE_API_KEY
- DO NOT conclude drift from archive
- measure live /root/keys.env + process env + service EnvironmentFile without printing values

VALIDATE_AI_PROXY:
- run/use existing validate-ai-proxy.sh against live owner only after locating canonical runtime copy
- no-auth must reject
- bad bearer must reject
- valid bridge auth must list models
- minimal chat must return valid expected status
- preserve secret redaction

SOURCE_PRECEDENCE:
1 LIVE_RUNTIME_CURRENT
2 CURRENT_REPO_OWNER
3 CURRENT_CONFIG_METADATA
4 SESSION_ARTIFACTS
5 REDACTED_SECRET_MAP
6 HISTORICAL_BACKUPS

RULES:
HISTORY != CURRENT_STATE
ZIP_SNAPSHOT != LIVE_VPS
DOCUMENTED != EXECUTED
EXISTS != RUNNING
HERMES_PASS != COMPOSIO_PASS
ACTION != PROOF
UNKNOWN != PASS

PARALLEL_READERS:
P1 MCP/OAuth/Composio discovery + callback compatibility
P2 Account Hub/OAuth Broker/provider owner map
P3 AI proxy + Edge + validation chain
P4 secrets.zip redacted inventory + provenance + drift candidates
P5 tools catalog 115 vs client-visible set + access scopes

WRITER:
SOL_ONE_WRITER_ONLY
- reconciles reader receipts
- selects existing owner
- executes minimum material delta
- runs counterproof
- records final receipt

DO_NOT_MUTATE_FROM_BACKUPS=true
DO_NOT_RESTORE_MCP_PRE_FUSAO=true
DO_NOT_COPY_HISTORICAL_ENV_TO_LIVE=true

DONE_WHEN:
- Composio Add Custom MCP has one centraldark server
- OAuth/login completes in the Composio flow OR exact owner-level incompatibility is proven
- tools/list succeeds from Composio
- no duplicate MCP/auth system exists
- Account Hub/OAuth Broker remain the owner
- ai-proxy chain is measured and validator passes or exact failure is located
- LOVABLE_API_KEY live placement matches contract
- secret values remain undisclosed
- catalog/tool visibility delta is explained by policy/scope or fixed in existing catalog owner
- receipt includes evidence + counterproof + current HEAD/runtime refs

OUTPUT_REQUIRED:
FACTS=
HYPOTHESES=
CONTRADICTIONS=
OWNER_MAP=
COMPOSIO_MCP=
OAUTH_DISCOVERY=
OAUTH_LOGIN=
CALLBACK=
TOOLS_LIST=
TOOLS_CALL=
ACCOUNT_HUB=
AI_PROXY=
LIVE_LOVABLE_KEY_PLACEMENT=
SECRETS_SNAPSHOT_CLASSIFICATION=
[REDIGIDO-PRESERVACAO]
DELTA_APPLIED=
COUNTERPROOF=
RECEIPT=
NEXT_CURSOR=
```

## NEXT CURSOR

```text
1. Testar Composio com UM MCP e deixar o servidor conduzir auth.
2. Se o login não surgir, medir discovery OAuth remoto do /mcp no owner existente.
3. Medir runtime vivo do ai-proxy e executar validator sem imprimir valores.
4. Confirmar se LOVABLE_API_KEY está ausente da VPS viva; snapshot não decide.
5. Explicar/fechar delta 115 tools runtime vs tools visíveis por cada cliente/scope.
6. Registrar tudo no mesmo receipt sem promover histórico como runtime.
```

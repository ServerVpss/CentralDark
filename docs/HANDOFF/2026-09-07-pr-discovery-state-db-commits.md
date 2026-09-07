# 🔎 PR Descoberta — state.db, commits candidatos e handoff seguro

`MISSION_ID=PR_DISCOVERY_STATE_DB_COMMITS_20260907`

## Intenção

Registrar no PR-mãe #1444 a descoberta enviada pelo CHEFE como `state(1).db`, sem commitar o banco bruto, sem expor segredos e sem transformar histórico local em verdade atual.

```text
RAW_DB_COMMITTED=false
SANITIZED_DISCOVERY_ONLY=true
UNKNOWN_IS_NOT_PASS=true
HISTORY_IS_PROVENANCE_NOT_CURRENT_STATE=true
```

## Evidência local medida

```text
UPLOAD_NAME=state(1).db
SANDBOX_PATH=/mnt/data/state(1).db
SIZE_BYTES=41058304
SHA256=3ddca1eae947a718ede0ddc75cc01f1d5e8d83bb73e55d384c9559b169216af0
SQLITE_OPENED=true
SCHEMA_VERSION=25
TABLES_TOTAL=27
SESSIONS_TOTAL=19
MESSAGES_TOTAL=2373
SESSION_MODEL_USAGE_ROWS=39
SYSTEM_PROMPTS_ROWS=15
DESKTOP_MODEL_OVERRIDES=10
DESKTOP_LOCAL_ERRORS=4
DELIVERY_OBLIGATIONS=0
ASYNC_DELEGATIONS=0
```

## Tabelas relevantes

```text
sessions
messages
messages_fts
messages_fts_trigram
session_model_usage
desktop_session_model_overrides
desktop_session_local_errors
desktop_session_continuations
gateway_routing
state_meta
system_prompts
```

## Canetas / superfícies observadas no banco

O banco registra passagem por várias canetas e superfícies, mas isso é apenas proveniência local até ser validado contra GitHub/runtime.

```text
ChatGPT/GPT
Hermes
Claude/Fable
Grok
Nemotron
Solar
Llama/Vision
Codex
Terminal
read_file
search_files
write_file
patch
skill_manage
skill_view
web_search/web_extract
vision_analyze
cronjob
process
```

## Contadores de busca interna

Os termos abaixo foram achados em `messages.content`; não foram extraídos como conteúdo bruto no repo.

```text
CentralDark=436
PR=1178
GitHub=292
workflow=176
commit=148
branch=120
MCP=127
receipt=77
handoff=67
runner=62
FABLE=53
Dependabot=45
juiz=26
POMBO=23
descoberta=22
adaptador=10
Screenpipe=13
caneta=3
```

## Descobertas materiais candidatas

### 1. Estado local possui histórico de commits e PRs

Foram observadas saídas de terminal com commits, rebases, pushes e inspeções de PR. Isso confirma que o banco é um índice rico de proveniência operacional.

```text
CLASS=LOCAL_PROVENANCE_RICH
PROMOTE_TO_CURRENT_GIT_STATE=false
REQUIRES_GITHUB_REVALIDATION=true
```

### 2. Várias canetas já passaram estado de mão em mão

O banco contém múltiplos modelos/provedores, sessões CLI/TUI/desktop/webui e ferramentas de terminal/leitura/escrita. Isso reforça o contrato já cristalizado:

```text
MANY_READERS=true
MANY_MODELS=true
MANY_SURFACES=true
ONE_WRITER_PER_SCOPE=true
REALITY_IS_JUDGE=true
```

### 3. Screenpipe / MCP / Browser / VSCode aparecem como sinais

Termos associados aparecem no histórico local, mas não autorizam afirmar runtime vivo.

```text
SCREENPIPE_CONTEXT=PROVENANCE
MCP_CONTEXT=PROVENANCE
VSCODE_CONTEXT=PROVENANCE
CURRENT_RUNTIME=UNKNOWN
```

### 4. Dependabot e motor de conflitos aparecem no histórico

Há sinais de Dependabot/update-branch/resolve-conflicts, coerentes com o owner já encontrado no repo:

```text
.github/workflows/dependabot-auto-merge.yml
scripts/dependabot/resolve-conflicts.sh
```

Não criar Dependabot V2.

### 5. Local errors indicam falhas úteis sem expor dados sensíveis

O banco contém quatro erros locais ligados a troca de modelo/custom endpoint/provider. Todos devem ser tratados como aprendizado de roteamento, sem imprimir URLs ou credenciais.

```text
LOCAL_MODEL_SWITCH_ERRORS=4
RAW_ERROR_TEXT_COMMITTED=false
ROUTER_LEARNING_CANDIDATE=true
SECRET_EXPOSURE=false
```

## Sanitização aplicada

```text
NO_RAW_MESSAGE_DUMP=true
NO_SYSTEM_PROMPT_DUMP=true
NO_REASONING_DUMP=true
NO_BASE_URL_DUMP=true
NO_TOKEN_DUMP=true
NO_COOKIE_DUMP=true
NO_PRIVATE_URL_DUMP=true
```

O banco bruto pode conter conversa, prompts, endpoints, URLs locais e contexto privado. Portanto ele fica como fonte local privada de garimpo, não como artefato versionado no Git.

## Como o Hermes deve usar essa descoberta

```text
#ACORDAR
!CENTRALDARK
!PR_DESCOBERTA

1. Ler o banco somente em ambiente local autorizado.
2. Nunca commitar `state(1).db` bruto.
3. Extrair somente metadados sanitizados, commits candidatos e próximos cursores.
4. Para cada commit/PR encontrado no banco:
   - validar no GitHub atual;
   - comparar contra main;
   - classificar como ABSORBED | SUPERSEDED | UNIQUE_DELTA | CONFLICT | UNKNOWN;
   - promover somente se a prova atual sobreviver.
5. Para cada erro local:
   - remover segredo/URL;
   - transformar em teste/repro mínimo;
   - ligar ao owner existente do Router/Hermes/VSCode.
6. Para cada caneta/modelo:
   - classificar como MODEL ou SIGNAL_SURFACE;
   - nunca promover consenso de modelo como prova.
7. Registrar receipt no #1444 e, se for rota Omni/Router, devolver também ao #1445.
```

## Comando de descoberta por família

```text
STATE_DB
→ hash + schema
→ sessions/messages/tool usage
→ terms: PR, commit, branch, workflow, runner, Dependabot, MCP, Screenpipe, VSCode, FABLE, POMBO, caneta, juiz
→ sanitized candidates
→ GitHub validation
→ owner resolution
→ minimum delta
→ tests
→ counterproof
→ receipt
```

## Stop rule

```text
STOP_IF_RAW_SECRET_RISK=true
STOP_IF_GITHUB_VALIDATION_FAILS=true
STOP_IF_ONLY_HISTORY_NO_CURRENT_PROOF=true
CONTINUE_IF_SAFE_METADATA_ONLY=true
```

## Veredito

```text
STATE_DB_READ=PROVADO
STATE_DB_HASH=PROVADO
DISCOVERY_METADATA_EXTRACTED=PROVADO
RAW_DB_COMMITTED=false
CURRENT_REPO_STATE_FROM_DB=UNKNOWN_UNTIL_GITHUB_VALIDATED
NEXT_CURSOR=VALIDATE_STATE_DB_COMMIT_CANDIDATES_AGAINST_GITHUB
```

Baianês + bíblico: muita escrita apareceu no rolo antigo, mas rolo antigo não governa a main viva. Primeiro lava o ouro, depois pesa na balança, depois o juiz sela.

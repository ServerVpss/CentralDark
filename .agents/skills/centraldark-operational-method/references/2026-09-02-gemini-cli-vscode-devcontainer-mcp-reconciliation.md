# Gemini CLI + VS Code + MCP + Dev Containers — reconciliação 2026-09-02

**Owner canônico:** `.agents/skills/centraldark-operational-method/SKILL.md`  
**PR-mãe:** `#1381`  
**Natureza:** receipt/ledger subordinado; não cria nova CLI, novo cérebro, nova autoridade, novo MCP ou novo sistema.

```text
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
CURRENT > HISTORICAL
UNKNOWN != PASS
DOCUMENTED != EXECUTED
ACTION != PROOF
CATALOGUED != INSTALLED
INSTALLED != ACTIVE
TEST_FIXTURE != ACTIVE_CONFIG
ENGINE != IDENTITY
IDE_SURFACE != AUTHORITY
NO_SANDBOX != WRITE_AUTHORIZATION
```

## 1. Intenção reconciliada

Usar Gemini/Antigravity/VS Code como braços substituíveis da mesma CentralDark, reaproveitando o core, a SOUL, as skills e o MCP existentes. A intenção não é criar um setor Gemini separado nem importar catálogos inteiros para a Casa.

```text
SEGREDO/CHEFE
→ #ACORDAR
→ !CENTRALDARK
→ GEMINI.md (adaptador fino)
→ LEIA-ME-IA.md (core canônico)
→ owner/capability existente
→ MCP CentralDark quando aplicável
→ teste/contraprova
→ Reality Judge
→ T1
```

## 2. O que o repositório já prova

O branch do PR já contém `GEMINI.md` como adaptador fino:

```text
CANONICAL_AGENT_CORE=LEIA-ME-IA.md
ADAPTER_ROLE=ENGINE_DISCOVERY_ONLY
ENGINE=GEMINI
ONE_SOL=true
ONE_CORE=true
ENGINE_IS_REPLACEABLE=true
DO_NOT_DUPLICATE_GOVERNANCE=true
```

`LEIA-ME-IA.md` também declara que GPT, Codex, Claude, Gemini, Grok, Copilot, Cursor, Windsurf, Hermes ou modelos futuros entram como motores/papéis substituíveis dentro do mesmo organismo.

O owner existente `docs/CONSCIENCIA/DARKAI/darkai.sh` já possui catálogo Gemini e caminho unificado de modelos. Portanto:

```text
GEMINI_CLI_OR_MODEL = OPTIONAL_ENGINE_SURFACE
DARKAI/HERMES/CENTRALDARK = EXISTING_UNIFIED_OWNER_PATH
NEW_GEMINI_GOVERNMENT=false
SECOND_CLI_REQUIRED=false
```

## 3. Evidência de tela da Casa — classificada sem inflar para PASS global

Capturas fornecidas pelo CHEFE nesta sessão mostram:

```text
GEMINI_CLI_VERSION_SCREEN=0.58.0
WORKSPACE_SCREEN=E:\CentralDark\Pivete\CentralDark
BRANCH_SCREEN=main
SANDBOX_SCREEN=no sandbox
MODEL_SCREEN=Auto
GEMINI_MD_COUNT_SCREEN=1
MCP_SERVER_COUNT_SCREEN=1
SKILLS_COUNT_SCREEN=871
```

Classificação correta:

```text
SOURCE=HUMAN_SCREEN_EVIDENCE
STATUS=OBSERVED
RUNTIME_GLOBAL_PASS=false
MCP_SERVER_IDENTITY=UNKNOWN_UNTIL_CONFIG_READ
SKILLS_PROVENANCE=UNKNOWN_UNTIL_INVENTORY
```

A tela demonstra que o Gemini CLI reconheceu contexto/skills/MCP naquela sessão. Ela **não** prova que o único MCP listado é o CentralDark, nem que as 871 skills pertencem ao repo canônico, nem que qualquer uma foi executada.

### Risco importante observado

A mesma tela mostra `branch=main` e `sandbox=no sandbox`.

```text
GEMINI_CLI_ON_MAIN_MAY_READ=true
GEMINI_CLI_ON_MAIN_MAY_MUTATE=false  # salvo handoff/owner autorizado e política aplicável
NO_SANDBOX_DOES_NOT_GRANT_WRITE_AUTHORITY=true
ACTIVE_PR_WRITER_SCOPE_MUST_WIN=true
```

Enquanto o escopo ativo for PR #1381, mutação material deve permanecer no branch/worktree do Writer do PR; abrir uma CLI em `main` não muda a lei `NO_DIRECT_MAIN_WRITE`.

## 4. Gemini CLI / Antigravity — compatibilidade física, não troca de identidade

Documentação oficial observada em 2026-09-02:

- Gemini CLI usa `GEMINI.md` como contexto hierárquico e permite `/memory reload` para recarregar o contexto.
- MCP é configurado em `~/.gemini/settings.json` ou `.gemini/settings.json`, via `mcpServers`/configuração MCP.
- Para contas consumidoras/Individuals, o fluxo Google de Gemini Code Assist/Gemini CLI foi descontinuado em 2026-06-18; a rota de migração indicada pela Google é Antigravity. Standard/Enterprise não entram nessa mesma descontinuação.
- Antigravity preserva/importa constructs de Gemini CLI, incluindo skills e MCP, mas isso é migração de superfície/engine, não nova CentralDark.

Cristalização:

```text
GEMINI_MD_IS_VALID_BRIDGE=true
CENTRALDARK_CORE_REMAINS_OWNER=true
ANTIGRAVITY_CAN_BE_ENGINE_SURFACE=true
ANTIGRAVITY_MIGRATION != CENTRALDARK_MIGRATION
AUTH_PROVIDER_CHANGE != IDENTITY_CHANGE
```

## 5. Gemini Code Assist / Gemini CLI Companion no VS Code

Capturas mostram extensões/integrações Gemini no VS Code, incluindo uma superfície oficial Google e uma extensão `Gemini Code Assist` marcada como desabilitada globalmente naquela tela.

Essas extensões podem ser úteis como **UX/IDE bridge**, mas não são necessárias para a governança CentralDark existir.

```text
IDE_EXTENSION = OPTIONAL_SURFACE
IDE_EXTENSION != CORE
IDE_EXTENSION != WRITER
IDE_EXTENSION != MCP_AUTHORITY
DISABLED_GLOBALLY_SCREEN = OBSERVED_STATE_ONLY
```

Regra de seleção:

```text
SE_EXISTING_HERMES_OR_GEMINI_CLI_ALREADY_DELIVERS_CAPABILITY
→ DO_NOT_INSTALL_DUPLICATE_BRIDGE_BY_DEFAULT

SE_IDE_BRIDGE_ADDS_UNIQUE_PROVEN_DELTA
→ CATALOGUE
→ OWNER_MATCH
→ MATERIALIZE_ON_DEMAND
→ TEST
→ KEEP_ONLY_IF_USEFUL
```

## 6. Dev Containers — o catálogo gigante não é instalação

O arquivo/catálogo observado nesta sessão lista grande quantidade de `devcontainer-features`, incluindo opções relacionadas a `gemini-cli`, `claude-code`, `mcp-inspector`, `mistral-dev`, `antigravity-cli` e centenas de outras capabilities.

Isso prova apenas **catálogo/disponibilidade de templates**.

```text
DEVCONTAINER_FEATURE_LIST = CATALOG_OBSERVED
CATALOG_ENTRY != INSTALLED
CATALOG_ENTRY != SELECTED
CATALOG_ENTRY != REQUIRED
IMPORT_ALL_FEATURES=false
```

Não foi localizado owner canônico de Dev Container no `main` durante esta reconciliação. Portanto, pela `CAPABILITY-READINESS-POLICY`, não criar `.devcontainer/` apenas porque o menu oferece centenas de opções.

Dev Container só entra quando houver necessidade real de reproduzir ambiente isolado/portável e existir seleção mínima suficiente:

```text
CURRENT_INTENT_REQUIRES_CONTAINER
+ OWNER_RESOLVED
+ MINIMUM_SUFFICIENT_FEATURE_SET
+ RESOURCE_BUDGET_OK
+ SECRET_BOUNDARY_DEFINED
+ TEST/ROLLBACK_DEFINED
→ CANDIDATE
```

## 7. Descoberta crítica: `mcp_config.json` aberto é fixture de teste

A captura mostra o arquivo aberto em caminho semelhante a:

```text
E:\CentralDark\workspace\sol\01-FONTES\APPCENTRALDARK-EVOLUIR\sidecar\node_modules\@overclock-app\catalog\test\fixtures\catalog-home\.gemini\config\mcp_config.json
```

O conteúdo visível usa valor de fixture como:

```text
SUPABASE_KEY=fixture-supabase-secret-value
```

Esse arquivo está sob `node_modules/.../test/fixtures/...` e deve ser tratado como **fixture de catálogo/teste**, não como configuração viva do Gemini/CentralDark.

```text
NODE_MODULES_TEST_FIXTURE != RUNTIME_CONFIG
FIXTURE_SECRET_VALUE != REAL_CREDENTIAL
DO_NOT_COPY_FIXTURE_TO_ACTIVE_GEMINI_CONFIG=true
DO_NOT_CRYSTALLIZE_FIXTURE_AS_MCP_OWNER=true
```

Config ativa deve ser localizada pela superfície real (`~/.gemini/settings.json`, `.gemini/settings.json`, perfil Antigravity/MCP aplicável ou owner CentralDark existente) e medida antes de qualquer mutação.

## 8. Decisão mínima — o que usar agora

```text
USE:
  - GEMINI.md fino do repo
  - LEIA-ME-IA.md como porta/core
  - CentralDark/Hermes/DarkAI como owner unificado
  - MCP CentralDark real quando identidade/config for medida
  - Gemini CLI ou Antigravity como engine/surface substituível

USE_ON_DEMAND:
  - extensão IDE oficial/companion quando adicionar UX única
  - Dev Container mínimo quando isolamento/reprodutibilidade forem requisito real

DO_NOT_USE_AS_AUTHORITY:
  - catálogo de centenas de Dev Container features
  - mcp_config.json dentro de node_modules/test/fixtures
  - contagem visual de skills como prova de execução
  - branch main local como Writer do PR ativo
```

## 9. Evidence envelope desta rodada

```text
PR_REMEASURE_T0_HEAD=496ba01bf91e4eced6f9a895eb60eb77a17aee10
PR_STATE=OPEN
PR_MERGED=false
PR_MERGEABLE=false
BASE_HEAD=0542cee586e55be5334ba1e8d369d3b040ee1178
AHEAD_OF_MAIN_T0=74
BEHIND_MAIN_T0=58
CI_STATUSES_T0=0
PR_WORKFLOW_RUNS_T0=0
CI_SAME_HEAD_T0=UNKNOWN
```

Materiais locais recebidos nesta rodada, usados apenas como provenance/evidência de tela/catálogo:

```text
Texto colado(20260902-222319).txt
SHA256=706635aca1365a06bd853d15cd857fd09ed85ce2a37a276380b509024c100c8e
SIZE=75109

workspaceFileList.bin
SHA256=3c26d72c36f46d6486ae4cfcb75c8d9062d98f13e6c8a2145a605ba57f06a848
SIZE=6214517

640f37c9-e0d9-4382-ac3d-ce01316ebd33.png
SHA256=e2336078bd38c817efe3559c32f8cde2fef16609640b30ab66142866213006a1

f754cad8-a12a-42b5-aad8-5625bbbc9796.png
SHA256=49c30e0151940ed33f60700a8479cd77f0d1473630f204e125af2b5f92eba807

8c1e1357-a5e3-43e2-8892-2cecfb668796.png
SHA256=375485ef94f946e9b544c6e273c43595eb479f4e9900c9281e0bab0fe497ba3f

97d65e60-86bf-403b-a1c7-4c44c6809e76.png
SHA256=1c23f8a61feabd3b4123a5532cb6b9491dcc3c51777dac16188545a995b99c22

2bf9e446-0bcb-442c-8096-c59b419390cd.png
SHA256=2479c8df6ba84bd855599b79e1a66af7fb4aa12661feb58947f8870b03003bd2
```

## 10. Fixed-point boundary

Este receipt cristaliza a **decisão e o mapa de owner**, não prova o runtime local da Casa.

```text
STATIC_RECONCILIATION=PASS
GEMINI_CLI_SCREEN_OBSERVATION=OBSERVED
CENTRALDARK_MCP_IDENTITY_IN_GEMINI=UNKNOWN
DEVCONTAINER_REQUIRED=NOT_PROVEN
IDE_EXTENSION_REQUIRED=NOT_PROVEN
GEMINI_OR_ANTIGRAVITY_ENGINE_RUNTIME_T1=UNKNOWN
GLOBAL_FIXED_POINT=NOT_PROVEN
```

Próximo cursor aplicável: medir a configuração ativa do Gemini/Antigravity e confirmar qual MCP está conectado; depois testar um percurso read-only pelo `GEMINI.md → LEIA-ME-IA.md → MCP/owner` sem escrever em `main`.

## 11. Delta útil novo — Gemini CLI Companion oficial

A nova captura do CHEFE mostra especificamente `Gemini CLI Companion`, publicado por **Google** e marcado como publisher verificado no Marketplace, com a descrição: permitir ao Gemini CLI acesso direto ao workspace da IDE.

A fonte oficial do projeto confirma que o Companion não é apenas um launcher visual: ele funciona como ponte local entre Gemini CLI e VS Code, com servidor IDE local, acesso ao workspace, acompanhamento dos arquivos abertos e visualização/aplicação de diffs.

```text
CAPABILITY=IDE_WORKSPACE_BRIDGE
PROVIDER=GOOGLE_GEMINI_CLI_COMPANION
CLASSIFICATION=OFFICIAL_OPTIONAL_IDE_BRIDGE
UNIQUE_DELTA:
  - DIRECT_IDE_WORKSPACE_ACCESS
  - OPEN_FILES_CONTEXT
  - DIFF_VIEW_AND_APPLICATION
  - LOCAL_IDE_SERVER_BRIDGE
CORE_OWNER_REMAINS=CENTRALDARK
WRITER_AUTHORITY_GRANTED=false
```

Isto **tem valor real para a CentralDark** porque reduz a distância física entre o motor Gemini e o mesmo workspace já governado por `GEMINI.md → LEIA-ME-IA.md`; porém a extensão continua sendo braço físico, não fonte da verdade.

Regra generalizável extraída da tela:

```text
WHEN_EQUIVALENT_CAPABILITIES_EXIST:
  1. REUSE_ALREADY_ACTIVE_CAPABILITY
  2. PREFER_OFFICIAL_VERIFIED_BRIDGE_WHEN_FUNCTIONALLY_EQUIVALENT
  3. SELECT_THIRD_PARTY_ONLY_FOR_UNIQUE_PROVEN_DELTA
  4. DO_NOT_INSTALL_MULTIPLE_OVERLAPPING_BRIDGES_BY_DEFAULT
  5. EXTENSION_REPUTATION_DOES_NOT_REPLACE_RUNTIME_TEST
```

Na mesma busca visual aparecem `Gemini CLI Launcher`, `Bob AI CLI`, `Antigravity for VS Code` e `Gemini CLI Chat`. Nesta rodada eles ficam apenas como `CATALOGUED_CANDIDATE`: presença no Marketplace não prova necessidade nem superioridade.

```text
OFFICIAL_GEMINI_CLI_COMPANION=USEFUL_CANDIDATE
THIRD_PARTY_OVERLAP=CATALOGUED_ONLY
INSTALL_ALL=false
ENABLE_ALL=false
RUNTIME_T1=UNKNOWN
```

Esta regra preserva `MENOS_E_MAIS`: um bridge oficial suficiente vence cinco extensões sobrepostas, salvo evidência de capacidade única que justifique outra.
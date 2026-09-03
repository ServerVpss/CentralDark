# Receipt — Claude Desktop, Screenpipe, skins e falso-verde

Data: 2026-09-03
Escopo: PR #1381 / `feat/fixed-point-fabric-proof-20260831`
Owner lógico: CentralDark Operational Method + owners existentes aplicáveis

## Intenção

Absorver somente delta útil e reconstruível observado na sessão, sem criar segunda arquitetura, sem copiar implementação proprietária de produto externo e sem converter texto/simulação em prova de runtime.

## T0 remoto medido antes deste receipt

```text
PR=1381
STATE=OPEN
MERGED=false
MERGEABLE=false
HEAD=d2df622dba5a0e1b0e79a825228746e77d81597b
BASE=main
BASE_SHA=0542cee586e55be5334ba1e8d369d3b040ee1178
COMBINED_STATUSES=[]
PR_WORKFLOW_RUNS_SAME_HEAD=[]
CI_SAME_HEAD=UNKNOWN
GLOBAL_FIXED_POINT=NOT_PROVEN
```

O HUD textual de qualquer agente não substitui essa medição.

## 1. Claude Desktop — minério arquitetural, não cópia

Artefato observado pelo CHEFE: HTML do `main_window/index.html` empacotado no Claude Desktop para Windows.

Proveniência do artefato fornecido na sessão:

```text
SHA256=dbc37e7f35fad43ef95ce3b482cad4c440c876d80470e069db9656e150964836
BYTES=11621
LINES=329
```

O arquivo observado contém shell de primeiro frame/boot e referências para chunks posteriores. O delta reutilizável é o padrão, não os bytes do produto externo:

```text
FIRST_FRAME_BOOT_SHELL
THEME_BEFORE_MAIN_RENDERER
PLACEHOLDER_BEFORE_HYDRATION
RESPONSIVE_BOOT_PLACEHOLDER
MODULE_PRELOAD
LAZY_MAIN_WINDOW_RENDERER
SINGLE_RENDER_ROOT
LOAD_FAILURE_BOUNDARY
```

Owner existente para implementação equivalente CentralDark:

```text
apps/modulos/Bolt/
apps/modulos/Bolt/source/electron/main/ui/window.ts
apps/modulos/Bolt/source/electron/main/index.ts
```

Invariantes:

```text
EXTERNAL_BINARY_OR_BUNDLE=REFERENCE_ONLY
COPY_PROPRIETARY_IMPLEMENTATION=false
CLEAN_ROOM_REIMPLEMENT_PATTERN=true
REUSE_EXISTING_BOLT_OWNER=true
NO_SECOND_DESKTOP_ARCHITECTURE=true
```

## 2. Screenpipe — por que parece se atualizar/materializar sozinho

O repositório já registra uso de `screenpipe-mcp@latest` via Bun/Bunx. A própria assinatura `@latest` pede resolução da versão corrente e o Bunx materializa dependências temporárias/cache para executar o pacote.

Logo, quando um cliente MCP/Claude reinicia, reconecta ou executa o adaptador, diretórios/arquivos de pacote podem reaparecer ou mudar sem significar que o aplicativo nativo inteiro fez um auto-update.

```text
MCP_BOOTSTRAP_WITH_AT_LATEST
→ PACKAGE_RESOLUTION
→ DOWNLOAD/EXTRACTION_WHEN_NEEDED
→ TEMP_OR_CACHE_MATERIALIZATION
→ MCP_PROCESS
```

Classificação:

```text
SCREENPIPE_MCP_PACKAGE_REFRESH=PLAUSIBLE_AND_REPO_SUPPORTED
SCREENPIPE_NATIVE_APP_SELF_UPDATE_FROM_THIS_EVIDENCE=UNKNOWN
CACHE_MATERIALIZATION != NATIVE_APP_UPDATE
FILES_REAPPEAR != RESTORED_OLD_INSTALL
```

Owner existente: documentação/skills Screenpipe e integração MCP já existentes. Não criar updater paralelo.

## 3. Skin / perfil do Hermes

A sessão mostra Ares/Hermes expondo várias skills e mudando modo de operação conforme o contexto. Porém, no remoto medido deste PR não foi localizado artefato por nome `charizard` ou `skin` que prove implementação canônica específica da skin Charizard.

Portanto:

```text
SKIN_AS_BEHAVIORAL_SCAFFOLD=CANDIDATE_PATTERN
CHARIZARD_REMOTE_IMPLEMENTATION=UNKNOWN
SKIN != IDENTITY
SKIN != AUTHORITY
SKIN != PROVIDER
CANONICAL_CORE_OVERRIDES_SKIN=true
```

Se/ quando o artefato local da skin for ingerido, PEGATUDO deve extrair somente capacidade útil, proveniência e efeito testável; a autoridade continua SEGREDO/CHEFE e a SOL permanece única.

## 4. Contraprova crítica — simulação não pode declarar Fixed Point

Na tela da sessão, o agente imprime explicitamente:

```text
Simulando ações de registro (na prática, estas seriam comandos reais)
```

Depois a mesma saída textual anuncia estado final de Fixed Point/REGISTRA/BOOT. Como as ações foram simuladas/echoadas, essa conclusão não é prova de execução.

Travas obrigatórias:

```text
SIMULATED_REGISTER != REGISTERED
ECHOED_COMMAND != EXECUTED_COMMAND
ECHOED_STATUS != LIVE_STATE
PRINTED_SHA != VERIFIED_OBJECT
PRINTED_FIXED_POINT != FIXED_POINT
BOOT_TEXT != BOOT_EXECUTED
CI_QUEUED_TEXT != CI_RUN
CI_SAME_HEAD_REQUIRES_GITHUB_EVIDENCE=true
GLOBAL_FIXED_POINT_REQUIRES_REALITY_JUDGE=true
```

Se uma simulação disser PASS enquanto o GitHub vivo não possui proof do mesmo HEAD, prevalece o estado vivo e o resultado continua `UNKNOWN`/`NOT_PROVEN`.

## 5. Provider específico não condena o organismo

A tela também mostra uma chamada Gemini recusada por credencial inválida enquanto outros providers permanecem selecionáveis.

```text
GEMINI_API_KEY_INVALID=PROVIDER_SPECIFIC_FAILURE
PROVIDER_SPECIFIC_FAILURE != CENTRALDARK_GLOBAL_FAILURE
FALLBACK_MAY_CONTINUE_ONLY_IF_REAL_AND_TESTED
MODEL_PICKER_VISIBLE != PROVIDER_HEALTH_PROVEN
```

## 6. MCP account dialog

A mensagem visual `This account has not been used by any MCP servers.` descreve o estado daquele account/integração na superfície observada. Não prova falha global do MCP.

```text
ACCOUNT_HAS_NO_MCP_USAGE != MCP_GLOBAL_FAILURE
CONFIG_PRESENT != CONNECTION_PROVEN
CONNECTION_REQUIRES_RUNTIME_TEST=true
```

## 7. Rota canônica do delta

```text
!CENTRALDARK
→ !tlc23
→ #ACORDAR
→ PEGATUDO
→ METACOGNICAO / KNOWLEDGE-COMPILER
→ DEDUPE
→ OWNER EXISTENTE
→ PATCH CLEAN-ROOM QUANDO APLICAVEL
→ TESTE
→ CONTRAPROVA
→ CI SAME HEAD
→ REALITY JUDGE
→ FIXED_POINT
→ !tlc23
→ REGISTRA
→ HANDOFF
→ BOOT
```

## Próximo cursor

1. Reconciliar este commit com qualquer writer local antes de force-push/rebase final.
2. Quando o writer do Bolt estiver livre, avaliar patch mínimo de first-frame shell por implementação original CentralDark.
3. Medir o processo/versão/cache do Screenpipe para distinguir refresh de `screenpipe-mcp@latest` de auto-update do app nativo.
4. Ingerir a skill/skin local real se ela for fornecida; até lá Charizard permanece `UNKNOWN` no remoto.
5. Nunca promover saída simulada/echo para `PROVEN`.

```text
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
UNKNOWN_IS_NOT_PASS=true
DOCUMENTED_IS_NOT_EXECUTED=true
SIMULATION_IS_NOT_RUNTIME_PROOF=true
```

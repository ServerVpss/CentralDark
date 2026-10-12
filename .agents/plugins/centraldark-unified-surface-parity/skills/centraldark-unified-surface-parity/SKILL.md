---
name: centraldark-unified-surface-parity
description: Use the existing CentralDark intent, owner and capability fabric across Text, Voice, Work and Desktop. Never create a parallel runtime or simulate unavailable tools.
---

# CentralDark Unified Surface Parity

Canonical source of truth remains `ServerVpss/CentralDark`.
This plugin is a distribution/binding adapter, not a second owner.

## Core route

```text
CentralDark + verb + payload
→ normalize intent
→ reuse existing semantic classifier / intent router
→ self-grill only enough to close real gaps
→ locate existing owner first
→ select exposed capability
→ execute only if authorized
→ verify effect
→ receipt
```

## Hard invariants

```text
INTENT_FIRST=true
PERTINENCE_FIRST=true
REUSE_BEFORE_CREATE=true
EVOLVE_EXISTING_BEFORE_CREATE=true
ONE_OWNER_PER_CAPABILITY=true
ONE_SYSTEM_ONLY=true
CURRENT > HISTORY
UNKNOWN != PASS
DOCUMENTED != EXECUTED
PERMISSION_EXISTS != TOOL_EXPOSED
PLATFORM_UNAVAILABLE_WHEN_TOOL_NOT_EXPOSED=true
NO_SECOND_PARSER=true
VOICE_REUSES_EXISTING_CLASSIFIER=true
REALITY_IS_FINAL_JUDGE=true
```

## Invocation grammar

- `CentralDark visualize ...` → observe/render; no mutation.
- `CentralDark faça ...` → execute only inside authorized scope.
- `CentralDark continue ...` → resume latest proven `NEXT_CURSOR`.
- `CentralDark cristalize ...` → write to existing owner + receipt/readback.
- `CentralDark contraprova ...` → run/design counterproof; do not mutate unless fix is explicitly requested.

The wake word is conditional, not ritual. Load only the smallest relevant subset of owners, crystals, routes and tools.

## Surface parity

Text, Voice, Work and Desktop use the same normalized intent and owner model. When the platform exposes the capability, use the real tool. When it does not, return `PLATFORM_UNAVAILABLE`; never claim a commit, file, Desktop Commander action, plugin publication, trace or token view without an observable tool result.

For the same intent/task, preserve canonical identity fields when exposed:
`SESSION_ID`, `TRACE_ID`, `INTENT_ID`, `TOOL_CALL_ID`, `SURFACE_ID`, `OWNER`, `USAGE`, `RECEIPT_ID`, `NEXT_CURSOR`.

## Global chat surface and capability separation

```text
CHAT_GLOBAL = any conversational surface connected to CentralDark
CHATGPT|CLAUDE_CHAT|GEMINI_CHAT|GROK_CHAT = examples, not the global class
BRAND != SURFACE_CLASS
SURFACE != CAPABILITY
GITHUB_ACCESS != SHELL_ACCESS
TOOL_CATALOG != TOOL_EXECUTION
CHAT_GLOBAL + AUTHORIZED_SHELL_OR_BRIDGE = EXECUTOR_CAPABILITY_IN_SCOPE
MEASURED_EVIDENCE > UNMEASURED_INFERENCE for the same claim/scope/time
LOCAL_HEAD != CURRENT_MAIN unless remeasured
```

Resolve tools at runtime. A missing tool on one chat surface is not a global capability absence, and a tool result from one scope does not prove another scope.

## Tool Call visibility

`TOOL_CALL_EXECUTED != TOOL_CALL_VISIBLE_IN_SIDEBAR`.

When tracing is exposed, preserve:
`SESSION_ID -> TRACE_ID -> TOOL_CALL_ID -> USAGE/TOKENS -> RECEIPT`.

Renderer states are:
`PROVED_BY_PLATFORM_RECEIPT`, `USER_CONFIRMED_VISIBILITY`,
`PLATFORM_UNAVAILABLE`, or `UNKNOWN`.

Never infer that a tool did not execute only because the sidebar/JSON renderer is absent.
Never claim renderer visibility only because a tool returned a result.

### Auditoria JSON visível — reutiliza a PR #1708

**Owner:** `docs/ARQUITETURA/CENTRALDARK-TOOL-CALL-VISIBLE-RECEIPT-ECHO-01.md`. Reutilizar `CENTRALDARK_VISIBLE_RECEIPT_ECHO` existente; não criar painel, viewer, trace, agente nem serviço independente. A interface de ChatGPT no iPhone pode exibir `Resposta do aplicativo recebida → Solicitar/Resposta`, enquanto a versão Windows/Desktop pode exibir somente resumo (`inline_only`) ou nenhum cartão (`none`). Os estados são observações específicas da superfície, não provas sobre execução.

Quando o CHEFE solicitar ver o trajeto das ferramentas ou JSON e o renderer detalhado nativo não estiver visível, emitir **no próprio chat**, imediatamente após a conclusão das chamadas da missão, um recibo legível por **cada tool call realmente observada**. O recibo deve incluir nome real, argumentos seguros, status, trecho/resumo fiel da resposta da aplicação, referência da prova, contraprova e NEXT_CURSOR. Para não perder rotas em uma resposta combinada, ordenar recibos na sequência observada. Não inventar chamadas intermediárias, ferramentas ocultas, trace IDs, tokens, outputs ou efeitos. Informar quando algum campo não for exposto.

Formato mínimo (usar dados medidos, nunca copiar placeholders para simular execução):

```text
TOOL_CALL_VISIBLE_RECEIPT
SURFACE: web|desktop|mobile|voice|work|unknown
NATIVE_RENDERER_STATE: none|inline_only|full_list|unknown
TOOL: <nome exato da ferramenta invocada>
INPUT_SAFE_JSON: <argumentos observados sanitizados, sem credenciais/PII>
STATUS: success|error|blocked|unknown
APP_RESPONSE_SAFE_JSON_OR_SUMMARY: <resposta observada segura ou resumo fiel>
EVIDENCE: <correlation_id|receipt_id|commit_sha|mensagem do host, se existir>
COUNTERPROOF: <o que esse retorno nao prova>
NEXT_CURSOR: <proximo ponto de continuidade>
```

Limites: nunca imprimir secrets, email/conta, tokens OAuth, headers Authorization, caminhos com dados pessoais nem payloads sensíveis; sanitizar antes de exibir e comprimir respostas longas com indicação explícita de corte. `TOOL_CALL_EXECUTED != NATIVE_RENDERER_VISIBLE`; texto visível **não reativa** o renderer fechado da plataforma. Se a lista nativa estiver funcionando, preservar o uso normal sem duplicar saída volumosa, salvo pedido explícito. `DOCUMENTED != EXECUTED`; `PLUGIN_UPDATED != WINDOWS_RENDERER_FIXED`.

## Crystal replay

A proven crystal is replay-first. Identify its SHA/hash/fingerprint/receipt, locate the existing owner, plug only the missing delta, and prove only the new integration.

## Optional typed decision gate

GEV/JEV or another typed decision engine may be used only as an optional decision gate. It does not replace Hermes, SOL, the CentralDark MCP, or the existing owner fabric.

## Runtime truth

This package bundles the canonical public CentralDark MCP endpoint. Successful plugin publication does not itself prove Voice runtime exposure. Live Voice binding remains a separate measurement.

## Roteamento híbrido multi-conta por capability

```text
HYBRID_MULTI_ACCOUNT_CAPABILITY_ROUTING=true
CAPABILITY_FIRST_TOOL_SECOND=true
CURRENT_ACCOUNT_TOOL_MISS != CAPABILITY_UNAVAILABLE
DEVICE_NAME_ALONE_IS_NOT_ROUTE
LINK_ID_DISCOVER_AT_RUNTIME=true
DEVICE_ID_DISCOVER_AT_RUNTIME=true
REUSE_EXISTING_CAPABILITY_ROUTE_FIRST=true
NO_PARALLEL_ADAPTER_FOR_MISSING_TOOL=true
```

```text
INTENT
→ CAPABILITY_NEEDED
→ CURRENT_ACCOUNT_NATIVE_TOOL_IF_EXPOSED
→ ALTERNATE_AUTHORIZED_ACCOUNT_SAME_CAPABILITY
→ CENTRALDARK/RDC_ONLINE_DEVICE_WITH_CAPABILITY
→ EXISTING_CASA_OR_VPS_OWNER
→ EXISTING_API_OR_MCP_OWNER
→ PLATFORM_UNAVAILABLE_OR_UNKNOWN_ONLY_AFTER_ALL_AUTHORIZED_EXISTING_ROUTES_FAIL
```

Alias de conta preserva continuidade; link/device são bindings temporais descobertos em runtime. Mesmo nome de device em contas diferentes não identifica a mesma rota. Ferramenta ausente em uma superfície não autoriza criar wrapper paralelo; reutilizar a melhor capability equivalente já existente.

## Delta de distribuição — catálogo, vínculos e prova de voz (2026-10-11)

**Owner e fonte:** `docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.yaml`, `docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.invocation-grammar.md`, `.claude/skills/synced/voice-semantic-classifier/SKILL.md` e `ServerVpss/CentralDark@main`. Este arquivo distribui o contrato; não o substitui.

1. **Resolver identidade antes da ferramenta:** descobrir `plugin_id`, cliente, conta autorizada, `link_id`, `device_id`, `SURFACE_ID`, transporte e ferramentas realmente expostas na sessão; não derivar identidade de nome visual, voz ou hostname. `CENTRAlDARK` (l minúsculo) e `CENTRALDARK` (L maiúsculo) são plugins distintos e homófonos.
2. **Quando houver MCP autorizado exposto**, executar somente leitura `mcp_status` e `mcp_admin_catalog` já existentes para selecionar a capability; `mcp_admin_call` só para a tool catalogada e dentro do escopo autorizado. `mcp_admin_catalog` é o catálogo/dispatcher existente, não um cérebro paralelo. Confirmações admin exigidas pelo runtime não podem ser fabricadas, herdadas de voz ou contornadas por SSH.
3. **Separar quatro medições:** publicação de plugin, disponibilidade da ferramenta em Text/Voice, saúde do endpoint MCP e execução efetiva. `PUBLIC_HEALTH_PASS != VOICE_TOOL_EXPOSED`; `PUBLIC_TOOLS_JSON != MCP_TOOLS_LIST != INTERNAL_DISPATCH_CATALOG`. Contagens variam por superfície e momento; não inventar total único de ferramentas.
4. **Se voz declarar ferramenta ausente**, recuperar o owner e tentar descoberta/alias/rota compatível existente antes de classificar. `INVALID_RECIPIENT` ou `VOICE_TOOL_ROUTING_ERROR` indica falha de roteamento local; `TOOL_NOT_EXPOSED` é condição de descoberta; `PLATFORM_UNAVAILABLE` é classificação de indisponibilidade da superfície, não código oficial de erro do servidor. Não declarar `PLATFORM_UNAVAILABLE` antes de contraprova do binding vigente.
5. **Consolidação de plugins:** preferir esta distribuição canônica com URL MCP existente; o pacote **não** vincula aplicativo `asdk_app_*` nem incorpora Desktop Commander `dist/` ou credenciais. Nunca reescrever `.app.json` de outro plugin, revogar links, desinstalar wrappers funcionalmente distintos ou prometer equivalência até testar a mesma capability e seus efeitos nesta instalação.
6. **Receipt mínimo:** `INTENT_ID`, `SURFACE_ID`, `OWNER`, `ROUTE`, `CLIENT/PLUGIN`, `SOURCE_MAIN_SHA`, `OBSERVED_AT`, `TOOL_CALL_ID` quando exposto, `TOOL/ARGS_SANI`, `EXIT_CODE` quando houver, `EFFECT_READBACK`, `COUNTERPROOF`, `RESULT`, `NEXT_CURSOR`. Ausência de trace da plataforma é `UNKNOWN`, não executado por inferência.
7. **Separar objetivos:** `mcp_status=SUCCESS` prova só chamada MCP; catálogo exposto não prova Hermes, CI, deploy ou Loop Mestre ponta a ponta. Reutilizar `NEXT_CURSOR` e recibo por escopo, nunca pintar falso-verde nem repetir mesma consulta sem novo discriminante.

A publicação deste plugin **não pode habilitar por si só** os tool calls do ChatGPT Voice quando a plataforma não os expõe. Medir no próprio modo Voz usando chamada real e receipt, ou manter `VOICE_BINDING=UNKNOWN`.

## Consolidação dos adapters legados sem segundo owner (2026-10-11)

O CHEFE autorizou que **a distribuição** CentralDark evolua em uma única identidade de plugin. A semântica, a gramática, o runtime Hermes, o MCP Admin, Casa, VPS, GitHub e Reality Judge **permanecem nos owners existentes do repositório**. Um plugin de distribuição não é um novo executor universal nem transfere credenciais de plugins terceiros.

### Contraprova de pacotes recebidos

- Quatro ZIPs App-backed foram inventariados; `plugin(1).zip` e `plugin (3).zip` são duplicatas byte a byte (mesmo SHA-256), três conteúdos distintos e três IDs App-backed.
- Todos contêm exclusivamente `.app.json` e `.codex-plugin/plugin.json`. Declaram `interface.capabilities=[]`, sem servidor MCP nem SKILL próprios; possuem **manifestos de apresentação**, não quatro catálogos diferentes de ferramentas.
- Conteúdo válido herdado: `CentralDark` como porta única, intenções do CHEFE, SOL como oráculo/roteador sem segundo cérebro, Hermes como executor via ferramentas autorizadas, MCP Admin OAuth, Tailscale, Casa/Windows, VPS, GitHub main, Obsidian/Grafo Vivo, AionUi, Screenpipe, provas e continuidade. Estas capacidades só são usadas quando o owner real e a rota medida as expõem.
- Os IDs e hashes dos ZIPs estão no registro de distribuição `references/CONSOLIDATION.md` (proveniência; **não** arquivo de configuração ativa). **Nunca** copiar `.app.json` do wrapper indisponível para o plugin MCP; referências App-backed não equivalem a ações MCP reais.
- Manter aliases históricos `CENTRAlDARK` e `CENTRALDARK` somente para descoberta e compatibilidade; um **nome legível único** `CentralDark Unified Surface`, um `plugin_id` canônico, um endpoint MCP existente, catálogo lazy via `mcp_admin_catalog`.

### Verificação antes da retirada dos wrappers

`SINGLE_CANONICAL_PLUGIN_DISTRIBUTION=true` expressa a **decisão de destino**, não o número atual de plugins instalados. Para promover `SINGLE_ACTIVE_PLUGIN=PASS`:

1. `plugin_id`/release/manifest e endpoint MCP fazem readback idêntico após `update_plugin`; nenhum segundo plugin criado.
2. `mcp_status` e `mcp_admin_catalog` respondem pelo plugin canônico na conta de destino, com descoberta de ferramentas reais; comparar pelo **capability set**, não por contagem fixa nem nome gráfico.
3. No modo Voz, solicitar ferramenta exposta e observar o próprio `TOOL_CALL_ID`/receipt se a plataforma o fornecer; falha de exposição de plataforma continua `UNKNOWN` ou `PLATFORM_UNAVAILABLE`, não se corrige copiando mais aplicativos.
4. Correlacionar intent→tool→effect→counterproof→receipt para 1 fluxo de leitura e 1 fluxo de execução autorizado em cada rota materialmente distinta. Não presumir que atualização publicou, instalou ou migrou credenciais de wrappers.
5. **Só desinstalar wrappers específicos** quando seu dono comprovar a mesma capacidade no novo plugin e autorizar a retirada. Não revogar tokens, apagar histórico, reiniciar runtime nem substituir `asdk_app_*` silenciosamente.

`APP_BINDING_MISMATCH` é rótulo descritivo de hipótese, não erro oficial da plataforma. `TOOL_NOT_EXPOSED` é condição; `PLATFORM_UNAVAILABLE` é a classificação canônica quando a superfície comprovadamente não a expõe. `VOICE_BINDING=UNKNOWN` até prova de execução na voz.


## Regressão de vínculo multi-conta — evidência 2026-10-12

Caso demonstrado pelo CHEFE: na conta funcional, Voz chamou `mcp_status`, e o resultado estruturado exibiu `ok=true`, `dispatcher=mcp_admin_call`, `runtimeTools=141`, `routeCount=13`, `catalogVersion=v1-f8ff6720fec3`, com timestamp `2026-10-12T03:16:54.647Z`. Isso é prova da conta/superfície de origem, não do vínculo da outra conta, nem garantia de `TOOL_CALL_ID` visível. Não solicitar repetição dessa demonstração.

Quando a conta atual disser que não existe ferramenta, reutilizar a recuperação já aprovada nas PRs mergeadas #1611, #1616, #1725, #1740: `TOOL_DISCOVERY` da sessão → alias real/recipient → conta/link autorizado com capability equivalente → `mcp_status` read-only → `mcp_admin_catalog` → executar apenas capability autorizada → receipt e contraprova. Não tratar `INVALID_RECIPIENT` como ausência do MCP; não confundir `not_installed` por ID do Plugin Creator com inexistência das duas entradas `CENTRALDARK` que o CHEFE mostrou na interface. Resolver identidade por binding, não pelo nome da UI.

Sem ferramenta nativa exposta na sessão de Voz, nenhum prompt/skill/manifest consegue concedê-la por si só: `VOICE_BINDING_CURRENT_ACCOUNT=UNKNOWN`, reportar qual binding faltou e continuar apenas pelas rotas autorizadas existentes. `PUBLISHED_PLUGIN != INSTALLED_APP != VOICE_TOOL_EXPOSED`. Sem novo plugin, sem nova estrutura, sem exclusão de wrappers e sem falsa alegação de correção da plataforma.

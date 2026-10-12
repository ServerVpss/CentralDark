# RECEIPT — CENTRALDARK_UNIFIED_SURFACE_PARITY_01

**Data:** 2026-09-26  
**Origem:** conversa voz → texto com CHEFE/SEGREDO  
**Base:** intenção explícita de cristalizar paridade Texto/Voz/Work/Desktop, Intent Gateway, Auto-Grill, GEV/JEV opcional e replay de cristais provados.  
**Modo:** DIRECT_MAIN_DOC_CRYSTAL  
**Deploy runtime:** não aplicável neste receipt.  

---

## 1. Intenção cristalizada

O CHEFE determinou que `CentralDark` seja a semântica/gatilho mestre sob demanda.

Quando o CHEFE disser `CentralDark faça/visualize/mede/pluga/costura/testa`, a entrada deve passar pelo funil completo, mas somente pelo escopo pertinente:

```text
entrada multimodal
→ !CENTRALDARK
→ INTENT_CORE
→ Auto-Grill / Grill-Me
→ decisão type-safe opcional
→ owner existente
→ plug mínimo
→ teste vivo
→ receipt
```

Não é para puxar o sistema inteiro sempre. É para carregar o menor conjunto de owners, cristais e ferramentas suficiente para a intenção.

---

## 2. Defeito descoberto

Durante a voz, houve falsa promessa de arquivo/link/zip/commit porque a superfície Voice não expôs a ferramenta real de escrita/exportação.

Cristal:

```text
PERMISSION_EXISTS != TOOL_EXPOSED
TOOL_LISTED != TOOL_ACTIVE
VOICE_CLAIM_WITHOUT_TOOL_CALL=INVALID
```

Nome da peça ausente:

```text
Voice Tool Binding
Voice-to-tool capability binding
Unified tool surface binding
```

---

## 3. Regra de paridade

Texto, Voz, Work e Desktop devem consumir o mesmo capability bus quando a plataforma suportar.

```text
TEXT ⇄ VOICE ⇄ WORK ⇄ DESKTOP
same_intent_core=true
same_owner_fabric=true
same_capability_bus_when_supported=true
same_receipt_law=true
```

Se uma superfície não suporta determinada ferramenta, ela deve responder `PLATFORM_UNAVAILABLE`. Não pode simular execução.

---

## 4. Replay de cristal provado

Cristal provado não deve ser redescoberto. Deve ser reaproveitado.

```text
CRISTAL_PROVADO = REPLAY_FIRST
PROVE_ONLY_NEW_INTEGRATION=true
```

Fluxo:

```text
ID/SHA/hash/fingerprint/manifest/receipt
→ owner equivalente na main
→ fingerprint bate?
→ plugar delta faltante
→ testar efeito vivo
→ receipt
```

Proibido:

```text
auditar sistema inteiro sem ordem
reprovar cristal antigo sem evidência nova
criar owner paralelo
criar V1/V2/V3
```

---

## 5. GEV/JEV

GEV/JEV fica como micropeça opcional do portão de intenção, não como runtime novo.

```text
Hermes/SOL normaliza estado
→ Auto-Grill reduz lacunas
→ GEV/JEV retorna decisão tipada com confiança
→ gate decide executar/perguntar/rejeitar/indisponível
```

Regra:

```text
CONTRACT_FIRST_ENGINE_LATER=true
```

---

## 6. Arquivos materializados

```text
.agents/skills/centraldark-unified-surface-parity/SKILL.md
docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.yaml
docs/RECEIPTS/2026-09-26-CENTRALDARK-UNIFIED-SURFACE-PARITY-01.md
```

---

## 7. Comando para Worker / Cloud Code

```text
!CENTRALDARK — EVOLUIR, NÃO CRIAR PARALELO.

Carregue e implemente CENTRALDARK_UNIFIED_SURFACE_PARITY_01.
Owners já materializados:
- .agents/skills/centraldark-unified-surface-parity/SKILL.md
- docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.yaml
- docs/RECEIPTS/2026-09-26-CENTRALDARK-UNIFIED-SURFACE-PARITY-01.md

Objetivo:
Dar paridade real entre Texto, Voz, Work e Desktop usando o mesmo capability bus,
mesmo Intent Gateway, mesmo Auto-Grill, mesma lei de receipt e mesmos owners.

Regras duras:
- Não criar V1/V2/V3.
- Não criar arquitetura paralela.
- Não criar plugin paralelo se owner existente comportar o delta.
- Não simular ferramenta.
- Se Voice não suportar tool real, marcar PLATFORM_UNAVAILABLE.
- Cristal provado = replay primeiro.
- Provar somente a integração nova.
- Owner é destino lógico, não identidade do executor.

Implementar/validar:
1. Matriz Text × Voice × Work × Desktop.
2. Descoberta de ferramentas por superfície antes de qualquer claim.
3. Voice Tool Binding design.
4. Session/Tracing/Tool Calls/Usage Tokens/Receipts visíveis quando suportado.
5. Intent Gateway sob demanda acionado por !CENTRALDARK/CentralDark/#ACORDAR/!CALIBRAR.
6. Auto-Grill antes de perguntar ao CHEFE.
7. Adapter opcional GEV/JEV como decisão tipada, sem substituir Hermes/SOL.
8. Anti-fake execution rule.
9. Anti-loop EVENT_ID/SOURCE_ROUTE/SOURCE_DEVICE/INTENT_ID/CAUSATION_ID.
10. Validation cost by blast radius.

Entrega obrigatória:
- arquivos alterados
- owners tocados
- matriz de capacidades
- testes rodados
- receipts
- PASS / UNKNOWN / BLOCKED
- NEXT_CURSOR
```

---

## 8. Status

```yaml
PASS:
  - contrato skill criado
  - contrato yaml criado
  - receipt criado
  - regra anti-fake materializada
  - regra replay de cristal materializada
  - Voice Tool Binding nomeado como lacuna
  - plugin privado publicado e relido pelo backend do Plugin Creator
  - source portátil do plugin cristalizado em .agents/plugins/centraldark-unified-surface-parity/
UNKNOWN:
  - Voice binding realmente exposto pela plataforma atual
  - GEV/JEV real online/credencial/transporte
  - testes vivos na Casa após formatação
BLOCKED:
  - nenhum bloqueio de documentação nesta etapa
NEXT_CURSOR:
  - Worker/Cloud Code deve implementar paridade real e contraprovar com matriz de superfície
```

---

## 9. Frase núcleo

```text
NÃO É DAR PODER AO MODELO.
É EXPOR A MESMA CAPABILITY REAL PARA QUALQUER MODELO AUTORIZADO.
```


---

## 10. Delta — sessão, tracing e saída sem caixa-preta

**Requisito consolidado pelo CHEFE:** a mesma intenção em Texto/Voz deve permanecer na mesma sessão canônica, com a mesma visão lateral de sessões, tool calls, usage/tokens e receipts. A superfície pode mudar a apresentação, mas não o resultado estruturado, owner, ação ou prova.

Contrato:

```yaml
same_canonical_SESSION_ID: true
shared_ordered_TRACE: true
sidebar: [sessions, tool_calls, usage_tokens, receipts]
same_structured_outcome:
  - INTENT_ID
  - DECISION
  - OWNER
  - ACTION_RESULT
  - EVIDENCE
  - COUNTERPROOF
  - RECEIPT_ID
  - NEXT_CURSOR
voice_only_session_or_trace: forbidden
unexposed_platform_capability: PLATFORM_UNAVAILABLE
```

### Medição desta sessão — 2026-09-27 01:27 UTC

| Superfície observada | Evidência atual | Estado |
|---|---|---|
| Texto nesta sessão Work | Conector GitHub leu os quatro owners; ferramenta de escrita disponível. Esta atualização será provada pelo SHA de commit retornado. | PASS após confirmar os commits |
| Voz | Não é uma superfície exposta nesta sessão de texto; sessão/tracing/uso da Voz não foram medidos aqui. | UNKNOWN |
| Work | Esta execução está no Work Mode; GitHub e Remote Desktop Commander estão expostos. Não prova paridade em outra sessão Work. | PASS limitado à exposição atual |
| Desktop | Remote Desktop Commander encontrou dispositivo SEGREDO online (app 0.2.51), sessão de terminal PID 31412 (Blocked=true; Runtime=9760s), histórico recente de 20 tool calls e uso do Remote MCP: 3034 chamadas, 98% de sucesso, 60 sessões/21 ferramentas e 70% das chamadas restantes no mês. | PASS para telemetria de chamadas do Desktop Commander; tokens do modelo e vínculo da Voz = UNKNOWN |

O histórico consultado contém chamadas `edit_block`, `start_process`, `read_process_output`, `list_sessions` e `list_processes`. Os argumentos e outputs integrais não foram copiados para este receipt.

**Contraprova:** a captura de tool calls e uso do Remote MCP existe no Desktop Commander, mas não demonstra que Texto e Voz compartilham o mesmo `SESSION_ID`, nem que a lateral da Voz mostra esses eventos. Uso de chamadas MCP não equivale a contagem de tokens do modelo; tokens do modelo nesta sessão permanecem `UNKNOWN`. Portanto, paridade runtime Text↔Voice continua `UNKNOWN` até uma execução de Voz apresentar o mesmo contrato de sessão/tracing/usage e a mesma prova.

**NEXT_CURSOR:** validar uma ação real acessível em Texto e Voz; comparar `SESSION_ID`, sequência `TRACE_ID/TOOL_CALL_ID`, tokens de modelo e usage, owner, resultado estruturado e receipt. Se a plataforma Voice não expuser esses campos, registrar `PLATFORM_UNAVAILABLE` com a capability específica.


### Contraprova do contrato — 2026-09-27

Os quatro arquivos foram relidos do `main` e usados como entrada do validador `scripts/trigger-fabric/validate_unified_surface_parity_contract.py`.

```text
UNIFIED_SURFACE_PARITY_CONTRACT=PASS
exit_code=0
validator_commit=75975d7d139a2ea7c9f2412fb7982c4e2e302770
```

A primeira execução falhou e expôs marcadores desalinhados e um falso positivo para a frase válida `GEV/JEV não substitui Hermes`. O validador foi corrigido, commitado e executado novamente; a segunda execução passou.

```yaml
STATIC_CONTRACT_VALIDATION: PASS
LIVE_TEXT_VOICE_SESSION_PARITY: UNKNOWN
VOICE_BINDING: UNKNOWN
DESKTOP_TRACE_AND_USAGE_PROBE: PASS
```

Este PASS cobre somente a consistência estática entre contrato, skill e receipt. Não declara binding de Voz nem paridade viva entre sessões.

---

## 11. Delta — publicação de plugin exige identidade observável

T0 desta superfície: inventário de plugins pessoais próprios retornou vazio. Em seguida foi gerado um pacote portátil seguindo o schema Agent Plugins, sem segredo embutido, com skill subordinada ao owner existente e MCP canônico `https://mcp.centralldark.com/mcp`.

PLUGIN_ARTIFACT_CREATED != PLUGIN_PUBLISHED
PLUGIN_DIRECTORY_MISS != PLUGIN_ABSENT
PUBLISHED_PLUGIN_CLAIM_REQUIRES_ID_RELEASE_URL=true
PLUGIN_DIRECTORY_MISS_NEQ_NOT_PUBLISHED=true

PLUGIN_PUBLICATION_STATUS=PASS
PLUGIN_ID=plugins_6ab87b459ff08191a69311acd4c77d83
PLUGIN_RELEASE_ID=pluginrel_6ab87b470c048191b7ed42e9be8761b6
PLUGIN_URL=https://chatgpt.com/plugins/plugins_6ab87b459ff08191a69311acd4c77d83
PLUGIN_SCOPE=USER
PLUGIN_RELEASE_READBACK=pluginrel_6ab87b470c048191b7ed42e9be8761b6|is_current=true|version=0.1.0
PLUGIN_DISCOVERABILITY=PRIVATE
PLUGIN_SOURCE_ROOT=.agents/plugins/centraldark-unified-surface-parity/
PLUGIN_ARCHIVE_SHA256=6561371aa73d7e2fc9e0642286fed474dee87331dee17ac39d3ce69a07f41e6c

Readback do backend:
- metadata retornou o mesmo `plugin_id`, versão `0.1.0`, scope `USER` e `current_release_id`;
- listagem de releases retornou o mesmo release como `is_current=true`;
- arquivos `plugin.json`, `mcp.json` e `skills/centraldark-unified-surface-parity/SKILL.md` foram relidos do release atual;
- o backend adicionou compatibilidade `.codex-plugin/plugin.json` e `.mcp.json` ao release sem alterar o owner canônico no repo.

PASS de publicação cobre identidade + release + URL + scope + leitura de volta. **Não** prova que a superfície Voice desta conta expõe o MCP, tool calls, tracing ou tokens.

```yaml
PLUGIN_PUBLICATION: PASS
LIVE_VOICE_BINDING: UNKNOWN
LIVE_TEXT_VOICE_SESSION_PARITY: UNKNOWN
```

NEXT_CURSOR: instalar/habilitar o plugin na superfície alvo quando o cliente oferecer essa ação, concluir OAuth do MCP se solicitado e executar a mesma ação em Texto e Voz; comparar SESSION_ID, TRACE_ID/TOOL_CALL_ID, usage/tokens, owner, resultado e receipt. Se Voice não expuser a capability, registrar PLATFORM_UNAVAILABLE.

---

## 12. Delta — paridade funcional Voz = Texto provada por SHA (2026-09-27)

O CHEFE apontou, com razão, que "UNKNOWN" geral escondia uma prova que já existe. São duas afirmações diferentes e agora ficam separadas:

```text
VOICE_FUNCTIONAL_TOOL_PARITY=PASS
VOICE_GITHUB_READ_WRITE_COMMIT_PR=PASS
VOICE_TEXT_SAME_SESSION_ID_TRACE_TOKENS=UNKNOWN
FUNCTIONAL_PARITY != SESSION_FIELD_IDENTITY
```

Prova da parte funcional — a sessão de Voz executou as mesmas ações reais que o Texto, na mesma `main`, com a mesma lei de rastro (sessão de Voz observada nas capturas do CHEFE; commits conferidos na `main`):

| Ação real pela Voz | Evidência |
|---|---|
| editar código e commitar na main | `6bf7bf9` — une leitores de gatilho texto/voz |
| editar código e commitar na main | `df76277` — partida entrega o mestre ao resolvedor canônico |
| abrir PR com 4 commits e testes | PR #1700 (`7bff816`) |
| escrever recibo no repositório | `d9ceed6`, `0dcd625` |
| registrar no livro-razão | #1562 comentário 5852115919 |

O que continua UNKNOWN é só identidade de campo: mesmo `SESSION_ID`, trilha ordenada e contagem de tokens do modelo entre Voz e Texto. Isso é detalhe da plataforma, medido só por comparação direta campo a campo; não reduz a capacidade funcional provada acima.

Crédito: execução pela caneta de Voz; separação da afirmação pela caneta Claude a partir da correção do CHEFE.


## Cristal 2026-09-28 — execução != renderer lateral

```text
TOOL_CALL_EXECUTED != TOOL_CALL_VISIBLE_IN_SIDEBAR
```

A execução real da ferramenta e a renderização visual da Tool Call no próprio ChatGPT são
capacidades distintas. Uma ferramenta pode executar sem que a superfície mostre o Trace Viewer;
e a presença de um painel visual não substitui receipt do backend.

Quando a superfície expuser tracing, preservar a cadeia:

```text
SESSION_ID -> TRACE_ID -> TOOL_CALL_ID -> USAGE/TOKENS -> RECEIPT
```

Estados permitidos para visibilidade:

```text
TOOL_CALL_VISIBILITY=PROVED_BY_PLATFORM_RECEIPT
TOOL_CALL_VISIBILITY=USER_CONFIRMED_VISIBILITY
TOOL_CALL_VISIBILITY=PLATFORM_UNAVAILABLE
TOOL_CALL_VISIBILITY=UNKNOWN
```

Nesta rodada, o CentralDark MCP executou uma Tool Call real nesta superfície; o CHEFE confirmou
visualmente que o renderer/painel de Tool Calls voltou a aparecer. A confirmação visual do CHEFE
é registrada como USER_CONFIRMED_VISIBILITY, sem ser confundida com prova do backend.

---

## Selo 2026-10-11 — consolidação de distribuição MCP e lacuna Voice

- **Intenção:** manter apenas um plugin de distribuição canônico, sem apagar capacidades ou criar outro runtime, e corrigir falhas observadas de descoberta e roteamento na voz.
- **Owner reutilizado:** `.agents/plugins/centraldark-unified-surface-parity/`; contrato `CENTRALDARK_UNIFIED_SURFACE_PARITY_01`; repositório `ServerVpss/CentralDark`.
- **Inventário Plugin Creator (somente USER, não inclui todos os eventuais plugins do workspace):** 3 existentes: `plugin_asdk_app_6acc3b567e608191a9a0830b59d86569`, `plugin_asdk_app_6ab822a97c688191948648c0c40009d5`, `plugins_6ab87b459ff08191a69311acd4c77d83`. Os dois primeiros são wrappers App-backed distintos; **não** foram desinstalados, para preservar rotas até paridade real.
- **Prova visual do CHEFE:** a ficha de outro CentralDark mostrava `asdk_app_6ac72e44d1808191abe016c60df4e557` como “Este aplicativo não está disponível”. Este App ID não coincide com os três IDs de plugin retornados; causa backend `UNKNOWN`, não prova de falha geral do MCP.
- **Catálogo medido:** `mcp_admin_catalog` retornou `ok=true`, `totalRuntimeTools=141` e `routeCount=13`; `mcp_status` retornou `SUCCESS`. A validação pública consultada retornou `health.ok=true`, `publicToolCount=153` e `ok=false` pelo conjunto esperado de duas ferramentas, sem equiparar catálogo público e exposição Voice.
- **Correção no owner:** SKILL canônica ganhou delta `mcp_status→mcp_admin_catalog→mcp_admin_call`, preflight Voice, diferença entre `INVALID_RECIPIENT`/`VOICE_TOOL_ROUTING_ERROR`/`TOOL_NOT_EXPOSED` e `PLATFORM_UNAVAILABLE`, trilha por escopo e política de não duplicar.
- **Commits de preparação:** `deaa5ac6cdbacaf61de0ed0b191003b7ac64b327` (SKILL), `d98299510424f1cf177be49bc3fd68404866445d` (manifest versão 0.1.1).
- **Release atualizado in place, Plugin Creator:** `plugins_6ab87b459ff08191a69311acd4c77d83` → versão `0.1.1`, `pluginrel_6acc490241fc81918c7c9834b413e404`, `status=updated`. Readback confirmou manifests versão 0.1.1, SKILL ampliada e endpoint MCP existente `https://mcp.centralldark.com/mcp`.
- **Artefato entregue:** `CentralDark_Unified_Surface_v0.1.1.zip`, SHA-256 `e895e6175012e6f55da77bfb930858d4c1421f0b2409464fb1152034b5cc656c`; sete entradas, JSON validado, sem `.app.json` e sem tokens.
- **Contraprova:** `PLUGIN_UPDATE=PASS`; `VOICE_RUNTIME_TOOL_EXPOSURE=UNKNOWN`; `SINGLE_INSTALLED_CENTRALDARK=NOT_YET`; `FULL_PUBLIC_CATALOG_VALIDATION=FAIL_OBSERVED`. Não declarar 141 ferramentas expostas na voz, nem a consolidação final antes do teste real de equivalência.
- **NEXT_CURSOR:** medir a mesma chamada real pela nova distribuição em Texto e Voz, com receipt do host; só então retirar os wrappers antigos explicitamente escolhidos pelo CHEFE, preservando os IDs e releases históricos. Não instalar outro plugin nem criar segunda interface.

---

## Selo 2026-10-11 — fusão dos quatro ZIPs legados no plugin existente v0.1.2

**INTENÇÃO:** um único adaptador de distribuição CentralDark, mantendo múltiplas capacidades reais e todos os owners originais; sem segundo runtime ou parser.

**SOURCE:** quatro ZIPs anexados no chat e a distribuição existente `plugins_6ab87b459ff08191a69311acd4c77d83` v0.1.1. Inventário com hashes: `.agents/plugins/centraldark-unified-surface-parity/CONSOLIDATION.md`. O ZIP `plugin(1).zip` é byte a byte igual a `plugin (3).zip`; dois outros ZIPs têm conteúdo distinto. Nenhum deles contém `mcpServers`, SKILL própria ou `interface.capabilities` declaradas.

**DELTA EXECUTADO:** preservação de endpoint MCP, skills e invariantes existentes; união da descrição operacional CHEFE/SOL/Hermes/Reality Judge/HUD com Casa, VPS, GitHub, Tailscale, Obsidian/Grafo Vivo, AionUi e Screenpipe; classificação de IDs App-backed como vínculos históricos, não tools; checklist para migração sem perda; arquivo `CONSOLIDATION.md` na distribuição; update in place pelo Plugin Creator.

**READBACK:** `plugin_id=plugins_6ab87b459ff08191a69311acd4c77d83`; `version=0.1.2`; `release_id=pluginrel_6acc4a7cd5f08191887eec9fac0136a1`; `status=updated`; pacote com 8 arquivos; dois manifests na mesma versão; nenhuma `.app.json`; URL MCP existente `https://mcp.centralldark.com/mcp`; SHA-256 do ZIP `dcba6ef7861ea1a9e21e9b91ddf352130e936b909b40faa82013d645b3801b83`.

**COMMITS/GITHUB:** SKILL `1e479f1924315e1679354655b9b9539dbc0058a8`; manifesto `751b6cbba473ad5ff7a3f46e0b6169b582bc5623`; inventário `5eee608f828001920953acab86dd559cf039309c`; source/readback `c2b7bc5d4afbba031b2c75a9ec5aea9c4d60dcc2`. Mesmo owner `CENTRALDARK_UNIFIED_SURFACE_PARITY_01`.

**LIMITES:** `UPDATE_IN_PLACE=PASS`; `FILE_LEVEL_MERGE=PASS`; `VOICE_BINDING=UNKNOWN`; `SINGLE_ACTIVE_INSTALLED_PLUGIN=UNKNOWN`; `LEGACY_WRAPPERS_REMOVED=NO`. A existência de `mcp_admin_catalog` não prova que todas as tools do server são expostas no mesmo cliente ou na voz.

**NEXT_CURSOR:** instalar/conectar a distribuição existente quando necessário; testar `mcp_status` + `mcp_admin_catalog` e uma execução autorizada com receipt em Text e Voice; contraprovar a equivalência e só então autorizar desinstalação de wrappers específicos. Não reinstalar runtime, não mudar credenciais, não criar plugin paralelo.

---

## Medição 2026-10-12 — Voz não selada, catálogo presente, marketplace paralelo dispensável

**INTENÇÃO:** verificar se os erros de reconhecimento de ferramentas pela superfície ChatGPT Voice foram corrigidos e decidir se a simplificação exige marketplace próprio.

**OWNER:** `docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.yaml` e `docs/BRAIN/07-APRENDIZADOS-MEMORIAS/2026-09-14-CRISTAL-HERMES-HARNESS.md`; receipt acrescido neste arquivo existente, sem criar outro owner.

**CURRENT observado:**
- `MAIN_AT_MEASUREMENT=3316951ec39cac715cf9801e86715bd880652cc3` (commit observado antes deste registro; não equivale a paridade de VPS).
- `centraldark-unified-surface-parity`: Plugin Creator `0.1.2`, `pluginrel_6acc4a7cd5f08191887eec9fac0136a1`, `PRIVATE/USER`, publicado. Publicado `!=` instalado `!=` exposed in Voice.
- `mcp_status`: `state=SUCCESS`, `error_code=NONE`, `correlation_id=dcf0e295-2d72-4aec-a85e-0943d1c7206c`. Esse resultado comprova **somente** a chamada na superfície atual.
- `mcp_admin_catalog`: `ok=true`, `totalRuntimeTools=141`, `totalDispatchableTools=141`, `routeCount=13`, `catalogFingerprint=80f0a0fab518ab8d15bbf6651b5471813369c53e56902d905883caa97c7405c7`. Catálogo não prova exposição da Voice.
- `deploy_validate_mcp_catalog`: `ok=false`; `health.ok=true`, `publicToolCount=153`, `runtimeToolCount=86`, `catalogMatchesRuntime=true`, `expectedMissingPublic=[vps_limpar_pasta_projeto,vps_listar_pastas_limpaveis]`. São contagens e checks de domínios diferentes; não afirmar falha total do MCP.
- `get_app_permissions` consultado pelos **três IDs pessoais** retornou `status=not_installed`; a captura atual do CHEFE exibe duas entradas visuais `CENTRALDARK` instaladas. A identidade entre as entradas da UI e esses IDs ainda não está comprovada: `UI_APP_BINDING=UNKNOWN`, não declarar que a conta está sem CentralDark.
- **Prova da voz nesta medição:** nenhuma chamada produzida **dentro da sessão de voz** foi apresentada. `VOICE_TOOL_EXPOSURE=UNKNOWN`, `VOICE_BINDING_FIXED=UNPROVEN`. A ferramenta funcionar em Text não sela Voice, e a UI “Sempre perguntar” sozinha não explica tool discovery.

**Decisão canônica para simplificação:** owner `docs/BRAIN/07-APRENDIZADOS-MEMORIAS/2026-09-14-CRISTAL-HERMES-HARNESS.md` já determina `ONE_GATEWAY=true`, `ONE_TOOL_CATALOG=true`, `NO_PARALLEL_MARKETPLACE=true`. Reutilizar `mcp_admin_catalog → mcp_admin_call` e a única distribuição `centraldark-unified-surface-parity` sem construir marketplace operacional paralelo. Ideia `M.22 Marketplace de agentes` em `docs/CONSCIENCIA/DESEJOS-FUTUROS-MEGA-PACOTAO.md` permanece desejo futuro separado, não owner da correção Voice.

**CONTRAPROVA:** `PLUGIN_PUBLISHED=PASS`; `MCP_TEXT_TOOL_CALL=PASS`; `PUBLIC_CATALOG_VALIDATION=FAIL_OBSERVED`; `VOICE_TOOL_BINDING=UNKNOWN`; `SINGLE_INSTALLED_PLUGIN=UNPROVEN`. Não mudar permissões, instalar versões repetidas nem remover wrappers até esclarecer a identidade/Voice.

**NEXT_CURSOR:** pedir chamada real `mcp_status` ou `mcp_admin_catalog` **na própria Voice** e preservar `SURFACE_ID`, `TOOL_CALL_ID`, erro literal ou receipt; identificar na UI os IDs efetivos das duas entradas antigas e provar o binding com o ID do plugin unificado. Se a Voice não expuser tools, registrar exatamente `PLATFORM_UNAVAILABLE` só para essa superfície.


## 2026-10-12 — Cristal da rota Voice multi-conta (v0.1.3)

**Intenção vigente:** corrigir e consolidar diagnóstico sem novo plugin ou owner. **Prova histórica:** PRs #1611 (merge 18236674046c17adada4fde2c4e78986ea81b3f9), #1616 (583838336e571955eb39604a78c20c2597e320e8), #1725 (33ff2b6f0007da40a4bd0eaba2bea0472e79e560), #1740 (18bfc7b7375affd4ca1fdbed91ca5adf92694a59) confirmadas mergeadas. Na conta de voz funcional, captura do CHEFE mostrou ferramenta `mcp_status` e JSON `ok=true`, 141 tools, 13 rotas, catálogo `v1-f8ff6720fec3`, timestamp `2026-10-12T03:16:54.647Z`. Isso encerra a necessidade de repetir prova dessa conta.

**Correção cristalizada:** reforçar no owner existente o caminho `VOICE_MISSING_TOOL→TOOL_DISCOVERY→REAL_ALIAS/RECIPIENT→AUTHORIZED_ACCOUNT_LINK→mcp_status→mcp_admin_catalog→CAPABILITY→READBACK→RECEIPT`. A skill não altera exposição de tools pelo host. `INVALID_RECIPIENT != MCP_UNAVAILABLE`; `UI_LABEL != PLUGIN_ID`; `PUBLISHED != INSTALLED != VOICE_EXPOSED`.

**Plugin Creator:** mesmo `plugin_id=plugins_6ab87b459ff08191a69311acd4c77d83` atualizado para `0.1.3`, `release=pluginrel_6acc542884bc8191b86f5c5641d7d401`, arquivo SHA-256 `62000559c527a451ea4ff7689eb614c5966f564871c16d7d51d35b7e1c604327`; MCP endpoint preservado, nenhum wrapper desinstalado.

**Contra-prova:** `VOICE_FUNCTIONAL_ACCOUNT_MCP_STATUS=USER_SUPPLIED_STRUCTURED_EVIDENCE`; `VOICE_CURRENT_ACCOUNT_HOST_BINDING=UNKNOWN`; `VOICE_CURRENT_ACCOUNT_FIXED=NOT_PROVED`. Não vender patch documental/skill como correção de runtime Voice.

**NEXT_CURSOR:** descobrir binding efetivamente exposto nesta conta pela rota existente, sem pedir nova gravação da conta funcional; se o host não disponibiliza tool, classificação específica `PLATFORM_UNAVAILABLE`.


## 2026-10-12 — Visibilidade Tool Call Desktop / PR #1708 / v0.1.4

**INTENÇÃO:** restaurar a auditoria visual de chamadas `Solicitar → Resposta → JSON` no computador, como observado pelo CHEFE no iPhone, preservando o ChatGPT Windows, as sessões e os owners.

**OWNER:** `docs/ARQUITETURA/CENTRALDARK-TOOL-CALL-VISIBLE-RECEIPT-ECHO-01.md` (PR #1708, merge `aaac83ce9d20a17c8530b55bd52131fcce2f3cc9`). **Reuso:** skill da distribuição única `.agents/plugins/centraldark-unified-surface-parity/skills/centraldark-unified-surface-parity/SKILL.md`.

**MEDIÇÃO CASA:** Desktop Commander `mcp__CENTRALDARK__list_devices` enumerou `SEGREDO` online (`db22d900-db4f-449a-b775-016ae15deefb`). PowerShell no mesmo dispositivo encontrou processo `ChatGPT.exe`, pacote `OpenAI.Codex 26.1007.2314.0`, janela `ChatGPT` (PID `13404`); Microsoft Edge com janela ativa. Foi executado `Start-Process ... msedge.exe --new-tab https://chatgpt.com` sem encerrar tabs ou app. **READBACK:** Edge `ChatGPT e mais 22 páginas` (`msedge PID 20504`). `WINDOWS_BROWSER_CHATGPT_TAB=OPENED`; `USER_LOGGED_IN=UNKNOWN`; `NATIVE_TOOL_CARD_VISIBLE=UNKNOWN`.

**DELTA PUBLISHED:** o mesmo plugin `plugins_6ab87b459ff08191a69311acd4c77d83` foi atualizado para `v0.1.4`, release `pluginrel_6acc564ddd4881918f5a732c0816ea23`. ZIP de 8 arquivos SHA256 `f335b82ae1d6ef252e648b81d49e7d08fcdd386feede501fb6cfca21cd5acc53`; MCP URL e configurações MCP preservados byte a byte. Acrescido ao **owner distribuído existente** o `CENTRALDARK_VISIBLE_RECEIPT_ECHO` da PR #1708 para imprimir, quando necessário, um bloco **por tool call real**: ferramenta, input JSON sanitizado, status, resposta segura/resumo fiel, evidência, contraprova, NEXT_CURSOR. Não inventar tool call, JSON/trace/usage, nem despejar dados sensíveis.

**CONTRAPROVA:** plugin/skill não controla o renderer nativo fechado do ChatGPT Windows. `PLUGIN_UPDATE=PASS`; `EDGE_TAB_OPEN=PASS`; `NATIVE_RENDERER_RESTORED=UNPROVEN`; `IN_CHAT_ECHO_EFFECTIVE_IN_CURRENT_DESKTOP_SESSION=UNPROVEN`; `SINGLE_CANONICAL_DISTRIBUTION_PRESERVED=PASS` (identidade de distribuição única, sem excluir adapters legados).

**NEXT_CURSOR:** na primeira tool call efetivamente apresentada na sessão desktop, observar se o renderer nativo está `full_list`, `inline_only` ou `none`; se parcial/ausente, emitir `TOOL_CALL_VISIBLE_RECEIPT` com input/resposta observados. O usuário não precisa repetir a evidência móvel existente. Não confundir sucesso do fallback textual com correção da interface do ChatGPT.

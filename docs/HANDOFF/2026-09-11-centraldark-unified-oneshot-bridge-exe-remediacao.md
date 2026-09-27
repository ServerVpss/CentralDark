# 👑🪬 !CENTRALDARK · Unified OneShot · Bridge EXE Remediação + T1 Casa

## 🧿 REGRA

`PROVADO_ANTES -> REUSE`  
`REMEASURE_ONLY_CHANGED_EDGES=true`  
`UNKNOWN != PASS`  
`PR_MAE=RASTRO_APENAS`  
`ONE_SYSTEM_ONLY=true`  
`NO_V2_V3_FIX_PARALLEL=true`

## 👑 INTENÇÃO DO CHEFE

Cristalizar a sessão do `CentralDark-Unified-OneShot` no mesmo owner já existente, preservando o que foi provado na Casa e sem reabrir prova que já passou.

A frente de normalização global de hora/data foi delegada a outro agente e fica fora deste receipt para evitar dois Writers no mesmo escopo.

## ✅ CURRENT_PROVEN

### Git / lineage

- PR #1491 está merged, fechado e com merge commit `3d184fc3445982eb0f81ccb8d998fd826b837e31`.
- A correção de build já foi registrada na `main` antes deste T1.
- Produto único preservado: `CentralDark-Unified-OneShot`.
- Runtime único preservado: `%LOCALAPPDATA%\CentralDark\UnifiedRuntime`.
- Perfis preservados: `Segredo` e `Fulano`.

### Casa / execução T1 observada

O CHEFE executou novamente o mesmo pacote na Casa e enviou a saída/prints de T1.

```text
PROFILE=Segredo OAUTH_PASS=True
PROFILE=Fulano  OAUTH_PASS=True
MCP_TOOLS_LIST=PASS TOOL_COUNT=100
MCP_AUTHENTICATED_E2E=PASS
REMOTE_TRAY=STARTED
SCREENPIPE=STARTED
PORT_3030=True
PORT_3031=True
PORT_9100=True
BUILD=PASS
BRIDGE_BUILD_EXIT=0
CENTRALDARK_BRIDGE=STARTED
```

### Bridge EXE

A lacuna anterior foi fechada no T1:

```text
BRIDGE_EXE_PRESENT=true
BUILD_PS1_PASS=true
ADD_TYPE_COMPILE_ERROR=false no T1 observado
CENTRALDARK_BRIDGE_UI_OPENED=true
```

O executável foi gerado dentro do mesmo produto em:

`E:\CentralDark\CentralDark-Unified-OneShot\dist\CentralDarkBridge.exe`

O aplicativo abriu a janela **CentralDark Bridge · One Shot** e apresentou os controles do MCP/Casa/VPS.

### OAuth / multiperfil

A execução mostrou autenticação concluída para os dois perfis no mesmo runtime:

```text
Segredo -> AUTH PASS
Fulano  -> AUTH PASS
```

Os receipts continuaram separados por perfil em `%LOCALAPPDATA%\CentralDark\UnifiedRuntime\profiles\<perfil>\logs\`, sem criar runtime paralelo.

### MCP

O fluxo autenticado chegou a `tools/list` com PASS e `TOOL_COUNT=100` no T1 observado.

Isso fecha a lacuna operacional desta sessão entre:

`AUTH -> TOKEN/CACHE -> MCP -> tools/list -> Bridge aberto`.

### Remote Tray

`REMOTE_TRAY=STARTED` foi observado no mesmo pacote.

A própria UI do Tray preserva a trava sem falso-verde:

```text
PROCESSO_ATIVO != DEVICE_ONLINE
UNKNOWN != PASS
```

Portanto `ONLINE_DECLARADO` continua sendo estado declarado/sensorial e não substitui prova causal de device remoto quando essa prova for exigida.

## 🔴 FERIDA HISTÓRICA FECHADA

A sessão começou com:

```text
Add-Type / C# compile error
BRIDGE_BUILD_EXIT=1
CENTRALDARK_BRIDGE=BUILD_OUTPUT_ABSENT
```

Depois da correção no mesmo produto, o T1 mostrou:

```text
BUILD=PASS
BRIDGE_BUILD_EXIT=0
CENTRALDARK_BRIDGE=STARTED
```

Não reabrir essa mesma ferida sem nova evidência de regressão.

## 🟡 LACUNA VISÍVEL NÃO BLOQUEANTE PARA O BUILD

A interface aberta ainda exibiu mojibake/encoding em alguns rótulos (`Â`, sequências `ðŸ...`, acentuação quebrada).

Classificação:

```text
RUNTIME_BUILD=PASS
APP_OPEN=PASS
MCP_AUTH=PASS
UI_TEXT_ENCODING=OPEN
```

Isso é uma lacuna de apresentação do mesmo aplicativo; não invalida os PASS de build/OAuth/MCP/portas observados e não autoriza criar V2/FIX/app paralelo.

## 🧪 CONTRAPROVA / NÃO REABRIR SEM CAUSA

Continuam reutilizados como fatos da sessão enquanto alvo/artefato não mudar materialmente:

- OAuth Segredo/Fulano;
- MCP autenticado E2E;
- `tools/list` PASS;
- portas 9100/3030/3031 em listening no T1;
- Screenpipe iniciado;
- Remote Tray iniciado;
- build do Bridge PASS;
- `CentralDarkBridge.exe` gerado;
- Bridge UI aberta.

`PROVADO != PROVAR DE NOVO SEM CAUSA`.

## 🚫 FORA DE ESCOPO DESTE RECEIPT

- normalização global de hora/data: **outro Writer/agente ativo**;
- corrigir encoding da UI;
- habilitar execução remota (permaneceu `DISABLED_BY_DEFAULT` na UI observada);
- declarar device remoto online apenas porque o processo do Tray está ativo;
- criar novo pacote, V2, V3, FIX9, segundo app ou segundo runtime.

## 🧾 PACKAGE / PROVENIÊNCIA

Pacote de remediação anteriormente registrado:

`CentralDark-Unified-OneShot-REMEDIADO.zip`

`SHA256=f470eb654ed20b38e84ad810d86197805c51780623cb7cc69d2cb820b75c595b`

O T1 desta sessão prova a execução corrigida na Casa; não muda automaticamente o hash histórico acima.

## ⚖️ FIXED_POINT DESTA SESSÃO

```text
PACKAGE_SOURCE_FIXED=true
BRIDGE_BUILD_FIXED=true
BRIDGE_EXE_PRESENT=true
BRIDGE_UI_OPENED=true
OAUTH_SEGREDO_PASS=true
OAUTH_FULANO_PASS=true
MCP_TOOLS_LIST_PASS=true
MCP_TOOL_COUNT=100
PORT_9100_PASS=true
PORT_3030_PASS=true
PORT_3031_PASS=true
SESSION_BUILD_AND_OPEN_FIXED_POINT=true
UI_ENCODING_FIXED_POINT=false
GLOBAL_FIXED_POINT=false
```

### Veredito

O objetivo material desta sessão — **corrigir o build e fazer o programa único abrir mantendo OAuth/MCP/perfis/runtime existentes** — chegou ao T1 provado.

Próximo agente não deve voltar ao `Add-Type`/`BUILD_OUTPUT_ABSENT` sem regressão nova. O próximo delta útil do mesmo app pode partir da UI já aberta, preservando o produto, o runtime e os fatos acima.


## 🧾 T1 ADICIONAL — 2026-09-24 · OAuth Segredo + MCP 112 tools

Fonte: execução observada pelo CHEFE na Casa e receipt textual do mesmo fluxo.

```text
2026-09-24T00:17:22.2814789-03:00 PROFILE=Segredo OAUTH_FLOW=START
2026-09-24T00:17:22.2982305-03:00 PROFILE=Segredo RESOURCE=https://mcp.centralldark.com/admin/mcp
2026-09-24T00:17:23.6362078-03:00 PROFILE=Segredo DCR=PASS
2026-09-24T00:17:23.7057059-03:00 PROFILE=Segredo AUTHORIZE_BROWSER=OPENING
2026-09-24T00:17:41.8595459-03:00 PROFILE=Segredo AUTHORIZE=PASS
2026-09-24T00:17:42.1620584-03:00 PROFILE=Segredo TOKEN=PASS TYPE=Bearer EXPIRES_IN=3599
2026-09-24T00:17:42.1690554-03:00 PROFILE=Segredo TOKEN_STORE=DPAPI_CURRENT_USER
2026-09-24T00:17:43.4385288-03:00 PROFILE=Segredo MCP_TOOLS_LIST=PASS TOOL_COUNT=112
2026-09-24T00:17:43.4490462-03:00 PROFILE=Segredo MCP_AUTHENTICATED_E2E=PASS
2026-09-24T00:17:43.4562665-03:00 PROFILE=Segredo OAUTH_RECEIPT=C:\Users\Administrador\AppData\Local\CentralDark\UnifiedRuntime\profiles\Segredo\logs\oauth-20260924-001722.log
2026-09-24T00:17:43.4633315-03:00 PROFILE=Segredo OAUTH_FLOW=END
```

### Estado promovido por esta prova

```text
PROFILE=Segredo
RESOURCE=https://mcp.centralldark.com/admin/mcp
DCR=PASS
AUTHORIZE=PASS
TOKEN=PASS
TOKEN_TYPE=Bearer
TOKEN_EXPIRES_IN=3599
TOKEN_STORE=DPAPI_CURRENT_USER
MCP_TOOLS_LIST=PASS
MCP_TOOL_COUNT=112
MCP_AUTHENTICATED_E2E=PASS
OAUTH_FLOW=END
```

O T1 anterior deste mesmo owner registrava `TOOL_COUNT=100`. Esta observação mais recente registra `TOOL_COUNT=112`; para esta execução/perfil, CURRENT observado substitui o valor histórico sem reescrever a evidência antiga.

### Contraprova e limites

Na mesma sessão visual, o probe simples do Bridge para `https://mcp.centralldark.com/mcp` exibiu falha de canal SSL/TLS. Isso **não** autoriza classificar o MCP público como offline, porque a execução autenticada acima concluiu `DCR`, autorização, token e `tools/list` com 112 ferramentas.

Classificação preservada:

```text
OAUTH_SEGREDO_E2E=PASS
MCP_AUTHENTICATED_E2E=PASS
MCP_TOOLS_LIST=PASS
MCP_TOOL_COUNT=112
BRIDGE_SIMPLE_TLS_PROBE=FAIL_OBSERVED
PUBLIC_MCP_OFFLINE=false_by_this_failure
TLS_PROBE_ROOT_CAUSE=UNKNOWN
```

Este T1 não promove, por si só, `SINGLE_INSTANCE`, `TRAY_SAME_PROCESS`, estado do Desktop Commander Remote, nem desativação efetiva de endpoints remotos. Declaração de UI/configuração continua diferente de execução provada.

`UNKNOWN != PASS`.

### Fixed point deste delta

```text
OAUTH_SEGREDO_CURRENT_PROOF_CRYSTALLIZED=true
DPAPI_CURRENT_USER_OBSERVED=true
MCP_112_TOOLS_OBSERVED=true
NO_V2_V3_CREATED=true
EXISTING_OWNER_REUSED=true
TLS_PROBE_REMEDIATION_FIXED_POINT=false
GLOBAL_FIXED_POINT=false
```


## 🧾 T1 ADICIONAL — 2026-09-24 · Bridge → Painel Admin público

Fonte: observação visual do CHEFE na mesma Casa/Bridge após o T1 OAuth acima.

### Cadeia observada

```text
CentralDark Bridge · One Shot
→ [CASA] OPENED=E:\CentralDark
→ [OPEN_URL] https://mcp.centralldark.com/admin
→ MCP CentralDark · Painel Admin carregado
```

No painel público carregado foram observados, naquele instante:

```text
ADMIN_PANEL_PUBLIC_ROUTE=PASS_OBSERVED
ADMIN_PANEL_URL=https://mcp.centralldark.com/admin
ADMIN_PANEL_HEALTH_DISPLAY=100_PERCENT_HEALTHY
ADMIN_PANEL_ERRORS_DISPLAY=0
ADMIN_PANEL_WARNS_DISPLAY=0
ADMIN_PANEL_REQUESTS_DISPLAY=41
ADMIN_PANEL_TOOLS_DISPLAY=125

DEPENDENCY_mcp_catalog=OK_DISPLAYED
DEPENDENCY_oauth=OK_DISPLAYED
DEPENDENCY_telegram_bot=OK_DISPLAYED
DEPENDENCY_github_api=OK_DISPLAYED
DEPENDENCY_hub_mission_consumer=OK_DISPLAYED
DEPENDENCY_sse=OK_DISPLAYED
DEPENDENCY_disk_logs=OK_DISPLAYED
DEPENDENCY_memoria=OK_DISPLAYED
DEPENDENCY_loadavg=OK_DISPLAYED
```

### Contraprova / escopo

Os números do painel são **estado exibido pela superfície Admin naquele instante**. Eles não substituem medição independente de cada dependência e não transformam UI em autoridade absoluta.

A mesma execução do Bridge continuou exibindo:

```text
BRIDGE_SIMPLE_TLS_PROBE=FAIL_OBSERVED
```

Portanto:

```text
ADMIN_PANEL_PUBLIC_ROUTE=PASS_OBSERVED
MCP_ADMIN_SURFACE_REACHABLE=true_by_observation
BRIDGE_SIMPLE_TLS_PROBE=FAIL_OBSERVED
TLS_PROBE_ROOT_CAUSE=UNKNOWN
TLS_PROBE_FAIL_DOES_NOT_IMPLY_ADMIN_OFFLINE=true
```

O valor `TOOLS=125` exibido no Painel Admin e o `MCP_TOOL_COUNT=112` retornado no `tools/list` autenticado são métricas/superfícies diferentes até prova de equivalência. Não reconciliar por inferência.

### Estado acumulado do mesmo Bridge/owner

```text
OAUTH_SEGREDO_CURRENT_E2E=PASS
OAUTH_FULANO_HISTORICAL_T1=PASS
DPAPI_CURRENT_USER_OBSERVED=true
MCP_AUTHENTICATED_E2E=PASS
MCP_TOOL_COUNT_AUTHENTICATED_SEGREDO=112
ADMIN_PANEL_PUBLIC_ROUTE=PASS_OBSERVED
ADMIN_PANEL_TOOLS_DISPLAY=125
CASA_E_DRIVE_OPENED=true
NO_PARALLEL_RUNTIME_CREATED=true
TLS_PROBE_REMEDIATION_FIXED_POINT=false
GLOBAL_FIXED_POINT=false
```

`UNKNOWN != PASS`.

## 🧊 2026-09-26 · Delta antes da formatação da Casa

Contexto: o CHEFE apagou a VPS e vai formatar a Casa. GitHub passa a ser a única fonte. Preservação completa registrada em `docs/RECEIPTS/2026-09-26-CASA-PRESERVACAO-ANTES-DE-FORMATAR.md`.

### Medido nesta sessão (antes da VPS ser apagada)

```text
PUBLIC_MCP_401_SEM_CREDENCIAL=PASS (cadeado ativo, não é offline)
VPS_DC_REMOTE_UNITS=2 ativos (conta1, conta2)
VPS_ELITE_GATEWAY=AUSENTE (404)
VPS_ATRASADA_EM_RELACAO_A_MAIN=17 commits
SENSOR_WINDOWS_SEGREDO_LAST_SEEN=2026-09-22T23:38:09Z (offline na medição)
CASA_DESKTOP_COMMANDER_APPS=CentralDark+Filesystem/Terminal+Supabase+WebSearch conectados (print do CHEFE)
```

### Screenpipe — evidência do log (21–23/09)

```text
SCREENPIPE_MCP=v0.20.0 via stdio → http://localhost:3030 (lançado por bun.exe)
QUEDA_INESPERADA=2026-09-21T21:23:36Z; 2026-09-23T20:50:52Z ("process exiting early")
REINSTALA_DEPENDENCIAS_A_CADA_PARTIDA=true ("Resolving dependencies")
INSTANCIA_DUPLA_EM_PARTIDAS=true
SCREENPIPE_FORA_DA_PONTE_E_DO_CADEADO=true
PATH_MISTURA_USUARIOS=danda+Administrador
CAUSA_RAIZ_DAS_QUEDAS=UNKNOWN (contraprova: 21/09 11:16→21:23 estável ~10h)
```

### Decisão de arquitetura do CHEFE (não criar programa separado)

```text
SINAL_DE_VIDA=DENTRO_DA_PROPRIA_PONTE (sem sensor/vigia separado)
QUEM_DETECTA_MORTE=o outro lado (morto não avisa que morreu)
SILENCIO_ALEM_DO_LIMITE=OFFLINE|UNKNOWN (silêncio nunca é verde)
RELIGAR_PONTE=tarefa do Windows no logon + reiniciar se falhar (configuração, não programa)
SCREENPIPE=supervisionado pela ponte, acesso externo só pela 9100 autenticada, 3030 só 127.0.0.1
EXECUCAO_REMOTA=DESLIGADA salvo ordem explícita
FASE_ATUAL=SÓ_LOCAL (VPS fora de escopo; envio para VPS preparado e desligado)
```

Provas pendentes para fechar a ponte na Casa reinstalada: P1 instância única · P2 bandeja=mesmo PID · P3 9100 recusa sem credencial e lista com credencial · P4 ferramentas do Screenpipe pela 9100 · P5 3030 não exposto · P6 queda do Screenpipe religa sozinha · P7 queda da ponte religa e estado fica velho na queda · P8 arquivo de estado = ferramenta de saúde · P9 execução remota recusada · P10 reinício do PC sobe tudo 1x.
Todas `UNKNOWN` até execução real.

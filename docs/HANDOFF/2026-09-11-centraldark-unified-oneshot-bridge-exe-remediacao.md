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

# 👑🪬 !CENTRALDARK · CentralDark-Unified-OneShot build hotfix

## Contexto

Screenshot da Casa mostrou que OAuth e MCP já avançaram, mas `BUILD.ps1 -> Add-Type` ainda falhou no C# gerado em `Temp\*.cs`, impedindo `dist\CentralDarkBridge.exe`.

## Reuso obrigatório

```text
PRODUTO_UNICO=CentralDark-Unified-OneShot
NO_V2_V3_PARALLEL_SYSTEMS=true
REUSE_BEFORE_CREATE=true
UNKNOWN_IS_NOT_PASS=true
```

## Já provado na Casa pelo print

```text
PROFILE=Segredo AUTH_PASS=True
PROFILE=Fulano AUTH_PASS=True
AUTH_CACHE_FOUND=true
MCP_TOOLS_LIST=PASS TOOL_COUNT=100
MCP_AUTHENTICATED_E2E=PASS
REMOTE_TRAY=STARTED
PORT_3030=True
PORT_3031=True
PORT_9100=True
```

Esses itens não devem ser reabertos como lacuna sem mudança material.

## Lacuna real remediada no pacote

```text
BRIDGE_BUILD_EXIT=1
CENTRALDARK_BRIDGE=BUILD_OUTPUT_ABSENT
```

Correção aplicada no pacote enviado ao Chefe:

- `BUILD.ps1` agora sanitiza fonte legado com literal `\n` antes do `Add-Type`;
- build compila a partir de `dist\CentralDarkBridge.compiled.cs`, não de `Temp\*.cs` aleatório;
- `src\CentralDarkBridge.cs` remove caracteres especiais do UI e deixa `RunAuth` com `DirectoryInfo/string` explícito;
- não mexe em OAuth, DPAPI, Remote Tray, Screenpipe, MCP tools/list nem perfis Segredo/Fulano.

## Pacote entregue

```text
PACKAGE=CentralDark-Unified-OneShot.zip
PACKAGE_SHA256=ec79477c75b0db615cec17dfca08f3c462a6bc126b17d87296ed9678288c0000
```

## Próxima remedição permitida

```text
REMEASURE_ONLY_CHANGED_EDGE=true
EDGE=BUILD.ps1 -> dist/CentralDarkBridge.compiled.cs -> dist/CentralDarkBridge.exe -> BRIDGE_EXE_PRESENT=true
GLOBAL_FIXED_POINT=false
CASA_RUNTIME_FIXED_POINT=UNKNOWN_UNTIL_WINDOWS_RUN
```

## Contraprova contra o agente

Se o agente voltar a criar `FIX9`, `V2`, `V3`, segundo app, segunda pasta ou reabrir OAuth/MCP/Screenpipe/Remote sem evidência nova, está violando o contrato do Chefe.
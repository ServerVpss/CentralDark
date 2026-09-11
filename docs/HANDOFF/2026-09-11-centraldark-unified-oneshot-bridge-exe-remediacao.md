# 👑🪬 !CENTRALDARK · Unified OneShot · Bridge EXE Remediação

## 🧿 REGRA

`PROVADO_ANTES -> REUSE`
`REMEASURE_ONLY_CHANGED_EDGES=true`
`UNKNOWN != PASS`
`PR_MAE=RASTRO_APENAS`

## ✅ CURRENT_PROVEN

- #1491 está merged, fechado e com merge commit `3d184fc3445982eb0f81ccb8d998fd826b837e31`.
- MCP/OAuth/Screenpipe/Remote Tray single-instance já foram provados pelos receipts locais enviados pelo CHEFE.
- Portas locais provadas nos receipts: `9100`, `3030`, `3031`.
- Perfis provados nos receipts: `Segredo`, `Fulano`.

## 🔴 LACUNA ENCONTRADA

`BRIDGE_EXE_PRESENT=false`

Causa material no pacote local:

- `src/CentralDarkBridge.cs` continha sintaxe incompatível com o `Add-Type` usado pelo `BUILD.ps1` no Windows PowerShell.
- havia `\n` literal dentro de `RunAuth`, quebrando a compilação C#.
- isso fazia `BUILD_OUTPUT_ABSENT`, sem invalidar OAuth/MCP/Screenpipe já provados.

## 🔧 CORREÇÃO FEITA NO PACOTE

- Corrigido `src/CentralDarkBridge.cs` mantendo o mesmo produto `CentralDark-Unified-OneShot`.
- Preservado o mesmo runtime: `%LOCALAPPDATA%\CentralDark\UnifiedRuntime`.
- Preservados perfis `Segredo` e `Fulano`.
- Não criado `FIX`, `V2`, `V3`, segundo app, segundo runtime ou segunda pasta canônica.

## 🧪 CONTRAPROVA

Não reabrir como falha:

- OAuth Segredo/Fulano.
- MCP tools/list.
- Screenpipe 3030/3031.
- Remote Tray single-instance.

Remedir apenas:

- `BUILD.ps1` no Windows/Casa.
- `dist\CentralDarkBridge.exe` presente.
- Bridge abre sem `Add-Type` error.
- `BRIDGE_EXE_PRESENT=true` no próximo receipt.

## 🧾 PACKAGE RECEIPT

`CentralDark-Unified-OneShot-REMEDIADO.zip`

`SHA256=f470eb654ed20b38e84ad810d86197805c51780623cb7cc69d2cb820b75c595b`

## ⚖️ FIXED_POINT

`PACKAGE_SOURCE_FIXED=true`

`CASA_RUNTIME_FIXED_POINT=UNKNOWN_UNTIL_LOCAL_RUN`

`GLOBAL_FIXED_POINT=false`

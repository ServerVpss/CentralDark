# 👑🪬 CentralDark Unified OneShot

🧿 **OWNER:** mesmo pacote integrado recebido da Casa, evoluído in-place.

## 🔄 Corpo canônico

```text
E:\CentralDark\CentralDark-Unified-OneShot\
        ↓
%LOCALAPPDATA%\CentralDark\UnifiedRuntime\
        ├─ profiles\Segredo\
        ├─ profiles\Fulano\
        ├─ logs\
        ├─ receipts\
        └─ tools\LogCollector\
```

## 🔐 OAuth

```text
perfil
→ token DPAPI existente
→ testar MCP
→ refresh token se necessário
→ browser/PKCE somente se necessário
→ initialize
→ tools/list
→ receipt
```

## 🧩 Capacidades preservadas

- Bridge builder/UI;
- Remote Tray + Desktop Commander;
- BridgeMind state;
- WebView2 tratado como runtime externo/reutilizável;
- Speech core;
- Screenpipe discovery/launcher;
- payload VPS;
- coletor de logs integrado ao mesmo runtime.

## ⚖️ Regras

`REUSE_BEFORE_CREATE=true`  
`ONE_SYSTEM_ONLY=true`  
`ONE_WRITER_PER_SCOPE=true`  
`UNKNOWN != PASS`

## 🏠 Fronteira

Pacote reconciliado estruturalmente. Execução física Windows/Casa é julgada pelos receipts gerados no `UnifiedRuntime`.


## 👑🪬 2026-09-11 · REMEDIÇÃO BRIDGE EXE

CURRENT_PROVEN:
- AUTH Segredo/Fulano já provado nos receipts enviados pelo CHEFE.
- MCP/Screenpipe ports 9100/3030/3031 já provados.
- Remote Tray single instance reuse já provado.

CHANGED:
- Corrigido `src/CentralDarkBridge.cs` para C# compatível com Add-Type do Windows PowerShell.
- Removido `\n` literal dentro do método `RunAuth`.
- Preservado produto único `CentralDark-Unified-OneShot`.

ABSENT/UNKNOWN:
- EXE precisa ser buildado na Casa/Windows com `BUILD.ps1`.

NEXT_ONE_OPERATION:
- Rodar `BUILD_AND_RUN.cmd` ou `RUN-ALL-PROFILES.cmd` no SEGREDO.

FIXED_POINT:
- Package/source = true.
- Runtime/Casa = depende da execução local.

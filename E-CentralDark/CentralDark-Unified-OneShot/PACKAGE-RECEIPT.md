# 🧿 CentralDark Unified OneShot · Receipt do pacote

## 🔄 Delta absorvido no mesmo corpo

- raiz do pacote normalizada para `CentralDark-Unified-OneShot`;
- `UnifiedRuntime` virou destino único de logs, receipts, ferramentas e perfis;
- perfis `Segredo` e `Fulano` usam estado OAuth separado;
- token de acesso é protegido por DPAPI;
- refresh token, quando emitido, também é protegido por DPAPI;
- token já válido é reutilizado antes de abrir login;
- `tools/list` interpreta JSON/SSE antes do julgamento;
- `RUN-ALL-PROFILES.cmd`, `RUN-SEGREDO.cmd` e `RUN-FULANO.cmd` operam o mesmo corpo;
- Remote Tray continua compartilhado como um único braço local;
- LogCollector foi absorvido em `UnifiedRuntime\tools\LogCollector`;
- nomes próprios de pacote com `FIX<n>` foram removidos.

## ⚖️ Fronteira da prova

`PACKAGE_STRUCTURE=PROVEN`

`WINDOWS_RUNTIME=REQUIRES_CASA`

`UNKNOWN != PASS`

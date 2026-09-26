ONDE COLOCAR:
  Extraia a pasta CentralDark-Unified-OneShot diretamente em E:\CentralDark\
  Resultado:
  E:\CentralDark\CentralDark-Unified-OneShot\

PRIMEIRA EXECUÇÃO:
  INSTALL-AND-RUN.cmd

CENTRALDARK UNIFIED ONESHOT

CORPO ÚNICO:
  E:\CentralDark\CentralDark-Unified-OneShot\

RUNTIME PERSISTENTE:
  %LOCALAPPDATA%\CentralDark\UnifiedRuntime\

PERFIS:
  Segredo
  Fulano

EXECUTAR TUDO:
  RUN-ALL-PROFILES.cmd

EXECUTAR UM PERFIL:
  RUN-SEGREDO.cmd
  RUN-FULANO.cmd

O QUE O PACOTE REUTILIZA:
  - CentralDark MCP
  - Remote Tray / Desktop Commander
  - Screenpipe existente
  - Bridge UI
  - OAuth MCP com token protegido por DPAPI
  - logs, receipts e perfis no UnifiedRuntime

AUTENTICAÇÃO:
  - tenta token DPAPI já salvo;
  - se expirou, tenta refresh;
  - só abre o navegador quando realmente precisa autenticar novamente.

REGRAS:
  REUSE_BEFORE_CREATE=true
  ONE_SYSTEM_ONLY=true
  ONE_WRITER_PER_SCOPE=true
  UNKNOWN_IS_NOT_PASS=true

NÃO APAGAR:
  %LOCALAPPDATA%\CentralDark\UnifiedRuntime\profiles\
  %LOCALAPPDATA%\CentralDark\UnifiedRuntime\logs\
  %LOCALAPPDATA%\CentralDark\UnifiedRuntime\receipts\

LOG COLLECTOR:
  %LOCALAPPDATA%\CentralDark\UnifiedRuntime\tools\LogCollector\

RUNTIME WEBVIEW2:
  runtime\Microsoft.WebView2.FixedVersionRuntime.150.0.4078.105.x64.7z

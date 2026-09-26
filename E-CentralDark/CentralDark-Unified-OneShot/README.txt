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
  - rota primária: CentralDark MCP direto em https://mcp.centralldark.com;
  - tenta token DPAPI já salvo;
  - se expirou, tenta refresh;
  - se precisa login, abre /authorize do próprio CentralDark;
  - senha admin é digitada somente na página de autorização CentralDark;
  - o servidor devolve authorization code e o cliente conclui PKCE S256;
  - access/refresh ficam protegidos por DPAPI no perfil local;
  - Desktop Commander Remote NÃO é requisito para autenticar o MCP CentralDark.

REMOTE DESKTOP COMMANDER:
  - legado/fallback opcional, não control plane;
  - desativado por padrão no RUN-ALL.ps1;
  - para habilitar explicitamente: integration\RUN-ALL.ps1 -EnableLegacyRemoteTray;
  - falha EBUSY do cache NPX não bloqueia o fluxo MCP CentralDark direto.

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

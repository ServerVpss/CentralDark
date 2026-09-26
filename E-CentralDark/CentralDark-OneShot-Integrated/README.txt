CENTRALDARK BRIDGE BUILDER · ONE SHOT

OBJETIVO
Gerar um executável Windows local sem exigir Node/Rust/npm e preparar um payload pequeno para a VPS.

USO NO WINDOWS
1. Extraia este ZIP.
2. Dê duplo clique em BUILD_AND_RUN.cmd.
3. O builder cria dist\CentralDarkBridge.exe e um BUILD-RECEIPT.json com SHA-256.
4. Opcional: rode scripts\INSTALL_LOCAL.ps1 para copiar o EXE para E:\CentralDark\Bridge.

O APP FAZ
- prova o endpoint MCP local por initialize JSON-RPC;
- prova alcance do MCP público e distingue gate de auth/protocolo;
- detecta pastas comuns do Desktop Commander / cache NPX;
- abre E:\CentralDark;
- abre PowerShell já na Casa;
- abre o admin CentralDark;
- grava logs em %LOCALAPPDATA%\CentralDark\Bridge\logs.

VPS
Dentro do pacote existe VPS_PAYLOAD.zip. Envie esse ZIP à VPS e siga README-VPS.txt.
O serviço VPS escuta apenas 127.0.0.1:9180 por padrão e oferece /health, /mcp-probe e /architecture.

SEGURANÇA / ESCOPO
- nenhum segredo foi empacotado;
- os arquivos .key/.crt enviados na conversa NÃO entram no ZIP;
- dados do window_state NÃO entram no ZIP;
- o grande WebView2 Fixed Runtime não entra: este primeiro corte não depende dele;
- nenhuma rotina de execução remota arbitrária foi ativada;
- UNKNOWN != PASS.

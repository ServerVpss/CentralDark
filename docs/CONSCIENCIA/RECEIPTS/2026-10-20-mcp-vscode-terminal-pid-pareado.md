# 🪬 CENTRALDARK — MCP → VS Code terminal existente por PID

DATA=2026-10-20
INTENT=CAPACIDADE_VSCODE_REMOTO_MCP_EXISTENTE
OWNER_MCP=apps/modulos/mcp/src/tools/local/{local-compute.js,vscode-remote-terminal.js}
OWNER_VSCODE=skills/vs-code-restore/{src/extension.ts,src/remote-terminal.ts,package.json}
GOVERNANCA=apps/modulos/mcp/manifesto-destrutivas.json
BRANCH=feat/mcp-vscode-terminal-existing-pid-20261020
REUSE_BEFORE_CREATE=true
NEW_MCP_SERVER=false
NEW_HERMES=false
NEW_SCHEDULER=false
DESKTOP_COMMANDER_REQUIRED=false

## Comportamento e autorização

1. O MCP CentralDark expõe `vscode_remote_devices` (inventário pareado),
   `vscode_remote_terminals` (PID real por dispositivo) e
   `vscode_remote_execute` (comando somente após aprovação no próprio VS Code).
2. O cliente é a extensão VS Code Restore, versão 0.1.5, e não um daemon independente.
   O receptor fica desativado por padrão e, quando pareado, escuta SOMENTE
   `127.0.0.1:8719`. O Tailscale Serve já existente pode publicar esse
   loopback no HTTPS privado da tailnet. Não usar Funnel/HTTP público.
3. Dispositivo NÃO entra só por estar online: o administrador registra
   explicitamente o par `deviceId` + host `.ts.net` + nome da variável secreta
   no runtime MCP. A extensão recebe o mesmo ID e segredo privado, guardado em
   `vscode.ExtensionContext.secrets`.
4. Cada operação usa segredo bearer, destino fixo pré-autorizado, ID do dispositivo,
   UUID e SHA-256 do comando; o receptor revalida timestamp, PID, nonce e
   confirmação modal humana antes de agir. Sem `createTerminal()`.
5. A saída e o código de retorno vêm de `shellIntegration.executeCommand()`,
   `execution.read()` e `onDidEndTerminalShellExecution`, com limite de tamanho
   e sanitização pelo MCP. Timeout depois de POST = UNKNOWN, não replay.
6. A tool de comando arbitrário fica em `destrutivasEmRevisao` no manifesto:
   nenhum sucesso simulado pode aprová-la. Leitura de dispositivos/PIDs continua
   independente da quarentena da escrita.

## Contrato de implantação por dispositivo

- Conferir autenticação do MCP, owner único, checkout e configuração Tailscale.
- Compilar a extensão existente: `cd skills/vs-code-restore && npm install && npm run compile`;
  empacotar a VSIX com o empacotador oficial e instalar na GUI do VS Code de destino.
- Na paleta de comandos, usar `CentralDark: Parear terminal remoto`. Informar
  um `deviceId` previamente autorizado e o segredo **sem colocar valor em Git/chat/log**.
- Criar/atualizar o Tailscale Serve PRIVADO no próprio dispositivo apontando
  para `127.0.0.1:8719`; verificar a URL HTTPS da máquina, sem assumir que
  o fato de a Casa estar online implique esse proxy configurado.
- Configuração PRIVADA do processo MCP:
  `CENTRALDARK_VSCODE_DEVICES_JSON=[{"id":"segredo","url":"https://segredo.SUA_TAILNET.ts.net/","tokenEnv":"CENTRALDARK_VSCODE_DEVICE_TOKEN_SEGREDO"}]`
  e a variável `CENTRALDARK_VSCODE_DEVICE_TOKEN_SEGREDO` vinda do cofre existente,
  nunca versionar ou copiar seu conteúdo. Substituir o hostname de exemplo pelo host real autorizado.
- Recarregar o MCP apenas após build/validação no mesmo commit. Testar
  `vscode_remote_devices`, depois `vscode_remote_terminals`,
  depois um comando de leitura aprovado no PID corrente.
- Guardar `deviceId | terminalName | pid | requestId | commandHash |
  consentimento | exitCode | readback | timestamp | receipt` sem conteúdo secreto.

## Provas 20/10/2026 — BRANCH / VPS ISOLADA

- MCP: 4/4 testes Node PASS em
  `apps/modulos/mcp/tests/vscode-remote-terminal.test.mjs`.
- VS Code: `tsc -p tsconfig.json` PASS; 3/3 testes Node PASS em
  `skills/vs-code-restore/test/remote-terminal.test.cjs`.
- Build isolado do MCP: `npm run build` PASS.
- Inventário estático do catálogo: 158 ferramentas no checkout isolado,
  três novas `vscode_remote_*`, sem duplicatas, nomes inválidos ou formato inválido.
- Nenhuma ferramenta foi instalada, pareada ou acionada na Casa nessa rodada.
  O teste de saída `oi` usa mock controlado, não um PID real da Casa.
- Nenhum serviço de produção ou checkout main foi alterado.

## Pendências e gates

`SOURCE_COMMITTED != MAIN_MERGED != MCP_RUNTIME_LOADED != VSIX_INSTALLED != DEVICE_PAIRED != TERMINAL_EXECUTED`.

MCP_WRITE_GATE=QUARANTINED_UNTIL_COMPENSATION_AND_E2E
FIRST_LIVE_TARGET=Casa SEGREDO, terminal pwsh existente (PID rechecado; 31566 era snapshot)
REQUIRED=TS_BUILD, NODE_TEST, MCP_CATALOG, VSIX_BUILD, CI_SAME_SHA,
DEVICE_VSIX_INSTALL, TAILSCALE_SERVE_PRIVATE, PAIRED_SECRET_RUNTIME,
PROVEN_MCP_TO_LOCAL_REQUEST, LOCAL_CONSENT, SAME_PID_EXECUTION, EXIT_READBACK, RECEIPT
NEXT_CURSOR=VSIX_PACKAGE -> CI_SAME_HEAD -> AUTHORIZE_PROMOTION ->
MCP_RELOAD_WITH_ROLLBACK -> PAIR_DEVICE_SEGREDO -> LIVE_PID_READBACK ->
SAFE_OI -> CAPABILITY_COMPENSATION_GATES

REALIDADE_E_JUIZ=true

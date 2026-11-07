# CENTRALDARK · CORPO ÚNICO · Entrada e capacidades
<!-- OWNER: scripts/remote-bridge · Integração 2026-11-05 · sem segundo executor -->

**Uma entrada humana:** `scripts/remote-bridge/CENTRALDARK-CORPO-UNICO.cmd` abre o **mesmo** HUD WinForms de `scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat`. O HUD agora tem **um NotifyIcon** na bandeja do Windows: minimizar/fechar mantém a janela oculta; duplo clique ou menu a reabre; **Sair** encerra a mesma instância. Mutex existente `Local\CentralDark_CorpoUnico_HudLogs` impede duplicação.

| Capacidade | Owner existente, sem copiar implementação | Papel no Corpo Único |
| --- | --- | --- |
| Entrada, janela, Tray, status, logs | `scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat` | UX local único; probes somente leitura; logs em `%LOCALAPPDATA%\CentralDark\Corpo-Unico-HUD-Logs.txt` |
| Executor Casa e ferramentas | `scripts/remote-bridge/canonical/CentralDark-Casa-Agent.mjs` | Executa via engine stdio local; `127.0.0.1:9101/health` e `POST /tool` autenticado |
| Instalador OneShot existente | `scripts/remote-bridge/canonical/CentralDark-Casa-OneShot.ps1` + `CentralDark-Casa-OneShot.go` | Instala/atualiza a ponte local; **não** é atualmente o processo de Tray |
| Binário preservado | `F:\CentralDark\Remote-Tray\CentralDark-Casa-OneShot.exe` | Compilado histórico do launcher de instalação; não confundir com `CentralDarkBridge.exe` ausente |
| Tailscale privado | `scripts/remote-bridge/canonical/CENTRALDARK-REMOTE-BRIDGE.config.json` | `tailnet:9100 → 127.0.0.1:9101` |
| MCP CentralDark | `apps/modulos/mcp/src/tools/core/mcp-admin.js` | Control plane OAuth/admin, `casa_commander_status` e `casa_commander_read` na `main` |
| Cockpit / Instinto Superior | `apps/instinto-superior/src/lib/cockpit.functions.ts` e `src/components/central/StatusPanel.tsx` | Surface web existente; recebe saúde e recibo, sem segundo executor |
| Hermes | owner Hermes existente no Windows / sistema | Coordenação/executação autorizada, sem outro processo criado pelo launcher |
| Screenpipe, Afterburner e sensores | `scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat` e `apps/instinto-superior` | Somente leitura e sensores existentes |
| Tray remoto antigo (legado) | `scripts/remote-bridge/canonical/engine/CentralDark-Remote-Tray.ps1` | **Não** ativar: ainda inicia `desktop-commander remote` de fornecedor externo |

### Prova desta integração (05/11/2026)
- Inspeção física de `F:\CentralDark`: launcher e HUD encontrados no mesmo checkout. O arquivo `CENTRALDARK-CORPO-UNICO.cmd` abre o HUD **relativo à pasta**, sem copiar arquivos nem alterar a tarefa Windows existente.
- Parser PowerShell do payload extraído do BAT: **0 erros**; exatamente **1 NotifyIcon** declarado; callback de fechamento e roteamento para `9101/health` presentes no código.
- `127.0.0.1:9101/health` respondeu `ok=true`, `name=CentralDark Casa Commander`, `remote_vendor=false`, **`engine_connected=false`**. Status correto no cartão: **WARN**, não PASS.
- Há tarefa `CentralDark-Casa-Cockpit-Hermes-One` apontando para `K:\scripts\casa`, mas `K:\` está ausente na medição. **Não alterar a tarefa silenciosamente.**
- Não há confirmação de compilação do Tray em EXE, pareamento OAuth/admin ponta a ponta, instalação da versão nova do agente nem reboot/autostart. A bridge instalada permanece em `%LOCALAPPDATA%\CentralDark\Casa-Commander`; token DPAPI não foi lido, copiado ou exportado.

**NEXT_CURSOR:** executar o launcher em sessão Windows interativa para confirmar a mesma janela e Tray; fechar/abrir pelo ícone, mantendo mutex; parear admin MCP com token já protegido; testar `/tool` leitura e recibo; publicar runtime MCP/GUI pelo owner existente; reconciliar autostart somente após confirmar caminhos vivos. Nunca mover pastas `apps`, `docs`, `Casa-Commander` ou `.git` para `remote-bridge`, pois isso quebraria os serviços existentes.

## Reconciliação de fonte — 07/11/2026 (sem selo de runtime)

- **Um Tray:** o owner visual permanece `scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat` (WinForms + um `NotifyIcon`). O botão `🔐 MCP CentralDark` e uma ação no mesmo ícone agora chamam o helper existente `canonical/CENTRALDARK-OAUTH-TRAY.ps1`, sem criar um segundo Tray. A interação legítima ainda abre o navegador para consentimento; início do processo não comprova autorização.
- **Menu existente recuperado:** `canonical/MENU-OPERACIONAL-TRAY.ps1` teve os marcadores de conflito removidos; mantém saúde Casa, OAuth CentralDark, Tailscale, autostart, status/logs, harness histórico, diagnóstico local-first, runtime e contrato. O fluxo operacional não inicia mais o serviço remoto do fornecedor.
- **Bridge preservada:** `CentralDark-Remote-Bridge.ps1` teve o conflito do bloco `param` reconciliado, preservando `InstallAutoStart`, `EnableLegacyRemote`, `LocalStatus` e `Json` até revisão funcional por owner.
- **OAuth alinhado à fonte do servidor:** `canonical/CENTRALDARK-OAUTH-TRAY.ps1` agora solicita recurso `/api/mcp` e sonda `POST /api/mcp`, como declarado em `apps/modulos/mcp/src/index.js`. Prova E2E com OAuth, PKCE, `tools/list` e `tools/call` continua pendente.
- **BATs ainda necessários:** o `CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat` guarda o payload WinForms funcional e o `CENTRALDARK-CORPO-UNICO.cmd` é apenas ponto de entrada relativo. Não excluir até separar o payload no **mesmo owner**, comprovar a migração e revisar todos os consumidores. Nenhuma remoção/renomeação nesta etapa.
- **Legado não apagado:** `canonical/engine/CentralDark-Remote-Tray.ps1` e sondas antigas de perfis remotos no HUD ainda guardam referências ao fornecedor; estão identificados para aposentadoria segura após contraprova. Não declarar `DESKTOP_COMMANDER_ELIMINADO` enquanto restar rota ativa ou dependência.
- **Prova feita:** commits e leitura de retorno na `main` dos arquivos alterados; ausência dos marcadores de conflito nos dois owners corrigidos; caminho do OAuth e ligação ao único Tray conferidos no texto. **Não houve** parser PowerShell no Windows, E2E autenticado, compilação, instalação, reinício, teste visual nem medição do autostart; portanto `SOURCE_FIXED != RUNTIME_PASS`.

**NEXT_CURSOR:** Casa acessível → parser PowerShell dos owners → teste negativo da rota do fornecedor → OAuth legítimo `initialize + tools/list + tools/call` → confirmar motor e receipt `/health` → testar menu WinForms e autostart → remover somente atalhos `.bat/.cmd` comprovadamente sem consumidores → atualizar HUD e sincronizar Casa com a `main` sem perda de alterações locais.

## Log de conexão nativo no mesmo Corpo Único — 07/11/2026

- **Fonte do motor:** `@wonderwhy-er/desktop-commander@0.2.48` (MIT; `wonderwhy-er/DesktopCommanderMCP`). O pacote é iniciado por `canonical/CentralDark-Casa-Agent.mjs` via `npx` em STDIO local; `remote_vendor=false`. O serviço remoto do fornecedor e seu `device code` não são parte da autenticação própria.
- **Owner dos logs:** `CentralDark-Remote-Bridge.ps1` já redireciona `stdout` do processo Casa Agent para `%LOCALAPPDATA%\\CentralDark\\Remote-Tray\\receipts\\remote-bridge\\casa-commander.stdout.log`. A modificação registra eventos de ciclo `ENGINE_STARTING`, `MCP_INITIALIZE`, `TOOL_REQUEST`, `TOOL_RESULT`, `ENGINE_EXIT` e falhas classificadas. Não registra argumentos, tokens, cookies nem stderr bruto; stderr vira apenas um sinal limitado por execução do motor.
- **Owner visual:** o `scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat` consome **o mesmo log** na aba `SCRIPTS` / `TODOS`, pelo leitor que já existia. Não cria outra janela ou outro `NotifyIcon`. O helper OAuth existente continua responsável por consentimento legítimo.
- **Fonte x runtime:** alteração publicada e relida na `main`; não foi provada instalação na Casa, inicialização do novo agente, escrita real no log nem visualização no HUD. `MCP_LOG_SOURCE=READY`, `MCP_LOG_RUNTIME=UNKNOWN`. Não marcar `FIXED_POINT` com base na imagem do fornecedor.
- **NEXT_CURSOR:** reconciliar checkout Casa sem descartar alterações locais → instalar apenas o delta do mesmo owner → verificar health, log real e visual no HUD → OAuth / `tools/list` / chamada de leitura / receipt → remover referências remotas legadas após prova de ausência de consumidores.

# Troubleshooting

## Demo Mode does not show a halo

1. Confirm **Enable Halo** is checked in the tray menu.
2. Quit and reopen CentralDark Halo.
3. Open **Logs** from the tray and inspect the newest error.
4. Run the included Verify script.

Demo Mode does not require Codex. If it fails, the problem is the app/overlay,
not Codex lifecycle detection.

## Demo Mode works, Codex events do not

1. Confirm **Enable Halo** is checked in the tray menu.
2. Quit and reopen Halo after updating to the latest release.
3. Start a new Codex task, then inspect the Halo log for `Watching Codex session
   lifecycle events` and `idle -> working`.
4. Use the included Test State script with `working` to distinguish a display
   issue from lifecycle detection.

## macOS says the developer cannot be verified

The first release is unsigned. Right-click `CentralDark Halo.app`, choose **Open**,
then choose **Open** again. Do not disable Gatekeeper globally.

## macOS says the app is damaged

Download the release ZIP again and extract all files together. Do not move just
the installer away from its `hooks` and `support` folders. If macOS still blocks
the app, open an issue with the exact message; do not run commands that disable
system security.

## The tray icon is missing

- macOS: check Control Center/menu-bar item visibility and
  `pgrep -x centraldark-halo-lite`.
- Windows: check the hidden-icons area and Task Manager for `CentralDarkHalo.exe`.

Use the app's Quit item before relaunching.

## A connected display has no halo

1. Confirm the display is online and mirroring is disabled.
2. Quit and reopen Halo after changing the display arrangement.
3. Open the log and look for `Overlay coverage ready for N display(s)`.
4. Run Demo Mode and attach the display arrangement plus log to an issue.

## A state remains visible

Working times out after 30 minutes, attention after 60 minutes, and completed
after 2 seconds. Updates with old timestamps are ignored. Run Test State with
`idle`, then inspect the log for an invalid/stale-state message.

## CPU remains active while idle

Confirm the state is idle and the overlay is hidden. A correctly installed v0.1
uses filesystem events plus a 500 ms metadata check limited to eight recent
session files; it does not rescan session history. If activity persists, capture
several Activity Monitor/Task Manager samples plus the log and open an issue.

## Safe recovery

1. Quit Halo.
2. Move the platform `settings.json` aside to restore defaults.
3. Re-run the installer; it does not add hooks or require a Codex confirmation.
4. Re-run Verify.

Never restore an old configuration backup wholesale: that could overwrite hooks
added since the backup. The bundled installer removes only obsolete marked Halo
entries from older releases.

<!-- CENTRALDARK_REMOTE_AGENT_DEV_20261114 -->
## Agente Remoto em desenvolvimento (14/11/2026)

- /Bridge.html e / podem responder HTTP 200 com o mesmo index.html por fallback SPA do Vite. Não é prova da existência de um Bridge.html. Use / e confirme a transição login -> painel no React.
- Em Chrome DEV, "Permanecer conectado" não pode acessar o cofre DPAPI do Tauri. Para testar persistência, use o aplicativo nativo em DEV e a mesma conta Windows.
- Falha de fetch Supabase no WebView: conferir connect-src na CSP Tauri e o domínio público configurado; não permitir origem curinga ou armazenar segredos no frontend.
- !RASTRO 2026-11-15 notebook: TCP 443 no notebook e CORS/origem do Tauri na Casa responderam, mas o login do .exe ainda exibiu "Failed to fetch". O owner `src-tauri/src/session_vault.rs` passa a usar o cliente HTTPS Rust existente em `agent_supabase_auth_request`, com rotas de Auth allowlisted, a configuração PUBLICA em `public/centraldark-auth-public.json` e sem exposição de senha ou token em erro/log. A UI usa o comando nativo em Tauri e preserva fetch no browser DEV. O build local não comprova login no notebook; testar autenticação, refresh, pareamento e presença no MCP antes de PASS.
- !RASTRO 2026-11-15 — Telemetria do Agente Remoto: o logger EXISTENTE `src-tauri/src/logging.rs` escreve `%LOCALAPPDATA%/CentralDark Halo/logs/centraldark-halo.log`, mas respeita o caminho legado `%LOCALAPPDATA%/Codex Halo/logs/centraldark-halo.log` quando o diretorio legado ja existe e o novo nao (owner `platform/mod.rs`); rotacao ao iniciar com 1 MiB em `centraldark-halo.previous.log`. A contraprova na Casa desta rodada encontrou o log no caminho legado. Marcadores `AGENT_DIAG` registram inicio do app, indisponibilidade conhecida do executor, sessao/DPAPI, login/refresh Supabase via Rust HTTPS, pareamento/consentimento, cofre do dispositivo, heartbeat/refresh do MCP, servico local 127.0.0.1:9101, Tailscale e health publico MCP. Eventos de status repetidos sao registrados apenas quando mudam; sem emails, senhas, tokens, codigos de pareamento ou payloads. Filtrar pelo texto `AGENT_DIAG` ou verificar as linhas finais. No notebook, `CASA SEM RESPOSTA` pode simplesmente indicar que nao ha Casa Agent local na porta 9101 — nao prova falha da rede Tailscale. **DOCUMENTED/BUILT nao significa runtime comprovado**; requer readback no notebook depois da proxima compilacao.
- Porta 1420 ocupada ao iniciar Tauri: outro Vite já está servindo a prévia. Parar apenas esse processo do projeto, e deixar npm run tauri -- dev gerenciar a porta.
- Cargo offline com encoding_rs ausente: no teste DEV de 14/11, o Cargo baixou as dependências e compilou. O linker MSVC falhou inicialmente com LNK1181 legacy_stdio_definitions.lib: carregar vcvars64.bat e disponibilizar temporariamente a variante desktop em VC/Tools/MSVC/14.51.36231/lib/spectre/x64 no LIB do processo corrigiu o ambiente DEV, sem copiar bibliotecas. Os erros Rust posteriores foram corrigidos adicionando a feature reqwest/query e liberando MutexGuard antes de await. Binário DEV executado, mas release/NSIS não provados.
- Abrir "NSIS Menu 3.13" não compila nem instala o CentralDark. O instalador em modo both só estará disponível quando o bundle Tauri tiver sido compilado e testado.

**NEXT_CURSOR:** repetir testes TypeScript/Vite e gates Rust; comprovar o pós-login, o cofre e a aprovação do dono no app nativo.
<!-- /CENTRALDARK_REMOTE_AGENT_DEV_20261114 -->


<!-- CENTRALDARK_NATIVE_WINDOW_20261114 -->
### Moldura Bridge/Tauri e circuito remoto — 14/11/2026

- Barra Windows branca: conferir decorations(false) em show_agent_control e src/App.tsx; não mexer em overlay-*.
- Controles inativos: conferir agent-control-window.json com allow-hide, allow-minimize, allow-toggle-maximize, allow-start-dragging e allow-start-resize-dragging, todos limitados a agent-control.
- X encerra a aplicação: regressão em on_window_event CloseRequested; esperado prevent_close + hide, com tray vivo.
- Tailscale Running ou MCP HTTP 200 não provam engineConnected. O Casa Agent pode estar saudável com engine_connected=false.
- Pareamento bloqueado: exige sessão Supabase válida protegida por DPAPI e autorização do dono. Não copiar token para localStorage nem simular aprovação.
- Iniciar Bridge permanece desabilitado: não portar o antigo launcher PowerShell como executor paralelo; criar ligação do owner nativo somente após gates de idempotência, permissão e contraprova.

NEXT_CURSOR: login nativo, cofre após reinício, aprovação, heartbeat e tools/list; depois Release e instalação em ambiente de teste.
<!-- /CENTRALDARK_NATIVE_WINDOW_20261114 -->


<!-- CENTRALDARK_CLIENT_UI_RESPONSIVE_20261114 -->
### Nomes internos visíveis e cortes de layout — 14/11/2026

- Se cliente vir Remote Bridge ou RUST / TAURI, revisar textos de BridgePanel.jsx e App.tsx; não renomear owners internos como efeito colateral.
- Se janela ficar estreita e o título do cartão principal sobrepor botões, conferir BridgePanel.css: container remote-window, grade 3/2/1 colunas, app-shell com overflow-y auto e elementos principais com flex-shrink: 0.
- Se formulário de login cortar por altura baixa, conferir RemoteAgentLogin.css e rolagem interna da agent-native-body.
- Se confirmação de pareamento aparecer duas vezes, cartão principal já informa PAIRED_VERIFIED; banner adicional só para pendência/erro.
- Mudança de nome no frontend não inicia o motor remoto. Status de Casa, MCP, rede, autorização e ferramentas continuam com gates separados.

**NEXT_CURSOR:** teste de regressão de login/pareamento após reinício e responsividade no binário Release antes de distribuir aos clientes.
<!-- /CENTRALDARK_CLIENT_UI_RESPONSIVE_20261114 -->


<!-- CENTRALDARK_AGENT_WINDOWS_TREE_20261115 -->
## Diagnostico dos caminhos do Agente Remoto
LAST_UPDATED_UTC=2026-11-15T04:14:35.517Z
TREE_CANONICAL=docs/INSTALLATION.md
Program Files e somente o destino nominal perMachine; NSIS
currentUser instala sob LocalAppData. O caminho exato depende
do teste de instalacao. DPAPI atual fica na raiz de
LocalAppData/CentralDark/AgenteRemoto; as subpastas session e
pairing ainda sao alvo. Settings/logs Halo legados e
HOME/.centraldark-halo/state.json devem ser preservados.
Nao mover credencial, apagar pasta nem assumir motor pronto por
HTTP 200 sem teste autorizado e readback.
<!-- /CENTRALDARK_AGENT_WINDOWS_TREE_20261115 -->

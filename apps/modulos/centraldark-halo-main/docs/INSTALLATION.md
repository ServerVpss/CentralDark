# Installation

## macOS 11 or newer

1. Download and fully extract the Universal ZIP.
2. Run `Install CentralDark Halo.command`.
3. For the unsigned first release, right-click `CentralDark Halo.app`, choose **Open**,
   then confirm **Open**.
4. Use Codex normally. Halo detects local task lifecycle events automatically.
5. Open the menu-bar icon and run **Demo Mode**.

The installer uses `~/Applications` and needs no administrator permission. It
creates `~/.codex-halo`, and does not add a Codex Hook or require a trust
approval. Repeat installation is idempotent. Run `Verify CentralDark Halo.command`
to check both Universal architectures, the state directory, an atomic state
write, process status, and Start at Login consistency. If an older Halo version
created entries in `~/.codex/config.toml` or `hooks.json`, the installer removes
only those marked legacy Halo entries.

Uninstall with `Uninstall CentralDark Halo.command`. Add `--purge` in Terminal only if
you also want to delete preferences and logs.

## Windows 10/11 x64

1. Download and fully extract the Windows ZIP.
2. Run `Install-CentralDark-Halo.ps1` in PowerShell.
3. Use Codex normally; no file, Hook, or trust configuration is required.
4. Open the tray icon and run **Demo Mode**.

The installer writes `%LOCALAPPDATA%\CentralDark Halo`, creates a Start Menu shortcut,
and requires no administrator permission. Run `Verify-CentralDark-Halo.ps1` for the
installation checks. Uninstall with `Uninstall-CentralDark-Halo.ps1`; pass `-Purge`
only when settings/log removal is desired.

## No Codex configuration step

Halo watches only the local `task_started` and `task_complete` lifecycle
records emitted by Codex Desktop. It does not install executable hooks, parse
prompts, or require a trust confirmation.

## Manual state test

```bash
# macOS
./scripts/macos/test-state.sh working
./scripts/macos/test-state.sh attention
./scripts/macos/test-state.sh completed
./scripts/macos/test-state.sh idle
```

```powershell
# Windows
.\scripts\windows\Test-State.ps1 -State working
```

<!-- CENTRALDARK_REMOTE_AGENT_DEV_20261114 -->
## Modo DEV do Agente Remoto e escolha de instalação (14/11/2026)

Estes passos se referem ao fonte em migração centraldark-halo-main, NÃO ao ZIP Halo 0.1.8 documentado acima.

1. No VS Code, abrir C:/CentralDark-Harnes-projeto/CentralDark-RemoteDesktop-Comander/centraldark-halo-main.
2. Para editar o React e observar na hora: npm run dev; abrir http://127.0.0.1:1420/. O Vite aplica HMR aos componentes/CSS. Não criar Bridge.html.
3. Para validar bandeja/cofre/overlays no Tauri, encerrar somente o Vite que serve este projeto na porta 1420. Nesta Casa, cargo/rustc existem em %USERPROFILE%\.cargo\bin, mas esse diretório não estava no PATH do terminal. Ajustar apenas a sessão do PowerShell: $env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; então executar npm run tauri -- dev. O Tauri passa a gerenciar Vite e reconstruir Rust ao alterar src-tauri. Não encerrar Hermes, Casa Agent ou outros processos do Windows.
4. O modo navegador não persiste no DPAPI; "Permanecer conectado" precisa do runtime nativo e deve ser testado com login, reinício, refresh e logout.

O instalador anterior scripts/windows/Install-CentralDark-Halo.ps1 continua por usuário e NÃO é o novo instalador de suporte remoto. O bundle NSIS configurado com installMode=both deve apresentar escolha usuário/todos no futuro, mas exige UAC na abertura mesmo escolhendo usuário atual. Recusar UAC deve cancelar a instalação; não burlar consentimento. O escopo da instalação nunca concede automaticamente acesso à tela.

**DEV provado em 14/11/2026:** Tauri compilado e iniciado com terminal oculto; janela CentralDark Agente Remoto e BridgePanel renderizados; Vite existente reutilizado via override temporário beforeDevCommand vazio. O MSVC exigiu carregar vcvars64.bat e adicionar temporariamente a biblioteca desktop spectre/x64 ao LIB do processo de build (não copiar bibliotecas). **PENDENTE:** bundle/instalador Tauri, teste NSIS, cofre DPAPI após reinício e pareamento E2E. **NEXT_CURSOR:** validar sessão/consentimento, depois installer com rollback.
<!-- /CENTRALDARK_REMOTE_AGENT_DEV_20261114 -->


<!-- CENTRALDARK_NATIVE_WINDOW_20261114 -->
### Estado do DEV modernizado — 14/11/2026

O Tauri DEV usa Vite existente em 127.0.0.1:1420; o comando CLI roda com console oculto e logs em %TEMP%\CentralDark-Halo-Rust-Pairing-Recovery\agent-modern-window.stderr.log. Não duplicar servidor nem substituir a instalação antiga. A interface usa o mesmo WebView2, sem Electron.

Minimizar preserva o processo; maximizar/restaurar é nativo; X oculta para a bandeja. O menu Abrir Agente Remoto já existente permite reabrir. Esta medição é um binário target/debug, NÃO instalador NSIS nem Release.

NEXT_CURSOR: validar sessão e consentimento, build Release, opções de instalação por usuário/todos com UAC e rollback.
<!-- /CENTRALDARK_NATIVE_WINDOW_20261114 -->


<!-- CENTRALDARK_AGENT_WINDOWS_TREE_20261115 -->
## Arvore canonica PROPOSTA: CentralDark Agente Remoto v0.1.9

LAST_UPDATED_UTC=2026-11-15T04:14:35.517Z
TREE_OWNER=docs/INSTALLATION.md
TREE_DOC_STATUS=TARGET_DEFINED
TREE_RUNTIME_STATUS=NOT_PROVEN
NATIVE_MCP_IN_EXE=NOT_IMPLEMENTED
NSIS_019=NOT_BUILT
SOURCE_VERSION=0.1.8
NEXT_VERSION=0.1.9_DRAFT

OBJETIVO: um processo Windows com interface React/Tauri e motor MCP
Rust nativo incorporado, sem node.exe, npx, terminal ou segundo
executor do produto. O fork MIT ServerVpss/DesktopCommanderMCP
fornece contratos/codigo, nao transforma TypeScript em Rust.
WebView2 permanece prerequisito do Windows a validar.

A configuracao atual NSIS installMode=both oferece currentUser
ou perMachine; o caminho efetivo depende da escolha e do NSIS.
Em both pode ocorrer UAC na inicializacao do instalador.
As localizacoes abaixo sao ALVOS NOMINAIS e nao comprovantes
de instalacao. O exe final pode vir acompanhado do desinstalador.

~~~text
[perMachine - todos os usuarios, com UAC]
%ProgramFiles%\CentralDark\Agente Remoto\
  CentralDark-AgenteRemoto.exe   <- React/Tauri + MCP Rust no processo
  [desinstalador NSIS]

[currentUser - apenas usuario]
%LOCALAPPDATA%\Programs\CentralDark\Agente Remoto\
  CentralDark-AgenteRemoto.exe
  [desinstalador NSIS]
  (caminho real deve ser medido em teste NSIS)

[AppData LOCAL, sempre separado por perfil Windows]
%LOCALAPPDATA%\CentralDark\AgenteRemoto\
  config\
    settings.json
  session\
    supabase-session.dpapi
  pairing\
    device-auth.dpapi
  logs\
    agent.log
  receipts\
    latest.json
  cache\
  state\
    state.json                 <- somente se migracao justificada

[Roaming opcional, DESATIVADO por padrao]
%APPDATA%\CentralDark\AgenteRemoto\
  preferences.json            <- somente preferencias nao sensiveis
~~~

Esses nomes e subpastas sao propostos e ainda nao sao runtime.
Nao gravar senha, chave, token, segredo, codigo de pareamento
ou payload de operacao em Roaming, cache, logs, receipts ou
Program Files. O dado cifrado DPAPI pertence ao usuario Windows.

### Mapa CURRENT -> TARGET, sem mudanca destrutiva

| Owner e caminho CURRENT medido | Target proposto | Prova pendente |
| --- | --- | --- |
| tauri.conf.json: CentralDark Halo / com.centraldark.halo / 0.1.8 / NSIS both | Agente Remoto 0.1.9 | Nome, identidade, upgrade e NSIS real |
| Cargo.toml: centraldark-halo-lite 0.1.8 | CentralDark-AgenteRemoto.exe | Build e SHA |
| session_vault.rs: LocalAppData/CentralDark/AgenteRemoto/supabase-session.dpapi | session/supabase-session.dpapi | DPAPI, rollback e readback |
| session_vault.rs: LocalAppData/CentralDark/AgenteRemoto/device-auth.dpapi | pairing/device-auth.dpapi | DPAPI, revogacao e readback |
| platform/mod.rs e settings.rs: LocalAppData/CentralDark Halo, fallback Codex Halo/settings.json | config/settings.json | Migracao sem perda |
| logging.rs: CentralDark Halo/logs/centraldark-halo.log | logs/agent.log | Limite e sanitizacao |
| platform/mod.rs: HOME/.centraldark-halo/state.json, fallback .codex-halo | state/state.json opcional | Watcher e compatibilidade |
| Install-CentralDark-Halo.ps1: ZIP antigo, LocalAppData/CentralDark Halo | Novo instalador NSIS | Nao confundir os instaladores |
| Adaptador Casa: Desktop Commander 0.2.48 com Node | MCP Rust no exe | Port e testes autorizados |

### Gates que faltam para conformidade de 100% no produto

- [ ] Motor MCP realmente no mesmo processo Rust, sem node/npx
      ou segundo executor/listener implicito.
- [ ] Login, pareamento, consentimento por sessao, autorizacao
      por operacao, revogacao e UAC separados e comprovados.
- [ ] AppData por perfil, ACL correta, DPAPI e sigilo de dados.
- [ ] Migracao atomica, backup/rollback/readback do estado antigo
      sem sobrescrever sessao valida ou excluir dados legados.
- [ ] NSIS real currentUser e perMachine, caminho observado,
      upgrade, reinstalacao, uninstall e purge somente autorizado.
- [ ] Testes E2E de MCP read-only autorizado, bloqueio sem
      aprovacao, tray, quatro overlays, reinicio e cofre.
- [ ] Rust fmt/check/clippy/test, frontend, teste de seguranca,
      SHA-256 do exe e instalador, CI e readback do mesmo HEAD.
- [ ] Writer: selo !RASTRO do codigo tocado, datas, documentos
      pertinentes, recibo !HUD no PR #1977 e NEXT_CURSOR.
- [ ] Quando o CHEFE autorizar: reconciliar C:/F: com diff seguro,
      publicar codigo/docs no mesmo commit e conferir main SHA.

TREE_SPEC_STATUS=DOCUMENTED
TREE_RELEASE_CONFORMITY=NOT_PROVEN
NEXT_CURSOR=PORTAR_MCP_RUST_NO_OWNER_EXISTENTE_E_MIGRAR_PATHS_COM_ROLLBACK_ANTES_DE_NSIS
<!-- /CENTRALDARK_AGENT_WINDOWS_TREE_20261115 -->
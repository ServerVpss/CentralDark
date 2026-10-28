# CentralDark-Remote - fonte unica de codigo local

## Readback de owners Windows + modo local-first (26/10/2026)

O unico produto continua CENTRALDARK; nao iniciar/instalar OneShot, Bridge ou gateway concorrentes. A configuracao real e `K:\scripts\remote-bridge\canonical\CENTRALDARK-REMOTE-BRIDGE.config.json`, com `local_first.enabled=true`. O Bridge executavel no checkout CURRENT e o script real `K:\scripts\remote-bridge\CentralDark-Remote-Bridge.ps1` (versionado como arquivo comum); **nao** existe `canonical\CentralDark-Remote-Bridge.ps1` neste checkout. O README humano real permanece na raiz do mesmo diretorio. O Bridge foi ajustado para escolher o JSON real de `canonical\` em vez de tentar ler o arquivo-raiz que virou mero apontamento textual num checkout Windows.

`-LocalStatus -Json` no Bridge e um diagnostico SEM escrita: Casa local (loopback), LAN do notebook quando medida, Radmin como overlay privado ja comprovado em TCP, Tailscale so com peer identificado, SSH Casa/VPS existente exclusivamente como fallback. `OPEN_UNAUTHENTICATED != TERMINAL_AUTENTICADO`. A receita `scripts/casa/CentralDark-VPS-Casa-PID-OneShot.ps1` foi preservada sem alteracoes; ela nao e uma segunda ponte geral nem autoriza WinRM notebook. O Linux no Kingston e a FORJA local, com boot nativo ou VMware rawDisk somente com disco em acesso exclusivo apos instalacao validada. A VPS opera o MESMO codigo em runtime 24/7 e recebe deltas via Git/CI/receipts, sem se tornar fonte de verdade da Casa.

**Contraprova:** nao mover arquivos, recriar alias via copia, reconfigurar rede, ligar VMware rawDisk, mudar K:/EFI/boot/WSL, executar WinRM/SSH notebook ou criar nova instancia de agente so para consertar nomes. A tabela a seguir registra aliases do projeto, mas a materializacao efetiva deve ser conferida no filesystem antes de assumir que um alias textual e symlink.

Fonte da verdade: K:\scripts\remote-bridge\canonical\ (configuracao e componentes que de fato existem); Bridge real: K:\scripts\remote-bridge\CentralDark-Remote-Bridge.ps1.

A arvore canonical reune a bandeja Windows original (motor engine, parser, menu, OAuth PKCE, harness e fixtures), a bridge Casa-VPS, configuracao, sidecar, OneShot installer e fontes do Tray/bridge. Os caminhos abaixo sao entradas de compatibilidade. Alguns sao apontamentos de texto nos checkouts Windows; nao tratá-los automaticamente como symlinks ou como uma segunda fonte de codigo.

| Alias compativel | Fonte unica |
|---|---|
| K:\scripts\remote-bridge\Build-Remote-Bridge.ps1 | canonical\Build-Remote-Bridge.ps1 |
| K:\scripts\remote-bridge\CentralDark-Context-Sidecar.ps1 | canonical\CentralDark-Context-Sidecar.ps1 |
| K:\scripts\remote-bridge\CENTRALDARK-REMOTE-BRIDGE.config.json | canonical\CENTRALDARK-REMOTE-BRIDGE.config.json |
| K:\scripts\remote-bridge\CentralDark-Remote-Bridge.ps1 | **OWNER REAL** neste checkout; preservado na raiz |
| K:\scripts\remote-bridge\CentralDark-Remote-One.go | canonical\CentralDark-Remote-One.go |
| K:\scripts\remote-bridge\README-HUMANO-BRIDGE-TAILSCALE-OAUTH.md | **OWNER REAL** neste checkout; preservado na raiz |
| K:\scripts\CentralDark-Casa-OneShot.ps1 | canonical\CentralDark-Casa-OneShot.ps1 |
| K:\Remote-Tray\CentralDark-Casa-OneShot.go | canonical\CentralDark-Casa-OneShot.go |
| K:\scripts\remote-bridge\CentralDark-Casa-Agent.mjs | canonical\CentralDark-Casa-Agent.mjs |
| K:\scripts\remote-bridge\CentralDark-Casa-Agent.test.mjs | canonical\CentralDark-Casa-Agent.test.mjs |

## Preservacao deliberada

- K:\Remote-Tray\CentralDark-Casa-OneShot.exe continua como binario de execucao/build existente; nao e fonte editavel.
- %LOCALAPPDATA%\CentralDark\Casa-Commander\ continua como copia/runtime instalado, porque o Agendador e o processo ativo usam esses caminhos. Nao transformar binarios/configuracao implantada em links vivos para a fonte.
- K:\_worktrees\centraldark-remote-name-migration-20261024\repo continua como worktree Git isolado para revisao. Nao converte-lo em link nem copiar commits implicitamente para a fonte local.
- Logs, receipts, DPAPI e sessoes OAuth permanecem em seus locais de runtime.
- Este rearranjo nao instala/reinicia a engine, nao altera tarefas agendadas, nao faz commit/push/merge nem deploy.

Separacao de estado: codigo-fonte != runtime implantado != log/receipt. O nome do produto e CentralDark-Remote; pacotes upstream sao dependencias internas.

## Validacao da centralizacao — 2026-10-24, Bahia

- 10/10 aliases simbolicos resolvem para os destinos canonicos e foram comparados por SHA-256.
- Parser PowerShell: 8/8 scripts/engine/menus passam apos corrigir apenas o marcador BOM UTF-8 do menu; o conteudo anterior do menu foi preservado byte a byte. Backup: K:\Bridge\logs\MENU-OPERACIONAL-TRAY.before-utf8bom-20261024-223358.ps1.
- JSON: 2/2 arquivos validos; agente Node: --check PASS, tests 1/1 PASS; harness historico do Tray: 18 PASS, EXIT=0; Go source: teste de compilacao PASS, sem arquivos de teste.
- EXE_GATE=UNKNOWN_SOURCE_CHECKOUT: o executavel historico do tray original nao esta nesta pasta. O binario OneShot existente em K:\Remote-Tray foi preservado e nao foi executado.
- Runtime observado depois da organizacao: http://127.0.0.1:9101/health retorna engine_connected=false, remote_vendor=false. A organizacao nao modificou instalacao, tarefas ou runtime.
- Bloqueios funcionais ainda abertos: engine sem handshake MCP provado; engine/CENTRALDARK-OAUTH-TRAY/MENU/Parser ainda incluem o endpoint de autenticacao antigo; configuracao atual tem remote_mcp legado; OAuth helper usa recurso/POST /admin/mcp, enquanto origin/main medido usa POST /api/mcp. A migracao precisa alinhar protocolo, OAuth e consumers e passar initialize + tools/list + chamada somente leitura + readback. Consolidacao de arquivos nao significa E2E.

## Git e execucao

As alteracoes locais nao foram commitadas, enviadas, mescladas nem implantadas. O worktree de revisao em K:\_worktrees\centraldark-remote-name-migration-20261024\repo permanece separado; nao transformar esse checkout de desenvolvimento em link da fonte local. O runtime instalado em %LOCALAPPDATA%\CentralDark\Casa-Commander permanece uma materializacao do pacote e nao um link vivo.

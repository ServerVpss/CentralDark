---
name: centraldark-builder-destop
description: Receita reutilizavel para operar e compilar o CENTRALDARK DESKTOP sobre VS Code/Code-OSS pelo VS Code, Cua+overlay e tasks nativas; preserva source, builder, projeto e instalador sem duplicacoes.
platforms: [windows, linux]
version: 0.1.0
owner: centraldark-operational-method
---

# CENTRALDARK DESKTOP — Self Builder Realing

**Intencao:** desenvolver e compilar um unico CENTRALDARK DESKTOP sobre o codigo MIT do microsoft/vscode, sem mudar menus, Explorer oficial, abas, navegador, terminal e Vibe Coding; primeiro o Cockpit como landing e login real, depois Hermes original como motor interno. Esta e uma **receita**, nao outro script, executor, app ou servico. Toda operacao e um delta do mesmo fio.

**Owner:** [Skill Mae](../../SKILL.md), [Hermes Visual Computer Use](../centraldark-hermes-visual-computer-use/SKILL.md), [cursor Cua](../centraldark-hermes-visual-computer-use/references/native-cursor.md), [catalogo](../../catalogo/CATALOGO.md). Checkpoint ja existente no repo: `scripts/hermes/verified-checkpoint.py` (writer) e `scripts/hermes/centraldark-entry.py` (readback), missao `centraldark-hermes-envelope-20261107`. Nenhum checkpoint ou writer paralelo.

## Bancada real: C:\CENTRALDAR DESKTOP (Casa, 07/11/2026)

| Entrada observada | Natureza real | Regra |
| --- | --- | --- |
| `centraldark desktop-1.145.2\` | SOURCE Code-OSS 1.145.2 do ZIP, `src/`, `package.json`, `build/`, `.nvmrc`, sem `.git` | Nao mover/excluir, sobretudo com VS Code aberto |
| `centraldark desktop-1.145.2.zip` | Arquivo original | Preservar |
| `projeto\` | Junction para `F:\CentralDark` (Git do projeto CentralDark), **nao a source Code-OSS** | Manter owner Git, sem clone |
| `builder\` | Junction para `centraldark desktop-1.145.2\build` (scripts nativos), **nao pasta de output** | Preservar tarefas nativas |
| `instalador\` | Pasta vazia preparada para distribuicao `.exe` | Nao alegar instalador antes do empacotamento |
| `_toolchain\` | Node 24.22.1 portatil, ZIP e checksums | Nao alterar Node global |
| `C:\CentralDarkSrc` | Junction de compatibilidade da source original, nao outra source | Preservar ate reconciliacao |

**Arquitetura:** unica raiz operacional; source original e ZIP intactos. `build/` e `node_modules/` nativos pertencem a source; VS Code dev gera `out/` na propria source. Nao dizer que SOURCE/BUILD estao fisicamente isolados ate configurar e comprovar saida separada. Setup.exe verificado deve ir a `instalador/` ao final. Builder do projeto ja existente `F:\CentralDark\BUILD-CENTRALDARK-DESKTOP.cmd` ainda usa a source Bolt; **nao o rodar supondo Code-OSS** nem sobrescrever mudancas locais antes de reconciliar.

## Metodo operacional nativo — microestados reutilizaveis

| Passo | Acao sem novo executor | Contraprova obrigatoria |
| --- | --- | --- |
| B00 | Ler Skill Mae, CURRENT, owner, NEXT_CURSOR e status Git, sem perder alteracoes | SHA/source/linha/versao |
| B01 | Focar janela VS Code atual; achar SOURCE no Explorer oficial; registrar PID, HWND, monitor | UIA visivel da source |
| B02 | Abrir `.nvmrc`, `package.json`, `.npmrc`, `product.json`, `.vscode/tasks.json` | Origem, versao e prerequisitos |
| B03 | Verificar Node/npm, MSVC/SDK, espaco em C, F e processos | Versao exigida e instalada, resultado |
| B04 | Se preciso, usar Node portatil da `_toolchain`, pin e SHA oficial | Hash e `node -v` no terminal real |
| B05 | Reusar Hermes Cua driver e overlay; descobrir UIA janela+controle vivos; clicar terminal e digitar, sem mouse fisico ou scripts duplicados | Clique despachado + efeito independente UIA/terminal |
| B06 | Executar **Install Dependencies** via task da source, `npm install`, depois ler log | Exit 0 e `node_modules/.bin`/dependencias consistentes |
| B07 | Erro = linha exata, pacote, log e ambiente; pesquisar referencias oficiais/mesmo erro em repositorios 2026; corrigir menor cone | Teste focal PASS; nao apagar caches genericamente |
| B08 | Tasks existentes `Compile` / `Install & Watch (Client)` / `Run VS Code`, Windows `scripts/code.bat` | Build exit 0, `out`, Workbench DEV, perfil isolado |
| B09 | Contraprova visual da casca; depois Cockpit primeira aba + login pelos owners existentes | Abas/menus/Explorer intactos e auth PASS |
| B10 | Hermes no mesmo motor; branding e instalador pela rota existente, nao duplicada | Processo unico, Setup.exe com SHA e instalacao testada |

**Checkpoint por microestado:** gravar `OWNER,STEP,SOURCE_VERSION,PATH,BEFORE,ACTION,EXIT,LOG,SHA,PROOF,NEXT_CURSOR` via writer existente; validar com `verify`. Novo achado vira adicao nesta Skill, depois atualizar indice pelo **script de catalogo existente**; nao criar novo loop de self builder ou daemon. Estados: `SOURCE_FOUND`, `NODE_PINNED`, `DEPS_INSTALLED`, `DEV_BUILD_OK`, `COCKPIT_LANDING_OK`, `HERMES_INTEGRATED`, `INSTALLER_TESTED`. Uma fase nao comprova a seguinte.

## Rastro da primeira execucao (07/11/2026)

- PASS: SOURCE 1.145.2 visivel e medida; `.nvmrc=24.22.1`; Node oficial portatil v24.22.1 sob `_toolchain`, SHA256 ZIP `d2046d28c2c3dcd211ac5145c0bf30e2047ef9dfb306693c8c6e2eccd8b95fa5`. Node 26 global preservado.
- PASS: UIA+cursor virtual Cua+overlay clicou `.nvmrc` e terminal no VS Code existente; PowerShell 3 recebeu digitacao; leitura `pwd=C:\CentralDarkSrc` e `node -v=v24.22.1`. SOURCE sem .git (ZIP, nao checkout).
- PASS: raiz verificada com os 4 elementos `projeto` (Git junction), `builder` (scripts native junction), `instalador` (vazio), `_toolchain` (Node).
- FAIL: `npm install` terminou exit **1**. Log original `C:\Users\Administrador\AppData\Local\npm-cache\_logs\2026-11-07T06_47_53_859Z-debug-0.log`, SHA256 `128982b4e754c7110cd52921e830f4a798a7cfb92230c160e18fb840789a6e4c`. Falha raiz **MSB4019** de `@vscode/deviceid@0.1.5`, node-gyp 12.4.0, MSBuild Visual Studio Community 2026: `MSBuild\Current\Bin\Microsoft.Common.CurrentVersion.targets` ausente. Mesmo arquivo existe no diretório `MSBuild\Current\Bin\amd64`.
- `EBUSY` / `ENOTEMPTY` sao warnings de limpeza de `node_modules` apos instalacao malsucedida, **nao prova de causa primaria**. Sem apagar source/ZIP/node_modules nem fechar VS Code por padrao. `node_modules` existe, mas `.bin` e `out` faltam: `DEPS_INSTALLED=FAIL`, `DEV_BUILD=NOT_RUN`, `INSTALLER=NOT_BUILT`.
- **NEXT_CURSOR:** diagnosticar a selecao do **MSBuild AMD64** pelo node-gyp da versao exata; aplicar configuracao no ambiente de build sem alterar Windows global; retestar pacote nativo e `npm install`; so depois compile e run.
- **KAIZEN:** `WARNING_EBUSY != ROOT_CAUSE`, `BUILDER_JUNCTION != BUILD_OUTPUT`, `PROJETO_GIT != CODEOSS_SOURCE`, `NODE_MODULES_EXISTS != INSTALL_PASS`.

## Referencias — pesquisa obrigatoria por erro exato e versao

Microsoft `microsoft/vscode`, `microsoft/vscode-wiki/How-to-Contribute.md`, `microsoft/vscode/.vscode/tasks.json`; Microsoft Learn `https://learn.microsoft.com/en-us/visualstudio/msbuild/errors/msb4019`; node-gyp `https://github.com/nodejs/node-gyp`; VS2026/Node `https://github.com/nodejs/node/issues/60861`; Void `https://github.com/voideditor/void/blob/main/VOID_CODEBASE_GUIDE.md`; VSCodium `https://github.com/VSCodium/vscodium/blob/master/docs/howto-build.md`. Referencias explicam receita; somente log de Casa e teste provam execucao. Nunca inventar FIXED_POINT.

## Delta instrumental do builder - 08/11/2026 (Casa)

- Owner existente: `C:\CENTRALDAR DESKTOP\_toolchain\node-v24.22.1-win-x64\node_modules\npm\node_modules\node-gyp\lib\find-visualstudio.js`; modificacao local em arquivo preexistente da toolchain (nao na SOURCE nem no Visual Studio global).
- Causa medida: node-gyp 12.4.0 selecionava `MSBuild/Current/Bin/MSBuild.exe` no VS2026 mesmo sem `Microsoft.Common.CurrentVersion.targets`. A instalacao AMD64 possui `MSBuild/Current/Bin/amd64/MSBuild.exe` e os targets.
- Menor delta aplicado: apenas no VS2026, CPU x64, se targets x86 ausentes e MSBuild AMD64 existir, selecionar MSBuild AMD64. Outras versoes preservam comportamento. `node --check` EXIT=0.
- Hash da biblioteca antes: `435b3292e2bf8af5bbb8edb479a89d0fbdd87d66e4a18fabfbff50d772198eec`; hash apos: `bc6ab279992a5b2536121f0514e24b66e1799cc19fd87127fd6b140ba0ccab5c`.
- `npm install` foi iniciado sobre `C:\CENTRALDAR DESKTOP\centraldark desktop-1.145.2` com Node portatil 24.22.1. Resultado final e build permanecem UNKNOWN ate processo, exit e arquivos gerados confirmados; nao declarar FIXED_POINT.
- A source de Code-OSS, ZIP, `projeto`, `builder` e `instalador` nao foram movidos. Nenhum commit/deploy associado a este delta.

## CENTRALDARK_BUILDER_VS2026_SPECTRE_GRAPH_20261108 — contraprova 08/11/2026

- CURRENT: `npm install --no-save` no terminal 2 do VS Code, source `C:\CENTRALDAR DESKTOP\centraldark desktop-1.145.2`, Node portatil `24.22.1`, terminou **EXIT=1** (`_toolchain\vscode-terminal-2-npm-exit.txt`). `node_modules\.bin\gulp.cmd` existe, mas `out/` nao existe; nao equivale a deps instaladas.
- Log de npm: `C:\Users\Administrador\AppData\Local\npm-cache\_logs\2026-11-08T03_32_52_003Z-debug-0.log`; pacote `@vscode/deviceid@0.1.5` falhou em node-gyp/MSBuild com **MSB8040**: bibliotecas Spectre x64 ausentes. MSVC 14.44.35207 e 14.51.36231 sem `lib\spectre\x64`.
- Tentativa oficial de adicionar `Microsoft.VisualStudio.Component.VC.Runtimes.x86.x64.Spectre` ao Visual Studio Community 2026 18.10.1 nao instalou o componente. Log `C:\Users\Administrador\AppData\Local\Temp\dd_setup_20261108004358_errors.log`: **0x80131500**, pacote `Microsoft.VisualStudio.Component.GraphDocument` ausente no catalogo de dependencias do VS Installer 4.10.30.62513. `vswhere -requires` nao encontra Spectre; `lib\spectre\x64` segue ausente. Nao repetir `npm install` ate corrigir VS.
- NEXT_CURSOR: reparar/atualizar catalogo oficial do Visual Studio Installer e adicionar componente Spectre pela interface oficial, com comprovacao `vswhere`, arquivo da biblioteca e exit; so depois repetir npm/compile/installer. Mudanca global do Visual Studio pode exigir aprovacao humana, e nao autoriza excluir ou limpar projeto.
- REGRAS: `MSB8040 != EBUSY`; `SETUP_EXIT_0 != COMPONENT_INSTALLED`; `NODE_MODULES_BIN_EXISTS != DEPS_PASS`; `GRAPH_DOCUMENT_MISSING != CODE_ERROR`; `UNKNOWN != PASS`.
## CENTRALDARK_BUILDER_SDK_SOURCE_RECOVERY_20261108

- INTENCAO: restaurar a fonte de instalacao Windows SDK DirectX x86 Remote solicitada pelo instalador Microsoft, sem tocar a SOURCE do Desktop nem copiar MSI de versao incorreta.
- CURRENT BEFORE: reparacao Visual Studio 2026 parada em 84%, pacote 892/907. MSI faltando em C:\ProgramData\Package Cache\{B66422CC-8E13-E396-23E2-BDDC13A965E5}v10.1.26100.8249\Installers\Windows SDK DirectX x86 Remote-x86_en-us.msi.
- OWNER MSI REAL: arquivo Microsoft ja presente em C:\Program Files (x86)\Windows Kits\10\Remote\x86\Windows SDK DirectX x86 Remote-x86_en-us.msi. WindowsInstaller COM verificou ProductCode {B66422CC-8E13-E396-23E2-BDDC13A965E5}, ProductVersion 10.1.26100.8249, ProductName Windows SDK DirectX x86 Remote.
- DELTA: copiado apenas o MSI exato para o caminho que o instalador solicitou. Nao houve overwrite. SHA256 origem = destino = 0e58ad4ac0e96bc82f1eea70c65039a41ccda9c3c1c06aad8f9dc701248379c4; CACHE_READBACK_PASS. Origem original mantida.
- COUNTERPROOF: Visual Studio Installer avancou de 84% (892/907) para 95% (898/907) e depois 99%, mensagem Concluindo...; WindowsPerformanceToolkit SDK encerrou exit 0x0. Progresso de instalacao NAO significa instalacao global PASS ate vswhere isComplete e bibliotecas Spectre comprovadas.
- NEXT_CURSOR: finalizar VS Installer, conferir isComplete, reboot, MSVC/lib/spectre/x64, retestar pacote nativo npm e somente depois build/EXE. Nao encerrar processos nem remover MSI original, ZIP, builder, projeto, worktrees ou .env.
## CENTRALDARK_SPECTRE_V1451_AND_SDK_MSI_1714_20261108

- Novo erro real durante VS Installer 18.11.12328.437: Windows SDK for Windows Store Apps DirectX x86 Remote upgrade de 10.1.26100.8249 para 10.1.26100.9457 falha ERROR 1714/System Error 1612, cache da versao antiga ausente.
- Original antigo cadastrado no WindowsInstaller: ProductCode {BE3E9622-B6F2-2F7B-6E4C-8DB55FC81143}; InstallSource C:\ProgramData\Package Cache\{BE3E9622-B6F2-2F7B-6E4C-8DB55FC81143}v10.1.26100.8249\Installers\; nome Windows SDK for Windows Store Apps DirectX x86 Remote-x86_en-us.msi. Cache LocalPackage C:\WINDOWS\Installer\ec520bb.msi tambem nao existe.
- NAO copiar MSI 9457 do Windows Kits para cache 8249: codigo de produto DIFERENTE {6EECBFA2-DF8F-4561-51DF-5BE135DFE715}, versao e hash diferentes. Isto seria pacote errado.
- Encontrei a fonte oficial de SDK antigo 26100.8249 nos downloads Microsoft Learn, link ISO de download.microsoft.com (1.159.639.040 bytes, Accept-Ranges). ISO baixado somente para _toolchain, para extrair e verificar EXATAMENTE o MSI de 8249 sem mexer na SOURCE nem instalador/EXE.
- No VS Installer pela UI Automation foram escolhidos Componentes individuais, pesquisa Spectre, e somente Bibliotecas C++ com mitigacao do Spectre para x64/x86 (MSVC v14.51); selecionado OFF->ON, readback confirmado, Modificar acionado pelo owner nativo. No momento de documentar a instalacao aguardava o SDK; nao declarar Spectre instalado antes de existir VC/Tools/MSVC/14.51.36231/lib/spectre/x64 e build nativo passar.
- NEXT_CURSOR: extrair MSI original correto do ISO oficial, verificar ProductCode+Version+SHA, restaurar cache exato sem overwrite, repetir a instalacao nativa do VS, testar Spectre, npm install e compile. Sem uninstalls, limpeza de cache, mexer em Windows Installer registry, ou copiar pacote de versao incompatível.
## CENTRALDARK_VS2026_WINSDK_SPECTRE_GUI_GREEN_20261108

- CURRENT: C:\CENTRALDAR DESKTOP preservado. Source original Code-OSS 1.145.2 e ZIP intactos; projeto junction F:\CentralDark; builder junction para build nativo; instalador intacto.
- Problema: VS Installer exibia Win11SDK_10.0.26100 pacote 1 de 51 e 0%; SDK interno estava trabalhando em MSIs individualmente, apesar do 0% externo. Erros reais anteriores: Windows Installer 1714/1612 por fontes MSI originais 10.1.26100.8249 ausentes, nao falha de codigo.
- Menor delta: ISO oficial da Microsoft 26100.8249, 1.159.639.040 bytes, SHA256 239d1505a6e739ba0a64712008198136186013d4b68c86389afe96112076b9dd, montada somente leitura; recuperados arquivos MSI exatos no Package Cache apos conferir ProductCode/ProductVersion/Manufacturer, sem overwrite nem registro manual.
- Prova SDK: C:\Users\Administrador\AppData\Local\Temp\windowssdk\dd_setup_20261108020126_001_Win11SDK_10.0.26100.winsdksetup_1.log registra i399 Apply complete result 0x0, restart None as 02:32:30 BRT.
- Prova Visual Studio: vswhere VS Community 2026 18.11.12328.437 isComplete=true, isRebootRequired=false, isLaunchable=true; UI Installer mostra Todas as instalacoes estao atualizadas, Modificar e Iniciar.
- Prova Spectre: MSVC 14.51.36231 lib/spectre/x64 presente; vcruntime.lib SHA256 ff1a30ac7b1bffb62a7c0a72c44818c47d58c8ae71a4db86f90d948036c9b992.
- Checkpoint existente: scripts/hermes/verified-checkpoint.py, step codeoss-vs2026-sdk-spectre-fixed-readback-20261108, VERIFIED_100, HASH_CHAIN_PASS 8 events, SHA256 27a7ff86c17bac33cbd7d9735cbe4237189ed7f1526a674fc9afbd4f72e3c3d1.
- Visual via Cua+overlay owner blink_cursor.py --monitor 4 --mode position: exit 0, recibo hermes-visual-cursor-37784a3f2e. Confirmacao humana nao inferida. Cua click terminal VS Code recebido hermes-visual-cursor-ac96eb6cb8, mas digitacao nao produziu prova de shell: UI_TYPING=UNKNOWN.
- NEXT_CURSOR: npm install --no-save --no-audit --no-fund iniciado na source Code-OSS com Node portatil 24.22.1 as 02:37:07, exit final ainda UNKNOWN neste registro. Compilar so apos validar exit, package-lock e binarios; nao confundir VS_INSTALLER_FIXED_POINT com DESKTOP_BUILD_FIXED_POINT. Sem exclusao, commit nem deploy.
## CENTRALDARK_TREE_SITTER_LNK1104_FOCAL_20261108 — BUILDER ainda PENDENTE

- Visual Studio Installer e SDK agora FIXED_POINT=PASS isolado: UI mostrou Todas as instalacoes estao atualizadas; vswhere isComplete=True, isRebootRequired=False; WinSDK 26100 i399 result 0x0; biblioteca Spectre MSVC 14.51 x64 com hash validado. Nao voltar a reinstalar nem limpar o VS.
- A nova instalacao npm raiz na SOURCE com Node 24.22.1 chegou ao postinstall mas terminou EXIT=1 em build/node_modules/tree-sitter 0.25.1, node-gyp 12.4.0, erro fatal LNK1104 OLDNAMES.lib. Deviceid windows.node compilou; root package-lock SHA256 904db6bc1b00a59fa32c4f5bee936ca9f57b9c9e679310ea199ece3236fbd2ff preservado.
- Contraprova: OLDNAMES.lib NAO existe no MSVC padrao 14.51/lib/x64, mas EXISTE no MSVC 14.51/lib/spectre/x64 (SHA256 1b6509eed63ee6dd37a150902c12aa3b09e5174ba0f1a143e590cd514589e62a); existe tambem em onecore/x64. Nao copiar arquivo do OneCore nem Spectre para lib/x64 global: owner da lib e Visual Studio, nao da source.
- Menor teste focal: repetir npm install --no-save --no-audit --no-fund apenas no diretorio SOURCE/build, com LIB no AMBIENTE LOCAL do processo apontando para Spectre/x64. Teste terminou EXIT=1, mesmo LNK1104; portanto LIB ambiental isolado NAO foi suficiente para a rota MSBuild do node-gyp. Nada foi deletado/copiado; build/package-lock SHA256 2975565119f8cb74d44eb74bd6a2c166027eafa953ddb863b125d3df7875d2a7 preservado.
- Log exato: F:\cache\npm\_logs\2026-11-08T05_50_24_562Z-debug-0.log linha 875, SHA256 a87b39ccd29d7729c1be13fdf42df27d3167a7f4ead9be7fde5c7b92354518f6. Diagnostico nao e mais MSB4019, MSB8040 ou EBUSY: erro bloqueante agora LNK1104 OLDNAMES.lib de tree-sitter_runtime_binding.vcxproj.
- PowerShell wrapper: ErrorActionPreference=Stop converte warning stderr do npm em excecao antes da leitura de codigo real; usar Continue com readback de LASTEXITCODE, sem classificar warnings como falha.
- ISO Microsoft de recuperacao SDK permanece preservada fisicamente em _toolchain; montagem temporaria G: desativada, Get-DiskImage Attached=False, sem excluir ISO nem pacote original; preserve SOURCE/ZIP/projeto/builder/instalador/.env.
- NEXT_CURSOR: localizar a propriedade efetiva LibraryPath/SpectreMitigation/AdditionalLibraryDirectories e o owner native do node-gyp/MSBuild existente; testar caminho LIBPATH especifico no cone de tree-sitter sem editar Visual Studio global; depois npm/install, compile, Cockpit e EXE. BUILD_FIXED_POINT=NAO; nenhum commit/deploy.
## CENTRALDARK_VSCODE_SOURCE_COMPILE_DEPS_20261108

- INTENCAO: continuar a compilacao Code-OSS com metodo operacional CentralDark dentro da janela existente VS Code, mantendo SOURCE/ZIP/projeto/builder/instalador.
- JANELA OWNER: VS Code direita PID=3704, HWND=132994, DISPLAY1 (monitor Cua numero 1, bounds x=1920..3000, y=-831..1089). Terminal dividido 2 pwsh: UIA Entrada de terminal. Cua blink_cursor.py clique x2260 y-279, recibo hermes-visual-cursor-35fbe1660b, exit=0. UIA foco + Win32 foreground HWND comprovados. Input Cua Chromium background retornou background_unavailable, foreground effect=unverifiable; o recibo independente do comando pwd nao surgiu, mesmo apos press_key return. Nao alegar comandos no terminal VS Code. Sessao Cua encerrada active=false.
- COPILOT: esbuild@0.28.1 pinado instalado no proprio extensions/copilot, EXIT 0; package-lock SHA256 6afef69aec0727ab9423d22e7db6521f702557dd27dc5f5d1f18dc4736a573fb mantido.
- EXTENSIONS: esbuild@0.28.1 pinado instalado no diretorio extensions, EXIT 0; package-lock SHA256 0d9fa75afa7d03ab89ff0a0a52cbc63c53d552959696dc2334380e6773d66ecb mantido.
- MARKDOWN_EDITOR: falha de compile-client ERR_MODULE_NOT_FOUND @vscode/markdown-editor foi enfrentada usando owner existente: build/npm/dirs.ts + build/npm/postinstall.ts. npm run postinstall passa npm_command=run e nao instala nas subpastas. Executar diretamente com Node portatil e npm_command=install instala a arvore de >50 subpastas existentes; readback markdown-editor presente no proprio node_modules e hash.
- CONTRAPROVA: a fase de dependencia nativa terminou, mas postinstall global EXIT=1 porque build/npm/postinstall.ts:317 chama git config pull.rebase merges e source extraida do ZIP nao tem .git. Nao inventar clone Git, nao tocar global config, nao declarar postinstall PASS.
- COMPILACAO EM CURSO: 08/11/2026 04:07:28 BRT, npm run compile iniciado na SOURCE Code-OSS, com LINK somente neste processo para MSVC 14.51 Spectre. Copilot bundling completou; Gulp compilou dezenas de extensoes e media com 0 errors. out/main.js, out/mainImpl.js, out/vs/workbench/workbench.desktop.main.js, out/vs/code/electron-main/main.js observados. Falta EXIT final e teste da janela.
- FIXED_POINT: FULL_DESKTOP ainda PENDENTE; GENERATED_OUT != COMPILE_EXIT_0 != RUNTIME_TESTED. Nao houve push/commit/deploy/installer.
- NEXT_CURSOR: ler exit da compilacao 34224, verificar artefatos e app nativo com perfis isolados, integrar Cockpit/login em owner existente sem perder Explorer/abas/menus.
- MARKDOWN_EDITOR_PACKAGE_SHA256=df0aac1c9e6bb776fe8091eace72a6775942e6eae69cd5950fe4638b69f6af9f

## CENTRALDARK_CODEOSS_NATIVE_COMPILE_ELECTRON_CLI_PASS_20261108

- **SOURCE:** C:\CENTRALDAR DESKTOP\centraldark desktop-1.145.2; compilacao nativa do Code-OSS 1.145.2, no mesmo owner, sem migrar, duplicar, sobrescrever ou remover SOURCE, ZIP, junctions, .env.
- **Copilot:** extensions/copilot/ package-lock SHA256 6afef69aec0727ab9423d22e7db6521f702557dd27dc5f5d1f18dc4736a573fb mantido; npm install --no-save exit 0, esbuild instalado localmente.
- **COMPILACAO:** npm run compile (scripts compile-client e compile-copilot), EXIT 0, log mostrou compile-src com 0 erros, compile Copilot esbuild concluido. Out/vs/workbench/workbench.desktop.main.js presente. Foi preciso executar pelo processo autorizado da Casa porque tentativa de digitar no terminal existente do VS Code nao gerou recibo; nao declarar UI_INPUT=PASS.
- **ELECTRON:** npm run electron, EXIT 0, baixou runtime oficial de acordo com .npmrc target=43.8.3, no diretorio preexistente .build/electron; Code - OSS.exe = 239554048 bytes; SHA256 cffb420f19c8fbf4270c2f10ee4a453f7b0a07488b0915b30cc7a13c877f2c56; execucao nativa do CLI '--version' retornou v43.8.3 e EXIT 0. Binario runtime de desenvolvimento NAO significa instalador CentralDark final nem cockpit integrado.
- **PACOTES PRESERVADOS**: package-lock raiz SHA256 904db6bc1b00a59fa32c4f5bee936ca9f57b9c9e679310ea199ece3236fbd2ff; build/package-lock SHA256 2975565119f8cb74d44eb74bd6a2c166027eafa953ddb863b125d3df7875d2a7; Copilot package-lock acima.
- **RECIBO OWNER HERMES** scripts/hermes/verified-checkpoint.py mission centraldark-hermes-envelope-20261107, step codeoss-11452-compile-electron-runtime-cli-pass-20261108, status VERIFIED_100, HASH_CHAIN_PASS 10 events, receipt SHA256 8573d5515444fa686bf55b2c72ff3b68c16c8859245fa316fdcc243288e70715.
- **LIMITES**: Foi executado CLI --version, nao janela de GUI do build em smoke test; nenhum instalador .exe distributavel, nenhum gate de CentralDark cockpit ou branded executable realizado; nao equivale a DESKTOP_FIXED_POINT. Mantidos Visual Studio Code existente e seus terminais, sem resets.
- **NEXT_CURSOR**: testar janela GUI Code-OSS compilada com readback visual independente e sem confundir VSCode ja instalado; validar resources/product, cockpit e owner de instalador nativo ja existente. Reutilizar Skill Mae e CUA via Hermes; capturar logs, contraprova, sem criacao paralela.
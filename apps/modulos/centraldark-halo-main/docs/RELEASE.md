# Release guide

## Gates

- `pnpm check`
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`
- `cargo test --manifest-path src-tauri/Cargo.toml`
- isolated Hook install → reinstall → uninstall preservation tests on both OSes
- macOS Intel packaged-app smoke test (overlay, click-through, tray, Demo,
  settings, logs, notification, quit)
- macOS install/verify/uninstall cycle repeated three times
- Universal binary verified with `lipo <binary> -verify_arch x86_64 arm64`
- Windows x64 and macOS target workflows green
- README claims match actual device versus CI evidence

## Build artifacts

```bash
bash scripts/release/package-macos.sh 0.1.8
```

This runs the complete Tauri Universal app bundler, verifies both architectures,
then stages the app, installers, adapter, hook manager, state test, and release
README into `CentralDark-Halo-macOS-Universal-v0.1.8.zip`. It does not hand-assemble an
incomplete `.app`.

From Windows PowerShell:

```powershell
./scripts/release/package-windows.ps1 0.1.8
```

Output: `CentralDark-Halo-Windows-x64-v0.1.8.zip`.

## Version and publish

Version values in `package.json`, `src-tauri/Cargo.toml`, and
`src-tauri/tauri.conf.json` must match. Push reviewed `main`, wait for CI, then:

```bash
git tag -a v0.1.8 -m "CentralDark Halo v0.1.8"
git push origin v0.1.8
```

The tag workflow independently rebuilds both packages and creates the GitHub
Release from `docs/RELEASE_NOTES_v0.1.8.md`.

## Honest validation labels

- **Real-device tested**: exercised on that physical OS/architecture.
- **CI build validated**: compiled/packaged and statically checked in Actions.
- **Universal verified**: the packaged Mach-O contains both architecture slices.

These labels are not interchangeable.

## Known v0.1 boundaries

- unsigned/not notarized;
- primary monitor only;
- ZIP rather than DMG/MSI;
- real-device validation on macOS Intel; Apple Silicon/Windows await community
  or dedicated hardware smoke tests.

<!-- CENTRALDARK_REMOTE_AGENT_DEV_20261114 -->
## Gates adicionais do Agente Remoto Rust/Tauri (14/11/2026)

O ZIP e os scripts 0.1.8 acima são históricos. Alterar o React em DEV não publica um novo executável.

1. Frontend: npm run typecheck; npm run lint; npm run build. Conferir que BridgePanel.jsx seja validado e não apenas ignorado pelo ESLint. Uma entrada dist/index.html.
2. Rust: cargo fmt --manifest-path src-tauri/Cargo.toml --check, cargo check --manifest-path src-tauri/Cargo.toml, cargo test e auditoria do cofre DPAPI e endpoints MCP. Medição anterior: cargo check --offline falhou porque encoding_rs não estava disponível.
3. DEV nativo: npm run tauri -- dev, com porta 1420 livre antes do início. Inspecionar janela, bandeja, React HMR, rebuild Rust, login, recuperação após reabrir, logout e efeitos Halo sem regressão.
4. Suporte remoto: aprovação explícita, heartbeat PAIRED_VERIFIED, tools/list autenticado e chamada de leitura com recibo; login não é prova de execução.
5. Distribuição: construir NSIS no Tauri, testar as opções de instalação (usuário/todos) e o UAC, assinar quando aplicável, conferir SHA/readback, desinstalar e voltar ao binário antigo em teste isolado antes de promover.

**STATUS (14/11/2026):** fonte React e Rust/Tauri DEV compilados e janela BridgePanel renderizada; 4 overlays Halo e bandeja registrados no log. Isso NÃO é release empacotada. Novo instalador NSIS, persistência DPAPI após reinício, consentimento, heartbeat e E2E de suporte remoto continuam PENDENTES. **NEXT_CURSOR:** validar sessões e permissões, executar gates de release, empacotar/testar com rollback e só então publicar com SHA/readback.
<!-- /CENTRALDARK_REMOTE_AGENT_DEV_20261114 -->


<!-- CENTRALDARK_NATIVE_WINDOW_20261114 -->
### Recibo de build DEV — moldura Bridge/Tauri (14/11/2026, Bahia)

- npm run lint e npm run build: PASS; TypeScript PASS; um dist/index.html.
- Tauri DEV Rust: compilou e executou com janela sem barra branca, bandeja e quatro overlays registrados em logs.
- Botões da moldura testados pelo próprio renderer: maximizar PASS; restaurar PASS; minimizar PASS; ocultar para bandeja PASS com processo vivo; janela restaurada após teste.
- Debug EXE: src-tauri/target/debug/centraldark-halo-lite.exe, 26.114.048 bytes (26,11 MB), SHA-256 BD5AE5E2156B64EB5022F99A6044B09C088EADE9D80A5E3BB1A8C2CD1CB1D2BC.
- Conectores: Casa Agent, Tailscale e MCP públicos observados; rotas de leitura integradas ao código nativo. O painel ainda não foi testado em uma sessão Supabase autenticada após o último build.
- Sem prova: renovação DPAPI após reinício, pareamento nativo E2E, autorização de ferramenta remota, motor de start Bridge, Release otimizada e instalador NSIS.

Nenhum instalador antigo foi substituído, nenhum commit/push declarado. NEXT_CURSOR: completar funcionalidades e gates restantes, teste de cliente autorizado, release com SHA/readback e rollback.
<!-- /CENTRALDARK_NATIVE_WINDOW_20261114 -->


<!-- CENTRALDARK_CLIENT_UI_RESPONSIVE_20261114 -->
### Recibo do delta de nomenclatura e responsividade — 14/11/2026

- npm run lint: PASS.
- npm run build (inclui tsc --noEmit): PASS, 1699 módulos Vite.
- HMR React no Tauri: HTTP 200 na porta 1420, interface reapresentada.
- UIAutomation: Agente Remoto, Iniciar atendimento e Abrir painel encontrados; Remote Bridge, Iniciar Bridge e RUST / TAURI não encontrados. Confirmação de pareamento duplicada eliminada.
- Contraprova visual: largura estreita mostrou uma coluna; após ajuste anti-encolhimento, hero, cabeçalho, cartões e botões legíveis e roláveis; geometria anterior da janela restaurada exatamente.
- Escopo: frontend e CSS, sem reinstalar/recompilar Rust, sem trocar motor, executor, HTML ou janela. Binário nativo DEV existente continua em execução; NSIS Release não comprovado.

**NEXT_CURSOR:** manter a interface final, validar sessão nativa e autorização remota, depois empacotar e testar Release com recibos e rollback.
<!-- /CENTRALDARK_CLIENT_UI_RESPONSIVE_20261114 -->


<!-- CENTRALDARK_RELEASE_DOCUMENTATION_GATE_20261115 -->
## Contrato fixo: codigo + documentacao de release no mesmo delta

OWNER: este docs/RELEASE.md define a regra; docs/RELEASE_NOTES_vX.Y.Z.md e o registro individual de cada versao. Herdar tambem RULES.md e AGENTS.md da CentralDark quando o modulo estiver no repositorio principal.

**OBRIGACAO DE QUEM ALTERAR CODIGO:**
1. Todo delta material de codigo, UI, configuracao, dependencias, instalacao ou testes deve atualizar NO MESMO COMMIT este docs/RELEASE.md e as notas da versao candidata, com timestamp UTC real, arquivos/efeito, resultado de teste, limitacoes, owner e NEXT_CURSOR. Mudar apenas a data, sem evidencias, nao cumpre.
2. Atualizar o campo LAST_UPDATED_UTC deste guia e RELEASE_LAST_UPDATED_UTC nas notas da candidata usando ISO-8601 UTC com milissegundos. Nunca inventar hora ou declarar release sem tag, instalador e readback. Nao apagar entradas anteriores.
3. Cada release possui um unico docs/RELEASE_NOTES_vX.Y.Z.md. Durante desenvolvimento ele fica DRAFT. Depois de tag + publicacao e readback, suas notas sao historicas e congeladas. Mudancas posteriores entram na proxima candidata.
4. O CI/PR deve barrar mudanca de codigo sem o mesmo diff alterar docs/RELEASE.md e RELEASE_NOTES_vX.Y.Z.md com seus campos de atualizacao. Gate sera checado no workflow .github/workflows/ci.yml do mesmo owner. Enquanto este projeto local nao for versionado/sincronizado com CI efetivo, CI_GATE=NOT_PROVEN.
5. Para empacotar, as versoes de package.json, src-tauri/Cargo.toml e src-tauri/tauri.conf.json precisam coincidir. Exigir testes React, Rust, seguranca, permissao, instalacao, rollback, SHA-256, tag e readback; a simples compilacao DEV nao e release.
6. Se codigo e notas nao estiverem no mesmo commit, marcar RELEASE_DOC_SYNC=PENDING e FIXED_POINT=NO; nao criar outro ledger ou forjar green.

7. RASTRO SEMANTICO: documentar no proprio owner o proposito, motivo,
   contrato, limites, dependencias, efeitos e testes de cada funcao publica,
   de estado, I/O ou seguranca nao obvia. JSDoc com @rastro (JS/TS),
   Rustdoc com !RASTRO (Rust) e comentarios nativos nos scripts.
   A documentacao externa nao substitui esse contrato no codigo.
8. O CI existente exige marcador em arquivo fonte alterado e as notas da
   release no mesmo diff, mas nao mede qualidade semantica por funcao.
   Revisao humana/IA precisa comprovar o motivo real do codigo.
   Codigo historico sera reconciliado incrementalmente, sem comentarios
   genericos para fazer contagem artificial.

### Cadeado sequencial do writer (fase atual da v0.1.9)

PRE_EDIT -> OWNER_READ -> CODE_SEAL -> DOC_SCOPE_REVIEW -> DOC_DATES ->
TEST_COUNTERPROOF -> HUD_RASTRO_READBACK -> AUTHORIZED_COMMIT ->
MAIN_SHA_READBACK. Se qualquer prova faltar, STATE=BLOCKED/PENDING,
nao FIXED_POINT. O writer unico do owner e responsavel por 100% do
escopo documental MATERIAL, identificando caminho de cada nota necessaria.
Documento nao atingido pelo delta deve permanecer intacto com
NOOP_JUSTIFIED. Nao reescrever os 22 documentos legados em massa.

Para cada arquivo fonte COMENTAVEL alterado, o mesmo diff precisa
adicionar ou atualizar o selo adjacente @rastro/!RASTRO, @owner,
@doc_ref e @last_updated. Comentario generico ou selo em funcao nao
relacionada nao satisfaz revisao semantica. Para JSON/config sem
comentarios, registrar a semantica no documento proprietario.

Para cada documento alterado, registrar em seu proprio arquivo
LAST_UPDATED_UTC (ou RELEASE_LAST_UPDATED_UTC para notas da versao),
com UTC real. As notas da candidata listam DOC_SCOPE_REVIEW_UTC (igual ao timestamp da release), DOC_SCOPE_UPDATED com
todos os caminhos atualizados e DOC_SCOPE_REVIEWED_NOOP com os
documentos analisados e preservados. O gate confere estrutura e diff;
revisor confere necessidade, cronologia e qualidade.

O campo HUD_RECEIPT_REF referencia a missao existente; nao criar
segundo HUD, PR, writer ou checkout. Antes de commitar, exigir recibo
da mudanca real e autorizacao. Depois: CI no MESMO HEAD, SHA/readback
em main e atualizacao do funil. Em C: sem Git, apenas preflight e
teste local podem ser provados; CI remoto = NOT_RUN.
CODE_SEMANTIC_TRACE=CRITICAL_OWNERS_DOCUMENTED_PARTIAL_AUDIT
CODE_SEMANTIC_TRACE_GATE_LOCAL_SMOKE=PASS_POSITIVE_AND_3_NEGATIVE_CASES
SEMANTIC_MARKER_QUALITY_REVIEW=MANUAL_REQUIRED
DOC_SCOPE_GATE_LOCAL_SMOKE=PASS_STALE_DATE_AND_OMITTED_PATH_BLOCKED
EDITOR_PRE_WRITE_INTERCEPTION=NOT_AVAILABLE_CI_BLOCKS_PROMOTION
FRONTEND_ESLINT=PASS
FRONTEND_TYPESCRIPT_VITE_BUILD=PASS
RUSTFMT_CHECK=FAIL_FORMAT_DIFF_EXISTING_CODE_NOT_REFORMATTED
CARGO_CHECK_AFTER_COMMENT_DELTA=NOT_RUN
REMOTE_GITHUB_CI=NOT_RUN
RELEASE_SOURCE_SYNC=LOCAL_ONLY_NOT_COMMITTED
HEURISTIC_SOURCE_FILES=34
HEURISTIC_FUNCTION_DECLARATIONS=152
HEURISTIC_DOCUMENT_FILES=22
### Registro de versoes — CURRENT e candidata

| Versao | Estado | Ultima atualizacao registrada (UTC) | Fonte |
| --- | --- | --- | --- |
| v0.1.8 | Ultima versao dos manifests e notas historicas | UNKNOWN; nao inferir timestamp de publicacao por mtime | docs/RELEASE_NOTES_v0.1.8.md |
| v0.1.9 | Candidata de desenvolvimento, NAO publicada | 2026-11-15T04:14:35.517Z (rascunho local) | docs/RELEASE_NOTES_v0.1.9.md |

CURRENT_MANIFEST_VERSION=0.1.8
NEXT_RELEASE_CANDIDATE=0.1.9
RELEASE_CANDIDATE_STATUS=DRAFT_NOT_RELEASED
LAST_UPDATED_UTC=2026-11-15T04:14:35.517Z
RELEASE_DOC_SYNC=LOCAL_ONLY_NOT_COMMITTED

**Delta documentado:** regra de release por owner/versao criada. Workflow PR e push main atualizado com gate de rastreabilidade; smoke local positivo/negativo PASS, sintaxe Bash PASS; CI remoto ainda NOT_RUN. Historico v0.1.8 preservado; nenhum manifesto, instalador ou versao distribuida foi alterado.

**NEXT_CURSOR:** verificar gate e notas, reconciliar C: com owner versionado em F: sem perder mudancas, publicar codigo+docs no mesmo SHA por fluxo protegido e entao testar Release real.
<!-- /CENTRALDARK_RELEASE_DOCUMENTATION_GATE_20261115 -->
<!-- CENTRALDARK_ROOT_DOCS_SYNC_20261115 -->
### Sincronização dos documentos da raiz (candidata v0.1.9)

LAST_ROOT_DOCS_SYNC_UTC=2026-11-15T03:18:45.001Z

- CHANGELOG.md: seção Unreleased v0.1.9 com fatos DEV e limites.
- CONTRIBUTING.md: instrução de atualizar código e documentação no mesmo commit, com provas.
- README.md / README_CN.md: candidato v0.1.9 distinguido dos pacotes históricos 0.1.8.
- SECURITY.md: separação entre Halo somente local e o Agente Remoto com conta, DPAPI e consentimento.
- CODE_OF_CONDUCT.md: lido e preservado; não houve mudança de conduta que justificasse edição.
- Não alterar manifests, instalador, tags, políticas ou código apenas por atualização documental.

**Prova:** inspeção de conteúdo e readback de hashes na Casa; release/CI efetivo e sincronização no GitHub continuam pendentes. **NEXT_CURSOR:** reconciliar com owner Git F: e publicar no fluxo protegido apenas os arquivos comprovados junto ao código, executando gate real.
<!-- /CENTRALDARK_ROOT_DOCS_SYNC_20261115 -->
<!-- CENTRALDARK_DESKTOP_COMMANDER_FORK_NATIVE_PORT_20261115 -->
### Fonte do motor nativo (15/11/2026)

LAST_FORK_SOURCE_REVIEW_UTC=2026-11-15T04:01:54.242Z
FORK_REPO=ServerVpss/DesktopCommanderMCP
FORK_SOURCE_SHA=bce370e9395f5bc74eda34913e5ae1dee48df8f8
FORK_PARENT=wonderwhy-er/DesktopCommanderMCP
FORK_LICENSE=MIT
CASA_PINNED_ENGINE=0.2.48
FORK_HEAD_ENGINE=0.3.3
FORK_CREATED=PASS
NATIVE_MCP_ENGINE_IN_TAURI=NOT_IMPLEMENTED
SINGLE_EXE_NATIVE_RUNTIME=NOT_PROVEN

O fork nao foi acoplado ao build: copiar JS nao equivale a motor Rust.
Documentacao de origem: docs/ARCHITECTURE.md. A cada funcao MCP
portada, selar o codigo (@owner/@doc_ref/@last_updated), atualizar
o escopo documental e testar tools/list/tools/call e a autorizacao
da sessao. Nao modificar o adaptador Casa funcional nem o fork
sem comparar contratos. Sem CI GitHub/commit/release nesta etapa.
<!-- /CENTRALDARK_DESKTOP_COMMANDER_FORK_NATIVE_PORT_20261115 -->

<!-- CENTRALDARK_AGENT_WINDOWS_TREE_20261115 -->
## Gate final da arvore Windows v0.1.9
TREE_LAST_UPDATED_UTC=2026-11-15T04:14:35.517Z
TREE_CANONICAL=docs/INSTALLATION.md
TREE_SPEC=DOCUMENTED_TARGET
TREE_RUNTIME_CONFORMITY=NOT_PROVEN
CURRENT_NSIS_INSTALLMODE=both
NATIVE_MCP_IN_EXE=NOT_IMPLEMENTED
NSIS_BOTH_MODES_TESTED=NO
Verificar motor unico no exe, instalacao por usuario e maquina,
caminho efetivo em cada modo, UAC, LocalAppData e ACL/DPAPI,
migracao com rollback, upgrade/uninstall/purge, operacao MCP
com consentimento, logs sem segredos, hashes e readback.
Instalador ZIP legado Halo nao equivale ao NSIS v0.1.9.
<!-- /CENTRALDARK_AGENT_WINDOWS_TREE_20261115 -->

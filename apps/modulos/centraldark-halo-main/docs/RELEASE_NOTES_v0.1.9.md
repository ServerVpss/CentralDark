# CentralDark Agente Remoto v0.1.9 — RASCUNHO

RELEASE_VERSION=0.1.9
RELEASE_STATUS=DRAFT_NOT_RELEASED
RELEASE_LAST_UPDATED_UTC=2026-11-15T04:14:35.517Z
SOURCE_MANIFEST_VERSION=0.1.8
RELEASE_TAG=NOT_CREATED
RELEASE_INSTALLER=NOT_BUILT
RELEASE_SHA256=UNKNOWN
WINDOWS_TREE_OWNER=docs/INSTALLATION.md
WINDOWS_TREE_DOCUMENTATION=TARGET_SPEC_ONLY
WINDOWS_TREE_NATIVE_MCP=NOT_IMPLEMENTED
WINDOWS_TREE_APPDATA_MIGRATION=NOT_IMPLEMENTED
WINDOWS_TREE_NSIS_DUAL_TEST=NOT_RUN
WINDOWS_TREE_100_PERCENT_RUNTIME=NOT_PROVEN
DOC_SCOPE_UPDATED=CHANGELOG.md,README.md,README_CN.md,SECURITY.md,docs/ARCHITECTURE.md,docs/INSTALLATION.md,docs/PRIVACY.md,docs/RELEASE.md,docs/RELEASE_NOTES_v0.1.9.md,docs/TROUBLESHOOTING.md
DOC_SCOPE_REVIEW_UTC=2026-11-15T04:14:35.517Z
DOC_SCOPE_REVIEWED_NOOP=CONTRIBUTING.md,CODE_OF_CONDUCT.md,docs/RELEASE_NOTES_v0.1.8.md
DOC_SCOPE_NOOP_REASON=contributing ja rege o writer, codigo de conduta sem mudanca, notas da release 0.1.8 historicas e congeladas.
DOC_WRITER_OWNER=centraldark-halo-main (owner existente; metodo self-documentation)
HUD_MISSION_ID=CENTRALDARK_REMOTE_AGENT_HALO_RADEON
HUD_RECEIPT_REF=https://github.com/ServerVpss/CentralDark/pull/1977#issuecomment-6888674883
CODE_SEAL_RULE=TOUCHED_FUNCTION_ONLY
WORKFLOW_GATE=LOCAL_TEST_REQUIRED_REMOTE_CI_UNKNOWN


## Mudancas candidatas ja implementadas em DEV local

- Migracao da interface do Bridge existente para React + Tauri/Rust, preservando Halo e o Bridge Electron antigo.
- Moldura do cliente com arraste, minimizar, maximizar/restaurar, redimensionar e ocultar para bandeja.
- Nome exibido CentralDark Agente Remoto, sem termos internos como RUST / TAURI ou Remote Bridge.
- Responsividade do painel e login em janelas estreitas, com rolagem e cartoes sem compressao.
- Leituras de conexoes local, Tailscale e MCP separadas por estado; login Supabase e cofre DPAPI existentes preservados.

## Provas DEV existentes (nao sao prova de Release)

- npm run lint: PASS. npm run build e TypeScript: PASS.
- Tauri DEV compilou e a janela foi aberta; bandeja e quatro overlays observados em logs.
- Botoes da janela testados via UIAutomation; ocultar manteve processo vivo.
- Captura visual de layout estreito confirmou correcao da responsividade; Vite local :1420 respondeu HTTP 200.
- Rastro da etapa visual e nomes: docs/RELEASE.md e comentario no funil HUD #1977.

## Gates pendentes

- [ ] Reconciliar fonte local C: e owner versionado F:, publicar codigo e documentos no mesmo SHA.
- [ ] Provar persistencia/renovacao da sessao DPAPI apos reiniciar, logout e revogacao.
- [ ] Testar pareamento consentido e motor remoto autorizado com ferramentas do Hermes, sem segundo executor.
- [ ] Passar cargo fmt, clippy, test, seguranca e regressao no conteudo de release.
- [ ] Compilar Release/NSIS, testar UAC usuario/todos, rollback, SHA-256 e readback.
- [ ] Promover juntos os tres manifests de 0.1.8 para 0.1.9 somente no gate de release.
- [ ] Gerar tag e Release oficial, confirmar links/artefatos e so entao marcar RELEASE_STATUS=RELEASED.

## Historico de atualizacoes desta candidata

- 2026-11-15T04:14:35.517Z: unica arvore Windows TARGET documentada em docs/INSTALLATION.md; writer revisou os 10 documentos pertinentes, registrou CURRENT versus TARGET, NSIS both, dados por usuario e gates de DPAPI/migracao/rollback. Nenhum motor Rust/instalador v0.1.9 foi implementado nem arquivo existente movido. NEXT_CURSOR=NATIVE_RUST_MCP_AND_NONDESTRUCTIVE_MIGRATION_THEN_DUAL_NSIS_TEST.

- 2026-11-15T04:01:54.242Z: fork oficial criado ServerVpss/DesktopCommanderMCP (parent wonderwhy-er/DesktopCommanderMCP, MIT, HEAD bce370e9395f5bc74eda34913e5ae1dee48df8f8). Mapeada divergencia: Casa adapter usa 0.2.48, fork tem 0.3.3; health Casa HTTP 200 com engine_connected=false. Port do motor MCP ao Tauri Rust e pacote de .exe nativo NAO IMPLEMENTADOS; nao mudar adaptador antigo nem habilitar atendimento. Architecture e RELEASE atualizados; docs restantes preservados com motivo. NEXT_CURSOR=PORT_FIRST_AUTHORIZED_READ_ONLY_TOOL_AND_PROVE.

- 2026-11-15T03:52:20.307Z: CONTRAPROVA do gate final: Bash -n PASS; fixture Git isolada com selo+docs+scope+HUD PASS (exit 0); codigo sem selo BLOQUEADO (exit 1); CHANGELOG alterado com timestamp antigo BLOQUEADO (exit 1); CHANGELOG fora de DOC_SCOPE_UPDATED BLOQUEADO (exit 1). Writer continua responsavel por revisar a semantica e a completude do escopo; CI local nao impede digitacao no editor, e nao foi publicado no GitHub. Testes em fixtures isoladas apagadas ao terminar. NEXT_CURSOR=HUD_RECEIPT_AND_RECONCILE_F_WHEN_CHEFE_AUTHORIZES.

- 2026-11-15T03:50:18.521Z: correção da contraprova do gate. A lista DOC_SCOPE_UPDATED pode ser reutilizada quando a causa e os documentos sao os mesmos; DOC_SCOPE_REVIEW_UTC renovado no diff e igual ao RELEASE_LAST_UPDATED_UTC e obrigatorio. Assim, gate bloqueia revisao ausente sem forcar escrita inutil na lista. Sintaxe CI deve ser revalidada; sem CI publicado.

- 2026-11-15T03:48:20.365Z: cristalizada a lei do selo incremental no mesmo writer e nos owners existentes. Gate do CI local ampliado: selo e campos no diff por fonte tocada, escopo e data por documento, referencia do HUD; Git/main e runtime ainda nao provados. Escopo documental: CONTRIBUTING.md, docs/RELEASE.md, docs/RELEASE_NOTES_v0.1.9.md, CHANGELOG.md. Preservados por escopo: docs/ARCHITECTURE.md, docs/PRIVACY.md, docs/INSTALLATION.md, docs/TROUBLESHOOTING.md, README.md, README_CN.md, SECURITY.md, CODE_OF_CONDUCT.md e release historica v0.1.8. NEXT_CURSOR=SMOKE_GATE_SEQ_AND_KEEP_DRAFT_019.

- 2026-11-15T03:38:48.768Z: contraprova final do novo gate semantico no mesmo CI existente: bash -n PASS; delta codigo+docs+comentario exit 0; delta com docs mas sem @rastro exit 1; delta com @rastro mas sem docs exit 1. Fixture Git temporaria removida. Frontend ESLint/TypeScript/Vite PASS (1699 modulos). cargo fmt --check retornou divergencias de formatacao no Rust, por isso RUSTFMT=FAIL; nenhuma reformatacao geral aplicada. Tauri DEV com 4 overlays e tray observado em log. Versao ainda 0.1.8 nos manifests; v0.1.9 DRAFT; no commit/push. NEXT_CURSOR=REVIEW_REMAINING_FUNCTIONS_INCREMENTALLY_AND_RECONCILE_C_F.

- 2026-11-15T03:36:02.899Z: auditoria semantica: 34 arquivos-fonte, 22 documentos e 152 declaracoes de funcoes aproximadas (regex, nao AST). Comentarios de intencao em React (App, BridgePanel, RemoteAgentLogin), Rust (lib, session_vault, watcher) e CSS dos mesmos owners; sem mudar logica. CONTRIBUTING e RELEASE atualizados. CI verifica marcador por arquivo, nao semantica por funcao. NEXT_CURSOR=TESTAR_GATE_E_TESTES_DO_CODIGO; CI remoto e release ainda pendentes.

- 2026-11-15T03:18:45.001Z: reconciliados os documentos raiz CHANGELOG, CONTRIBUTING, README, README_CN e SECURITY com os fatos DEV da candidata 0.1.9; CODE_OF_CONDUCT lido e preservado. Nenhum build, release ou commit executado por esta edição. NEXT_CURSOR=RECONCILE_C_TO_F_GIT_AND_VERIFY_CI.

- 2026-11-15T03:13:14.227Z: verificado gate em repo Git temporario isolado: delta com codigo+docs EXIT=0 (PASS), codigo sem docs EXIT=1 (bloqueado), Bash -n PASS; fixture temporaria removida. A ativacao do workflow em CI remoto continua NOT_RUN.

- 2026-11-15T03:09:47.661Z: gate adicionado em .github/workflows/ci.yml; PR com mudanca de codigo precisa atualizar RELEASE.md e notas da candidata com timestamps no mesmo diff. Validacao CI em runner ainda NOT_RUN.

- 2026-11-15T03:08:29.426Z: criado DRAFT da v0.1.9 e regra documental obrigatoria. Esta nota nao afirma build nem publicacao de 0.1.9.

**A cada delta posterior:** atualizar RELEASE_LAST_UPDATED_UTC e acrescentar uma linha causal com arquivos, testes e NEXT_CURSOR, preservando este historico.

<!-- CENTRALDARK_AGENT_WINDOWS_TREE_20261115 -->
## Estado da arvore proposta
TREE_LAST_UPDATED_UTC=2026-11-15T04:14:35.517Z
TREE_CANONICAL=docs/INSTALLATION.md
O contrato documental do target esta atualizado, mas o
instalador, migracao e motor MCP Rust estao NOT_PROVEN.
<!-- /CENTRALDARK_AGENT_WINDOWS_TREE_20261115 -->

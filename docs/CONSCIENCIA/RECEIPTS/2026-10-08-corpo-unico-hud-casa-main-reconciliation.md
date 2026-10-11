# Receipt — Corpo Único HUD Casa ↔ main reconciliation

Date: 2026-10-08
Authority: SEGREDO/CHEFE
Mode: DIRECT_MAIN_MINIMUM_DELTA

## Current measured

```text
MAIN_BEFORE=4e31346ce4046d0dfab90d341bfe37b8f6a5bf02
VPS_GIT_STATUS={   "cwd": "<caminho-vps>",   "exitCode": 0,   "stdout": "?? apps/modulos/HERMES-CORE/missions/\n--- branch ---\nmain\n--- last commit ---\n743b7e9cc fix(oracle): preserve loop continuity envelope\n",   "stderr": "" }
VPS_SCRIPTS_CASA={   "status": "OK",   "root": "project",   "path": "scripts/casa",   "maxDepth": 2,   "count": 4,   "truncated": false,   "tree": [     "📄 discover-operational-channels.ps1",     "📄 garimpo-proof-gc.ps1",     "📄 promover-aprendizado-hermes.ps1",     "📄 sync-hermes-obsidian.ps1"   ] }
```

The current `main` and VPS `scripts/casa` did not contain `CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat`. The architecture already names that BAT as the Casa HUD surface, so the missing source is filled under the existing `scripts/casa` owner rather than by creating a second HUD system.

## Promoted source

```text
PATH=scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat
SOURCE_UPLOAD=CENTRALDARK-CORPO-UNICO-HUD-LOGS(4).bat
SHA256=a51cca37358f90ab6e644d3a7eb22002c4f93ef3ece5a0e01a28b545bb6479be
MODE=READ_ONLY_MONITOR
SINGLE_INSTANCE_MUTEX=true
SCREENPIPE_AUTOSTART=false
SSH_BATCHMODE=true
STRICT_HOST_KEY_CHECKING=true
UNKNOWN_IS_NOT_PASS=true
```

## Bridge comparison

```text
SOURCE_UPLOAD=CENTRALDARK-CORPO-UNICO-HUD-BRIDGE(2).ps1
SHA256=a554a7907a268980bf699aa62e5e0c7d4d8f31323dfe6611ab7a3ee2ac3631b7
PROMOTION=NOT_PROMOTED_AS_RUNTIME_OWNER
REASON=contains Start-ScreenpipeHidden and npx screenpipe record; potential second Screenpipe writer
USEFUL_DELTA=keep as candidate evidence for future owner-local absorption
```

No Casa file was overwritten by this commit. No VPS runtime mutation was executed. The commit only establishes the canonical Git source and documents the promotion boundary.

## Counterproof

```text
COMMIT != CASA_RUNTIME
COMMIT != VPS_RUNTIME
SOURCE_PRESENT != WINDOWS_E2E_PASS
BRIDGE_NOT_PROMOTED != BRIDGE_DELETED
UNKNOWN != PASS
```

NEXT_CURSOR=SYNC_CANONICAL_BAT_TO_CASA_ONLY_AFTER_ACTIVE_FILE_HASH_READBACK_AND_SINGLE_WRITER_CHECK
FIXED_POINT=FALSE


## Readback after promotion

```text
MAIN_SOURCE_READBACK_EQUALS_UPLOAD=true
MAIN_SOURCE_BLOB_SHA=431fcd24f33335ca6538ee4e7c76634d57e7976c
UPLOAD_SHA256=a51cca37358f90ab6e644d3a7eb22002c4f93ef3ece5a0e01a28b545bb6479be
BRIDGE_UPLOAD_SHA256=a554a7907a268980bf699aa62e5e0c7d4d8f31323dfe6611ab7a3ee2ac3631b7
VPS_RUNTIME_SYNC=NOT_EXECUTED
```

## 09/10/2026 — CentralDark Index + HUD CURRENT com proveniencia

**CHEFE:** atualizar o unico `CentralDark Index + HUD` em `main`, Casa Obsidian e VPS; trabalhar em frentes paralelas de leitura/subagente, sem writer concorrente.

**Before e owner:**
```text
OWNER_MAIN=docs/HUD/HUD.html
OWNER_CASA=C:\\Users\\Administrador\\Documents\\Obsidian Vault\\🪬Centraldark -HUD🪬\\HUD.html
CASA_BEFORE_SHA256=742C96AD46795723DBDA6ECE04F0C2907B3150A9A354B3D161D6381375154E47
MAIN_BEFORE_BLOB_SHA=f5295ec62e7b5c1bd3120fd3697831c0f3e2f0dd
CASA_VS_MAIN_DIFF=ONE_LINE_754_LAST_UPDATE_ONLY
CASA_OLD_LAST_UPDATE=2026-10-08_07:30_BRT
MAIN_OLD_LAST_UPDATE=2026-10-08_11:55_BRT
```

**Menor delta no mesmo `docs/HUD/HUD.html`:** inserir um quadro de proveniencia CURRENT no proprio Index/HUD, sem segundo arquivo/servico, expondo data de observacao, base main/VPS, estado Casa, inventario Triton `21 READY / 30 catalogados`, erro Kylin `INIT_FAILED:10`, cadeia de prova e `NEXT_CURSOR`. Indicador de **frescor do snapshot** passa a `STALE` apos 15 minutos; nao confundir a idade da medicao com disponibilidade de componentes. Polling One Heart 5s e logs integrados preexistentes continuam em seus owners. As cartas verdes com provas datadas 08/10 foram reclassificadas no HTML como `HISTORICO` / amarela; health 200 nao vira inferencia.

**Commits e readback:**
```text
HUD_MAIN_COMMIT_1=8252889f3436fa53ea60f4e8acc8699cae3e0ce9
HUD_MAIN_COMMIT_2=7eb0b359de5d3687fb4d8c16fef69ad09ee033af
HUD_MAIN_LAST_BLOB_SHA=2d96ace5fdc867c72408fb12b644de28a57bb637
GITHUB_SOURCE_READBACK_MATCH=PASS
CASA_AFTER_SHA256=B7DADED1EEF56E7441FE6FC6FD3ABB21D115789C83862435F4358EA757D2FA97
CASA_STAGE_SHA256=B7DADED1EEF56E7441FE6FC6FD3ABB21D115789C83862435F4358EA757D2FA97
CASA_AFTER_BYTES=165782
CASA_ORIGINAL_BACKUP_SHA256=742C96AD46795723DBDA6ECE04F0C2907B3150A9A354B3D161D6381375154E47
CASA_SOURCE_HASH_BACKCHECK=PASS
CASA_HTML_JS_SYNTAX=PASS_2_SCRIPT_BLOCKS
NO_BAT_MUTATION=true
NO_NEW_HUD=true
```

Casa foi atualizada **fisicamente** usando substituicao atomica apos conferir hash do original, com copias anteriores preservadas fora do vault no Temp. A prova do owner main foi feita lendo `docs/HUD/HUD.html` de volta em GitHub. Arquivo CSS/abas/notas/scripts do One Heart foram preservados.

**VPS/limite de execucao:** HEAD de checkout `bdf2f09ad` foi observado nesta rodada, enquanto a main avancou. O checkout tem dois artefatos nao rastreados `apps/modulos/HERMES-CORE/missions/` e `apps/modulos/mcp/src/agents/agents-main.zip`; o owner `scripts/vps/auto-sync-main.sh` bloqueia deliberadamente checkout dirty. Nao executar reset/stash/delete/merge ignorando essa trava. Workflow `vps-exec-selfhosted.yml` ja foi disparado automaticamente pela alteracao na main; seu efeito no HUD da VPS precisa de readback, e nao deve ser declarado por commit.

**Frente subagente READ_ONLY:** tentou-se o Claude CLI, bloqueado por limite semanal. Tentou-se o Codex CLI em modo `--sandbox read-only --ephemeral`, bloqueado por limite de uso; nenhum trabalho ou edicao foi atribuido falsamente ao subagente. Leituras de Casa/GitHub/VPS rodaram em paralelo por rotas autorizadas; **one writer por arquivo**.

```text
MAIN_HUD_SOURCE=PASS
CASA_PHYSICAL_HUD=PASS
CASA_VS_MAIN_SAME_STAGE_CONTENT=PASS
VPS_HUD_SYNC=UNKNOWN
VPS_RUNTIME_DEPLOY=UNKNOWN
SUBAGENT_RESULT=BLOCKED_QUOTA
FIXED_POINT_GLOBAL=FALSE
NEXT_CURSOR=MEASURE_VPS_AUTO_SYNC_GATE_AND_OWNER_FIRST_THEN_PRESERVE_UNTRACKED_THEN_SAFE_FAST_FORWARD_AND_HUD_HASH_READBACK
```

## 09/10/2026 — API CentralDark + Vault off-host Claude readback

**Intent:** CHEFE pediu reutilizar a API existente e o Vault completo off-host da VPS que o Claude deixou no Google Drive, sem novo backend/segundo cerebro. Fonte do projeto continua GitHub main; Drive e backup, nao runtime.

**Google Drive (conta conectada SONASMARCAS; metadata lida diretamente do provider):**
```text
GOOGLE_DRIVE_FOLDER=CentralDark/Vault
VAULT_ARCHIVE_BASENAME=Vault-Cofre-CentralDark-20260930T105330Z.tar.gz
VAULT_FILE_BYTES=752981967
VAULT_SHA256_SIDECAR_PRESENT=true
VAULT_EXPECTED_SHA256=383eb16f6ccd8b61585d7589aa88d0c21b10ad09a44cfc34b70bfed60946e8e4
SIDECAR_MATCHES_REPO_RECEIPT=true
VAULT_FULL_ARCHIVE_BYTES_REHASHED_THIS_TURN=false
VAULT_FULL_ARCHIVE_INTEGRITY_CURRENT=UNKNOWN
PRIVATE_GDRIVE_FILE_IDS_IN_PUBLIC_REPO=false
VAULT_PAYLOAD_COPIED_TO_PUBLIC_API=false
```

**Proveniencia preexistente:** `artifacts/centraldark-os/vault-offhost-20260930T105330Z.receipt` tinha `OFFHOST_READBACK=PASS` e o mesmo digest; `artifacts/centraldark-os/gate-c-readonly-20261001.json` manteve `GO_REINSTALL=NO`, `GATE_C=FAIL`. O `INVENTARIO-KERNEL-PROPRIO.md` cita snapshot anterior com SHA `b492b06f...` e ~16 MB para nome semelhante: snapshots/fingerprints distintos, nao presumir igualdade com o objeto Drive (~753 MB). O archive inclui arquivos de credenciais e process env; NUNCA extraí-los/publicá-los em HTTP, HTML, repo ou chat.

**Rota de API medida a partir da Casa SEGREDO sem token:**
```text
https://api.centralldark.com/health=200 (servico=hermes-core, versao=5.0)
https://api.centralldark.com/heartbeat=404
https://api.centralldark.com/v1/models=404
https://api.centralldark.com/api/operational-snapshot=404
https://api.centralldark.com/api/omni/status=404
https://api.centralldark.com/api/live-fabric/status=404
https://mcp.centralldark.com/health=200 (mcp-centraldark, toolCount=153)
https://mcp.centralldark.com/heartbeat=200 (payload not promoted as global green)
https://mcp.centralldark.com/admin/api/operational-snapshot=401 (requires auth, expected gate)
https://hub.centralldark.com/health=503
https://hub.centralldark.com/api/providers=503
```

**Arquitetura existente:** `api.centralldark.com` = entrada HTTP publica atualmente roteando o Hermes Core neste probe, nao acesso livre ao Drive privado; `mcp.centralldark.com/mcp` = control plane com auth, admin protegido; `apps/modulos/oauth-broker/server.mjs` = owner OAuth gdrive, com `/oauth/gdrive/start` e `/api/providers`; `gdrive:CentralDark/Vault` = off-host privado recuperado. `scripts/drive-ingest-once.sh` e `scripts/sync-loop.sh` sao os owners existentes para ingest de documentos de trabalho, nao para expor/restaurar Vault com segredos.

**Same file HUD update:**
```text
OWNER=docs/HUD/HUD.html
MAIN_SOURCE_COMMIT=7e9468302a5c06f5af10e0fdd3c096083d5e2d81
GITHUB_HUD_BLOB_READBACK=6eca3c7136bb683d4a2be6b0a5b47a1a202c2d16
CASA_PHYSICAL_HUD_SHA256=65FD449AC85F90ED4D28EBF4BCB92F76D5BE380BB1DCAC65091559E955CF5EF8
CASA_READBACK_MATCH_STAGE=PASS
CASA_ORIGINAL_BACKUP=PRESERVED
HUD_JS_SYNTAX=PASS_2_SCRIPT_BLOCKS
HUD_VISUALS=THREE_ORIGINAL_TABS_PRESERVED
API_BROWSER_CORS_ORIGIN=*
GOOGLE_DRIVE_VAULT=METADATA_ONLY
```

Nao houve Caddy/DNS/SSL alterados, reinstalacao, extracao de material sensivel, upload da copia privada na API publica ou workaround de auth. Toda alteracao do HUD Casa aconteceu depois de hash base e backup atomico com readback. Os objetos do Drive permanecem privados.

**VPS status:** checkout sujo (untracked Hermes missions e zip MCP) com ultimo commit `bdf2f09ad` na medicao imediatamente anterior a esta receipt. A main ja tem o HUD novo, mas API/publicador/source em runtime so podem ser considerados atualizados depois de owner deploy/CI, checkout readback e efeito observado. O endpoint Hermes Core responder nao comprova deploy do HUD.

```text
API_HERMES_HEALTH=PASS_SCOPED
MCP_HEALTH=PASS_SCOPED
DRIVE_OFFHOST_OBJECT_FOUND=PASS
DRIVE_SIDECAR_VS_RECEIPT_MATCH=PASS
DRIVE_TAR_BYTES_CURRENT_INTEGRITY=UNKNOWN
HUB_OAUTH_PUBLIC=503
VPS_HUD_MAIN_SYNC=UNKNOWN
CONTABO_MUTATION=0
GO_REINSTALL=NO
FIXED_POINT_GLOBAL=FALSE
NEXT_CURSOR=RESTORE_VPS_SYNC_OWNER_SAFELY_WITH_UNTRACKED_PRESERVATION_THEN_READBACK_HUD_FROM_API_CONTROL_PLANE
```


## 09/10/2026 — Placa MVP e telemetria Casa por metadados

INTENCAO=CONTINUAR_SITE_E_ROTAS_SEM_BLOQUEAR_POR_MODELO_LOCAL_AUSENTE
OWNER_HUD=docs/HUD/HUD.html
OWNER_ROTEADOR=apps/instinto-superior/src/routes/roteador.tsx
OWNER_TELEMETRIA=Screenpipe/Remote Desktop Commander existentes
GOAL=t_9040803d

### Readback source e runtime (medidos nesta sessão)

- Commit `d921e94e44a99de80e5117e84937114f120940d3` da `main`: placa não bloqueante no roteador e HUD único. Readback GitHub dos dois arquivos: PASS.
- VPS `main` HEAD no mesmo SHA `d921e94e4`, `git diff` desses dois arquivos vazio; untracked `HERMES-CORE/missions/`, `mcp/src/agents/agents-main.zip` e `apps/portal/` preservados.
- Fonte HUD do Git: blob `f2e81aa1cd158a75b7208ed9edc0a3a0d84a9f8f`, SHA256 `1887ef02552db71732a282b90bc3260fdfa4f081c30610b6edb6f766bd83730f`.
- Antes na Casa: blob `6eca3c7136bb683d4a2be6b0a5b47a1a202c2d16`; diff contra a main = 4 adições e 3 remoções, atualização de provenance e uma placa local; backup atômico preservado no Temp.
- Depois na Casa (mesmo Obsidian `HUD.html`, sem segundo HUD): blob `f2e81aa1cd158a75b7208ed9edc0a3a0d84a9f8f`, readback exato PASS; 170490 bytes. Original no backup: blob `6eca3c7136bb683d4a2be6b0a5b47a1a202c2d16` PASS.
- Site público `https://centralldark.com/` → HTTP 200, HTML identificado AionUi. `http://89.117.78.124:25808/` → HTTP 200, AionUi. `https://api.centralldark.com/health` → HTTP 200, JSON `servico=hermes-core`.
- `https://admin.centralldark.com/` → HTTP 200, HTML Rakazo; `/oauth/cloudflare/start` também → HTTP 200 HTML Rakazo, não comprova rota OAuth funcional. `https://hub.centralldark.com/` → HTTP 503, `BACKEND_NOT_RUNNING`.
- Casa: `screenpipe-app.exe` é PID 42552 e dono da porta 3030, `GET /health`=200 e `GET /status`=403. Processo AionUi PID 11448 e aioncore PID 20424 presentes; Remote Desktop Commander ativo, casa acessível. Não houve leitura de conteúdo de tela, áudio, câmera, teclado ou clipboard; CAPTURE_ACTIVE=UNKNOWN e DATA_DESTINATION_MEANING=UNKNOWN (conexões TCP de processo observadas apenas como metadados).
- Trigger Fabric: `TRIGGERS.yml` contém 15 gatilhos humanos, 15 tokens únicos, sem duplicata de token; `MASTER-CYCLE.yml` usa `!CENTRALDARK` como gatilho mestre e serializa mutação por owner. NO_NEW_TRIGGER e NO_NEW_ROUTER.
- O computador da Casa aceitou abrir Edge para o site, admin, API e HUD físico atualizado. A posição visual/visibilidade das abas não foi inspecionada.

### Fronteira de prova

`HTTP_200 != ADMIN_E2E_PASS`; `VPS_HEAD_ALIGNED != PUBLIC_DEPLOY`; `SCREENPIPE_PROCESS_ALIVE != SCREEN_OR_AUDIO_RECORDING_ACTIVE`; `ROTA_AUXILIAR_OFFLINE != SISTEMA_INTEIRO_OFFLINE`.

O workflow de deploy do site ainda aparecia QUEUED na última medição. O `deploy_status` indica erro de parsing no PM2 (`SyntaxError: Unexpected end of JSON input`); não traduzir isso para falha do site sem confirmação causal.

MUTATIONS_THIS_SCOPE=CASA_HUD_ATOMIC_SYNC_WITH_BACKUP; DOC_RECEIPT_APPEND_ONLY.
NO_KYLIN_RESTART=true; NO_NEW_SERVICE=true; NO_CAPTURE_ACTIVATION=true; NO_SECRET_ACCESS=true.
NEXT_CURSOR=SITE_DEPLOY_SAME_SHA_AND_PUBLIC_PLAQUE_READBACK -> ADMIN_ROUTE_OWNER -> OAUTH_ROUTE_READBACK -> OPTIONAL_RUNTIME_WARNINGS; manter site e API operantes.

## Adendo — 2026-10-11 — Corpo Unico: perfis Desktop Commander e codigo efemero

**INTENCAO:** manter o mesmo monitor WinForms da Casa, o owner `scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat` e as abas de logs; recuperar codigos temporarios de autorizacao dos dois perfis sem incluir segredos no codigo ou em receipts.

**Readback T1 (Casa, 2026-10-11 ~19:30 BRT):**
- GUI WinForms `CENTRALDARK | CORPO UNICO | HUD FIXO + LOGS AO VIVO`: **1 instancia observada**, 5 botoes presentes; 10 cards e abas preservados.
- `Conta 2`: clique Win32 recebido; o log `Corpo-Unico-HUD-Logs.txt` confirmou `Autorizacao conta2: pagina oficial com codigo temporario preenchido`. Inspecao das 100 linhas mais recentes: **nenhum codigo de dispositivo 4+4 exposto**. A autenticacao humana posterior segue `LOGIN_PENDING` na ultima contraprova, portanto nao marcar como READY.
- `Conta 1`: `desktop-commander-remote.service` ativo, autenticacao `UNKNOWN`; preservado sem restart.
- `Conta 2`: `centraldark-desktop-commander-conta2.service` ativo e isolado; a verificacao pega codigo recente do journal da unidade escolhida, monta **em memoria** URL do provedor `/verify-device?verify_device=true&user_code=<CODIGO_TEMPORARIO>`, abre navegador para confirmacao humana. Codigo **nao entra em commit, HUD nem log**; expira. Falta confirmacao por readback do provedor para selar AUTH_PASS.
- SSH `Segredo-VPS` via Git OpenSSH da Casa: BatchMode/command PASS. VPS `127.0.0.1:9100/health` e `/heartbeat`: HTTP 200 naquele instante; isso nao comprova `heartbeat.self=alive` nem `FIXED_POINT`.
- Screenpipe Casa `/health` HTTP 200 no HUD; capturas e audio continuam separados. VPS `:3030/health` respondeu HTTP 404 na leitura do HUD.
- Codigo fonte do BAT no mesmo owner subiu a `main` no commit `53a34a76f22a614eef203768f0b707aba7599044` (blob `ea4826c3cad9ba084c8ec53d89eed425906b823a`). Readback posterior: **conteudo main == Casa**, comparando LF normalizado.
- SHA-256 fisico do BAT na Casa: `6037F1D093983C2819F8F7C3A6F3E874659F90AD18EEFD7C63CBDEC6061A0741`; backup anterior preservado em `CRISTAL LOGICA/scripts/_backups`.
- VPS checkout `5344bd87074c` tinha 42 itens dirty/untracked, nao foi ressetado; `MAIN_COMMIT != VPS_DEPLOY`. O HUD HTML permanece no owner `docs/HUD/HUD.html`, com superficie azul local e dourada web distintas, sem um segundo writer. PR-mãe `#1793` permaneceu aberto/mergeable=false na consulta.
  
**Veredito escopado:** `LOCAL_HUD_GUI=PASS`; `BUTTON_CONTA2_OPEN_AUTH_URL=PASS`; `CODE_NOT_LOGGED_LAST100=PASS`; `SOURCE_MAIN_CASA_CONTENT=PASS`; `CONTA1_AUTH=UNKNOWN`; `CONTA2_AUTH=LOGIN_PENDING`; `VPS_DEPLOY=NOT_PROVEN`; `HUD_HTML_SYNC=NOT_PROVEN`; `FIXED_POINT_GLOBAL=FALSE`.

**NEXT_CURSOR:** usuario confirma login das contas no provedor → clicar `Conferir` → readback de autenticao e processo de cada unidade → reconciliar checkout dirty da VPS pelo owner existente sem reset → confrontar `docs/HUD/HUD.html` e vault Obsidian com hashes/readback antes de atualizar cadeados do escopo correto. Manter expansoes AionUi-first / Loop Vivo como possibilidades do PR #1785, nao bloqueios desta prova.

### T2 — 2026-10-11 19:37 BRT — Conta 2 Online

Contraprova posterior ao clique com codigo efemero (sem expor codigo no registro):

- `desktop-commander-remote.service` e `centraldark-desktop-commander-conta2.service`: ambos `active` no systemd.
- `centraldark-desktop-commander-conta2.service`: ultimo evento relevante do journal = `Device marked as online` / `Presence tracked` (identificador de dispositivo omitido).
- Conector Remote Desktop Commander: dispositivos `CENTRALDARK-OS` e `SEGREDO` listados **Online** na leitura T2. Isto comprova presenca dos dispositivos no escopo do conector, **nao** duas identidades provedor distintas.
- Botao `Conferir` do mesmo HUD clicado na Casa, receipt local `19:37:45 [DESKTOP] [PASS] CONTA 2 | service=loaded | process=active | autorizacao=READY_LOG`; `CONTA 1 | autorizacao=UNKNOWN`. A GUI permaneceu uma janela.
- `CONTA2_DEVICE_ONLINE=PASS` com prova dupla log do servico + dispositivo Online; `CONTA2_PROVIDER_ACCOUNT_IDENTITY=UNKNOWN`; `CONTA1_AUTH=UNKNOWN`; `TWO_DISTINCT_PROVIDER_ACCOUNTS_AUTHENTICATED=UNKNOWN`. Nenhuma alegacao de FIXED_POINT global.

Nao reabrir prova de `BUTTON_CONTA2_OPEN_AUTH_URL` ja registrada; pendencia apenas comparar qual conta efetivamente possui cada dispositivo por autentificacao legitima no provedor, sem revelar tokens.

**NEXT_CURSOR_T2:** reconciliar ownership das contas com readback autenticado do provedor → se duas contas realmente diferentes, selar so essa clausula → VPS dirty checkout separado → alinhar HTML dourado por seu writer atual e provar hash do mirror Casa/VPS.

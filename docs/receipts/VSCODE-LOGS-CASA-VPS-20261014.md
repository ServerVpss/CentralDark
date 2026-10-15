# CentralDark — ponte VS Code Casa → funil único (14/10/2026)

## Intenção e owners

- Fonte bruta privada: K:\TEMP\logs\LOGS-VS-CODE.log, com K:\TEMP redirecionado para F:\TEMP\CentralDark. Não sincronizar texto bruto para GitHub.
- Skill/receita: .agents/skills/centraldark-vscode-log-bridge/SKILL.md (somente na Forja/GitHub).
- Coletor da Casa: scripts/casa/vscode-log-bridge.ps1.
- Ingestão na VPS: scripts/vps/ingest-vscode-log.mjs (script apenas, sem copiar a skill).
- Owner de eventos já existente: apps/modulos/mcp/src/log-funnel.js (events, sectors/vscode, services/vscode).
- API proposta: GET /admin/api/logs/LOGS-VS-CODE.log, autenticada pelo gate admin existente. Front-end ou hostname externo exige prova adicional.
- Executor ativo da porta 9100 medido: /root/CentralDark_MCP_RUNTIME/apps/modulos/mcp/dist/index.js, gerenciado por centraldark-native-mcp-http.service, e NÃO o src/index.js do checkout VPS.

## Provas medidas nesta execução

| Frente | Resultado | Observação |
| --- | --- | --- |
| Arquivo da Casa | PASS | 3.027.886 bytes no início da prova, fonte preservada. |
| Leitura em simulação | PASS | 112 sinais em 65 KB; nenhum texto bruto transferido. |
| SSH privado Casa→VPS | PASS | segredo-vpss com HostName 100.90.199.124; BatchMode e host key estrita. |
| Integridade script VPS | PASS | SHA-256 antes/depois da cópia coincidiu; script inicialmente ausente. |
| Ingestão live | PASS | ACK {accepted:112, duplicate:0, offset:3027886, route:tailscale}; dados sem texto bruto. |
| Projeções | PASS | events/YYYY-MM-DD.jsonl, sectors/vscode/YYYY-MM-DD.jsonl, services/vscode/YYYY-MM-DD.jsonl observadas; 113 linhas da fonte no setor (112 sinais + heartbeat). |
| Reenvio idempotente | PASS | mesmo lote voltou 0 aceitos / 112 duplicados; correção no cursor da Casa produz 0 sinais no dry run. |
| Fallback como atenção | PASS em teste isolado | rota ssh-direct respondeu state=ATTENTION; NÃO significa que queda real da Tailscale tenha sido provocada/testada. |
| Agendamento na Casa | PASS | CentralDark-VSCode-LogBridge instalado, Ready; execução manual supervisionada LastTaskResult=0, cursor/rota preservados. |
| MCP ativo | PASS antes e após tentativa | /health em 127.0.0.1:9100 respondeu HTTP 200. |
| Fachada API no código da branch | SOURCE_ONLY | index.js, admin.js, vscode-log-route.js na branch; não confundir com runtime. |
| Tentativa protegida de aplicar dist | ROLLED_BACK | --check READY; --apply abortou após systemctl restart exceder 30 segundos. Backup feito em /root/centraldark-backups/vscode-log-route-20261014, fontes originais restauradas. |
| Rota HTTP autenticada | PASS local VPS | Depois do segundo deploy, /health 200, 401 sem login e GET 200 com cookie efêmero formado no próprio processo; segredo nunca foi impresso. |
| Systemd após rollback | RESOLVIDO + PATCH PASS | Primeiro restart excedeu 30 s e acionou rollback. O job antigo terminou com active/running; segundo deploy usou restart --no-block, esperou PID novo e provou 200+401. |

## Contraprova e próximos critérios

1. Reavaliar ActiveState, MainPID, job e /health após o systemd concluir a parada/reinício pendente.
2. Confirmar a proveniência do dist antes de novo delta; nunca substituir arquivos compilados inteiros com source diferente.
3. Só depois aplicar módulo com rollback, verificar HTTP 401 sem login e 200 com login admin; medir se mesma fonte aparece pelo filtro (não divulgar credenciais).
4. Verificar a recorrência do agendamento (mais de uma execução) e os marcadores de freshness na API.
5. Reconciliar a branch com main e checks por SHA. PR-mãe #1562 permanece ledger, não mergear.

## Leis

CURRENT>HISTORY; UNKNOWN != PASS; DOCUMENTED != EXECUTED; GITHUB != RUNTIME; MERGED != DEPLOYED.
ONE_PATH_FAILURE_IS_NOT_SYSTEM_FAILURE; PRIVATE_FIRST_WITH_SSH_DIRECT_FALLBACK; RAW_LOG_CASA_ONLY; ONE_CANONICAL_FUNNEL.
Somente eventos estruturados/sanitizados são enviados. Não publicar prompts, tokens, sessões, logs brutos ou dados de conta.

## Segunda conferência — API autenticada no runtime

- Script de aplicação: `scripts/vps/apply-vscode-log-api.mjs` com backup e rollback em `/root/centraldark-backups/vscode-log-route-20261014`.
- Retorno do deploy: `state=ROUTE_GUARDED`, `/health=200`, GET sem login `401`, `compiled_runtime_changed=true`, PID substituído.
- Probe local: `scripts/vps/probe-vscode-log-api.mjs`; usa credencial do processo apenas em memória dentro da VPS, nunca a exibe.
- Retorno do probe: `ok=true`, `code=200`, `route=tailscale`, `event_count=10` (limite solicitado), `privacy_ok=true`, `filters_ok=true`, filtro `level=warn&component=copilot` HTTP 200 e 1 evento.
- O estado retornado foi `ATTENTION` amarelo por fonte parada/sem atualização recente; não representa falha da rota Tailscale, que estava funcional.
- Isso prova o endpoint **local da VPS**, não prova exposição pelo domínio público, cobertura de todas as fontes ou sincronização com a main.
- A branch `feat/vscode-log-funnel-casa-20261014` está no PR #1820 (draft); merge/deploy do código canônico em `main` segue pendente.

## Correção da janela piscando — Casa, 14/10/2026

- Sinal do CHEFE: uma janela aparecia e sumia no desktop. A tarefa `CentralDark-VSCode-LogBridge` havia sido instalada com ação direta `C:\Program Files\PowerShell\7\pwsh.exe`, conta `Interactive`, repetição `PT1M`, `Settings.Hidden=False`, `LastTaskResult=0`.
- Causa causal: execução interativa do PowerShell a cada minuto abre janela rapidamente, mesmo que o script não escreva conteúdo visível.
- Delta mínimo: adicionar apenas `scripts/casa/vscode-log-bridge-hidden.vbs`; alterar a ação da tarefa para `C:\Windows\System32\wscript.exe //B //Nologo "K:\scripts\casa\vscode-log-bridge-hidden.vbs"`, com `WScript.Shell.Run(command,0,True)`; script principal e rota SSH preservados.
- Backups locais antes da troca: `K:\TEMP\work\vscode-hidden-fix\vscode-log-bridge.before-hidden.ps1` e `K:\TEMP\work\vscode-hidden-fix\task-before-hidden.xml`.
- Conferência de origem: `git hash-object` do script anterior `6f5a973684f32c1ca2fb50cf1f582daedf5d6b2e`, novo script `4baa51d10d4dd86243de0f0aef77fbf7daaa6e43`, launcher `446ba556be11c37f5b8d46494635bb8bd28e77f0`; a cópia foi extraída do objeto Git exato.
- Contraprova de execução: lançador invisível manual exit code `0`; Task Scheduler registrado como `wscript.exe`, `LogonType=Interactive`, trigger `PT1M`, estado `Ready`; disparo da tarefa mudou `LastRunTime` de `21:07:43` para `21:08:42` (BRT), `LastTaskResult=0`.
- Isso comprova configuração e execução invisível por contrato de sistema, mas não substitui captura visual do desktop caso a janela vista venha de **outra tarefa**. Se persistir, medir novo PID/janela no momento da ocorrência.
- O coletor de sinais, log bruto, SSH/Tailscale e API permanecem com seus donos; a skill continua exclusivamente na Forja, não na VPS.


## 15/10 — ZENDRIVE CLI usa o mesmo log-funnel (prova controlada)

- A extensão existente `skills/vs-code-restore` evoluiu para v0.1.1: comando `CentralDark: ZENDRIVE CLI (terminal existente)`, foco sem duplicar terminal, eventos de shell integrado sanitizados (`shell_start/shell_end`, classe de saída, timestamp), nunca texto do comando nem saída. Owner `skills/vs-code-restore` na `main`: commits `a716b583` (fonte), `441919de` (manifesto), `d4f1c097` (skill).
- Casa: VSIX empacotado e instalado, `code --list-extensions` confirmou `centraldark.centraldark-vscode-restore@0.1.1`; teste Node isolado de foco/eventos passou. **Não houve reload de janela nem readback de evento real da nova extensão**.
- Evento controlado de integração: linha `[INFO] [terminal] ... event=integration_probe source=controlled_test` adicionada sem segredos na fonte já existente; bytes `3027886 -> 3028022`. Agendador `CentralDark-VSCode-LogBridge` disparado; cursor atualizado para `3028022` pela rota `tailscale`.
- VPS: `logs/sectors/vscode/2026-10-15.jsonl` contém `kind=vscode_log_signal`, `key=vscode:terminal`, `end_offset=3028022`; heartbeat `accepted=1 duplicate=0`, próximo heartbeat `accepted=0`. **Pipeline real PASS para o marcador controlado; shell integration live ainda UNKNOWN**.
- Medição paralela: `hermes-gateway.service=active`, `centraldark-native-mcp-http.service=active`, `127.0.0.1:9100/health=200`; `127.0.0.1:8099/health=000` na VPS e `127.0.0.1:9222=CLOSED` na Casa. Provider `zendrive-chatgpt-local` é alias de código/simulação histórica, não API ChatGPT autenticada live.
- Não abrir segundo coletor, segundo Hermes, segundo HUD nem copiar cookies/credenciais. Tarefa continua a cada minuto; não chamar de streaming instantâneo. O PR #1820 e seu deploy/main continuam separados.


## 15/10 — readback real do comando ZENDRIVE CLI

A extensão `centraldark.centraldark-vscode-restore@0.1.1` instalada na Casa mostrou o comando `CentralDark: ZENDRIVE CLI (terminal existente)` na paleta VS Code. `InvokePattern.Invoke()` acionou o comando; o foco retornou a `xterm-helper-textarea` (Bash existente). O log `K:\TEMP\logs\LOGS-VS-CODE.log` passou de `3028022` a `3028123` bytes com `event=cli_focus exit=unknown` **emitido pela extensão real**, não por script de teste. VPS: `vscode_log_signal key=vscode:terminal end_offset=3028123` e heartbeat `accepted=1 duplicate=0 route=tailscale`; depois `accepted=0`.

A tentativa de `echo ZENDRIVE_CLI_PING_1015` no Bash remoto teve foco e Enter enviados, mas `shell_start/shell_end` não apareceu no arquivo; integração de shell remota/captura de stdout continuam NOT_PROVEN. Não promover `CLI_FOCUS_PIPELINE_PASS` a `ALL_TERMINAL_TELEMETRY_PASS`. O coletor segue com cadência de 1 minuto. Sem segundo núcleo e sem materializar logs brutos na VPS.


## 15/10 — shell_start/shell_end nativos no funil

A fonte `K:\TEMP\logs\LOGS-VS-CODE.log` recebeu mais dois eventos reais da extensão 0.1.1: `shell_start exit=unknown` (01:37:05.779Z) e `shell_end exit=ok` (01:37:05.792Z). Bytes `3028123 → 3028322`. Na VPS, `logs/sectors/vscode/2026-10-15.jsonl` registrou dois `vscode_log_signal key=vscode:terminal`, offsets `3028226` e `3028322`, heartbeat `accepted=2 duplicate=0 route=tailscale`; depois `accepted=0`. Isso comprova **pelo menos um ciclo shell_start/end capturado e ingerido**. O readback imediato após `echo` não havia mostrado evento; não vincular os dois eventos posteriores àquele comando sem correlação própria. Sem stdout nem comando em logs. 


## FIXED_POINT — recuperação automática pós-boot, 15/10/2026 10h35–10h50 BRT

**Intenção CHEFE:** preservar o que já funciona; programas fechados por escolha operacional não são falhas. Reusar esta prova no cockpit e na retomada, sem percorrer novamente toda a descoberta. Esta seção é um **receipt e contrato de observação**, não um novo coletor, daemon, serviço, HUD ou deploy.

**Owners canônicos:** Casa \`SEGREDO\` → \`scripts/casa/vscode-log-bridge.ps1\` e tarefa \`CentralDark-VSCode-LogBridge\`; VPS → \`scripts/vps/ingest-vscode-log.mjs\` e \`apps/modulos/mcp/src/log-funnel.js\`; leitura pelo cockpit existente via API admin autenticada \`GET /admin/api/logs/LOGS-VS-CODE.log\`. A skill \`.agents/skills/centraldark-vscode-log-bridge/SKILL.md\` permanece na Forja, não se copia para a VPS.

### Observação/contraprova direta

- Boot Windows Casa: **2026-10-15 10:35:43.500 -03:00**. Desktop Commander \`SEGREDO\` primeiro OFFLINE e depois ONLINE, com reconexão medida. VPS \`CENTRALDARK-OS\` ONLINE por sua conexão Remote Desktop Commander.
- Casa: \`explorer.exe=1\`, \`dwm.exe=1\`, \`Code=20\`, \`hermes=3\`, \`Windhawk=2\`, \`tailscaled=2\`; \`screenpipe-app.exe\` PID **30536** escutava na porta **3030**. PIDs e contagens são efêmeros, nunca usar como constantes de configuração.
- \`CentralDark.exe=0\` e \`Telegram.exe=0\` na medição: **fechados por estado da sessão, NÃO falhas**. Não fazer auto-start ou alertar sem política/expectativa explícita de execução. Unigram pode ter nome de processo diferente; não inferir estado completo pelo nome Telegram.
- Tailscale Casa inicialmente \`BackendState=NoState, Self.Online=false\`; após recuperação \`BackendState=Running, Self.Online=true\`. VPS \`tailscaled=active/enabled\`, \`BackendState=Running\`. Recuperação **medida**, sem reinício manual.
- Fonte privada Casa \`K:\TEMP\logs\LOGS-VS-CODE.log\`: **3.033.370 bytes**; cursor VPS \`/root/CentralDark/logs/agent-patterns/vscode-casa-cursor.json\`: **3.033.370**. Igualdade do offset confirmou ingestão até EOF naquele instante; não prova entrega de futuros eventos.
- VPS heartbeat de **2026-10-15T13:37:32.991Z**: \`route=ssh-direct,state=ATTENTION,accepted=1,offset=3032086\`. Em **13:47:59.969Z** e **13:48:37.863Z**: \`route=tailscale,state=OK,offset=3033370,accepted=0\`. Fallback direto manteve a trilha enquanto a Casa iniciava; retorno posterior ao caminho preferido. \`ATTENTION\` do fallback não equivale a indisponibilidade total.
- Tarefa agendada Casa \`CentralDark-VSCode-LogBridge\` medida como \`Running\` durante execução; depois \`LastTaskResult=0\` e \`NextRunTime=2026-10-15T10:50:21-03:00\`. Preservar lançador invisível \`wscript.exe\`, usuário interativo e cadência existente; **não reinstalar** a tarefa no boot nem criar uma segunda.
- VPS \`hermes-gateway.service=active\`; 4 serviços de runner GitHub Actions \`centraldark-vps-1..4\` ativos. \`buildkite-agent\` ausente não é falha dos runners GitHub. Não reiniciar processos Hermes apenas porque a UI não está aberta.
- DNS da VPS para \`admin.centraldark.com\` retornou \`Could not resolve host\` nesta medição; a disponibilidade pública e o renderer Electron **NÃO foram comprovados**. Não promover \`SOURCE\` a \`UI_PROVEN\`.

### Configuração selada para cockpit e retomadas futuras

**Caminho único (não criar novo):** \`LOGS-VS-CODE.log\` Casa → tarefa agendada invisível → SSH sobre Tailscale preferencial, SSH direto aprovado como fallback → ingestão idempotente VPS → \`log-funnel.js\` → endpoint admin autenticado → seção de observabilidade do **cockpit existente**. Apenas metadados sanitizados; nunca publicar log bruto, tokens, sessões, prompts ou stdout.

**Ordem curta de leitura pós-boot (somente se necessária):**
1. Ler estado Desktop Commander Casa/VPS; \`OFFLINE\` transitório durante boot não é incidente sem janela de tolerância/contraprova.
2. Conferir \`Tailscale BackendState/Self.Online\` na Casa e \`tailscaled\` na VPS. Uma rota indisponível não significa funil perdido; consultar \`route\` do heartbeat.
3. Conferir \`LastTaskResult\` da tarefa existente e comparar **tamanho atual** da fonte privada Casa com **offset** do cursor VPS. Se houver atraso, considerar cadência de um minuto e revalidar antes de alarmar.
4. Consultar heartbeat mais recente em \`logs/services/vscode/YYYY-MM-DD.jsonl\` e, quando disponível, a API admin autenticada; \`OK\` + cursor atualizado = **PASS do transporte naquele instante**, não PASS global do cockpit.
5. Se necessário, consultar processos do VS Code/Hermes/Screenpipe por presença, sem abrir aplicativos voluntariamente fechados.
6. Antes de sincronizar Git, preservar alterações locais: Casa \`main@951e241a50\`, **13 commits à frente / 179 atrás** de \`origin/main@0352b01278\`, **33 arquivos rastreados modificados** (6 staged, 27 unstaged); VPS \`fix/ai-andarilho-casa-bridge@c77e50195\`, **143 commits atrás / 0 à frente** da mesma \`main\`, **6 arquivos modificados**. Números são instantâneo, não valores fixos. Sem \`pull/reset/checkout\` sobre worktrees ativas sem reconciliação e owner único.

**Contrato visual do cockpit (sobre o owner já existente):** apresentar \`Casa\`, \`VPS\`, \`Tailscale\`, \`Funil\`, \`Hermes\`, \`Screenpipe\`, \`Último ACK\`, \`Rota ativa\`, \`Offset\` e \`Freshness\` a partir das fontes autorizadas. Estado \`CLOSED_BY_CHOICE\` / \`NOT_REQUIRED\` para aplicativos não exigidos pela sessão, nunca vermelho automático. Se a API admin estiver indisponível, usar \`UNKNOWN\` e manter a UI intacta; **não simular conectividade**. Não é implementação de renderer: apenas especificação para o owner do cockpit.

**Critério de conformidade:** objetivo **99,9%** é meta, não medição. Exige janela de observação definida, amostras reais, testes de recuperação, idempotência, privacidade, API admin autenticada e UI nativa comprovada; sem essas provas, \`CONFORMITY=NOT_MEASURED\`. \`FIXED_POINT=PARTIAL\` para o circuito Casa↔VPS; \`NEXT_CURSOR\`: cockpit owner integra a leitura ao HUD existente e comprova o runtime sem modificar a cadeia de coleta.

**Restrições:** nenhum restart, autostart de apps opcionais, segundo funil, duplicação de Hermes, reconfiguração de Tailscale, publicação de dados brutos ou merge de PRs instáveis. \`OBSERVED != ASSUMED\`; \`MAIN_COMMITTED != DEPLOYED != UI_PROVEN\`.

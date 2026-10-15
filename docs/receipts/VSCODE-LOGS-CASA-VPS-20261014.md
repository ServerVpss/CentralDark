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

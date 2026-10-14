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
| Rota HTTP autenticada | NÃO PROVADA | Sem cookie retornou HTTP 404 após rollback (alvo seria HTTP 401 sem login e 200 com login). |
| Systemd após rollback | PENDENTE | Medição mostrou unit deactivating/stop-sigterm e job restart 8150169 ainda em execução; aguardar conclusão, não reiniciar em paralelo. |

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

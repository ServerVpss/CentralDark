# 🧿 Cross-chat Existing Errors — 2026-09-15

Status: `CURRENT_REMEASURE_REQUIRED`
Authority: `SEGREDO/CHEFE`
Base main at branch creation: `e094880bc0438bc302f31688196ef67fe41dd4b3`

## Intenção

Consolidar erros reais observados em outras conversas e receipts da CentralDark sem transformar histórico em estado atual. Cada item abaixo deve ser remedido no owner correto antes de qualquer correção.

Leis:

- `HISTORICAL != CURRENT`
- `UNKNOWN != PASS`
- `ACTION != PROOF`
- `REUSE_BEFORE_CREATE=true`
- `ONE_SYSTEM_ONLY=true`

## Owner canônico já existente

VS Code/Hermes cockpit: `apps/modulos/HERMES-CORE/extensions/hermes-vscode-router-provider/`

A Casa já cristalizou que esse owner deve ser estendido, não substituído por uma extensão paralela.

## Feridas recuperadas de outros chats

| ID | Sinal observado | Classificação inicial | Owner / alvo | Prova exigida agora |
|---|---|---|---|---|
| E01 | Codex VS Code: `[IpcClient] Initialize failed: timeout` | `HISTORICAL_PENDING` | extensão OpenAI/remote host + cockpit CentralDark | log atual + versão local/remota + reprodução |
| E02 | Agent Host remoto: cliente `<=0.8.0`, servidor exige `0.9.0` | `HISTORICAL_PENDING` | VS Code remote/agent host | versões atuais + handshake atual |
| E03 | PowerShell Extension Terminal morreu; IntelliSense indisponível | `HISTORICAL_PENDING` | extensão PowerShell / terminal | log atual + processo/terminal + repro |
| E04 | GitHub Auth retornou `429` | `HISTORICAL_PENDING` | auth/rate-limit GitHub | timestamp atual + headers/rate-limit |
| E05 | referências stale para `wt-pr-1454` | `HISTORICAL_PENDING` | workspace/GitLens/cache | busca atual em workspace/logs |
| E06 | `vscode-icons` tentou `C:\root\scripts\vigia\package.json` | `HISTORICAL_PENDING` | workspace/settings | origem da configuração + path atual |
| E07 | GitLens reclamou ao abrir `CentralDark-Remote-Tray` isolado por não ser repo Git | `EXPECTED_OR_CONFIG` | workspace owner | confirmar se pasta deve ser repo ou subpasta |
| E08 | Hermes Router `127.0.0.1:8099` recusou conexão | `HISTORICAL_PENDING` | HERMES-CORE/router | health atual + PID + listener + log |
| E09 | Chrome DevTools `127.0.0.1:9222` recusou conexão | `HISTORICAL_PENDING` | browser/devtools adapter | listener/processo atual + endpoint `/json/version` |
| E10 | SSH para VPS já apresentou timeout e push já falhou por credenciais em histórico anterior | `HISTORICAL_PENDING` | bridge/SSH/Git auth | testar rota atual sem assumir regressão |

## Evidência já cristalizada no repo

O cristal FULL de 2026-09-09 registra:

- SSH/VS Code continuavam funcionais enquanto Codex apresentava `IpcClient Initialize failed: timeout`;
- WinRM havia sido medido em `5985`;
- a extensão canônica é `apps/modulos/HERMES-CORE/extensions/hermes-vscode-router-provider/`;
- `Codex/Agent Host remoto completamente verde` permaneceu explicitamente como pendência.

Esses receipts são referência histórica, não prova de estado atual.

## Ordem de correção

```text
#ACORDAR
→ CALIBRAR
→ medir versões/processos/portas/logs
→ classificar CURRENT | HISTORICAL | EXPECTED
→ localizar owner existente
→ REUSE / EXTEND
→ corrigir somente erro reproduzido
→ POST_PROBE
→ CONTRAPROVA
→ REMEDIÇÃO
→ RECEIPT
→ FIXED_POINT_LOCAL
```

## Regra de fechamento

Um item só muda para `RESOLVED` quando existir, no mesmo alvo:

1. erro reproduzido ou contraprova de que não existe mais;
2. causa identificada;
3. correção no owner correto quando necessária;
4. pós-probe verde;
5. ausência de regressão material;
6. receipt com timestamp, versão e evidência.

`NO_REPRO_NOW` não apaga o histórico; vira `NOT_REPRODUCED_CURRENTLY`.

## NEXT_CURSOR

Rodar `scripts/lupa/vscode-runtime-errors-check.ps1` na Casa com PowerShell 7, anexar output ao PR e então corrigir apenas os itens `CURRENT_FAIL`.
---
title: "Lembrança operacional: VPS executa, GitHub conserva, Hermes reaproveita"
date: 2026-10-18
status: "PROVADO_PARA_RUNNER_VPS_1_EM_2026-10-18"
tags: ["centraldark", "lembrancas", "vps", "hermes", "runner", "fonte-da-verdade", "limpeza", "kaizen"]
owner: "scripts/limpeza-autonoma.sh"
source_pr: 1807
review_after: 2026-11-17
---

# 🧠 Lembrança — CHEFE, VPS leve e artefatos efêmeros

**Intenção viva declarada em 2026-10-18:** a VPS é continuidade operacional e execução de scripts; o trabalho versionado reside no GitHub, a fonte da verdade. Hermes deve consultar receitas/owners já comprovados e não guardar cópias de histórico de checkouts dos runners sem finalidade. **Isso NÃO autoriza destruir código local não publicado, sessões/modelos do Hermes, secrets, backups ou outros escopos.**

## Relembrar em conversa futura

- Não redescobrir onde está a limpeza: **PR [#1807](https://github.com/ServerVpss/CentralDark/pull/1807), já mesclado**, mantém o owner geral `scripts/limpeza-autonoma.sh`. O subowner de evento é `scripts/vps/centraldark-runner-postjob-clean.sh` na `main` ([commit dfef599](https://github.com/ServerVpss/CentralDark/commit/dfef59900739ce614d5adbb6d143422e38d7f334)).
- O runner VPS 1 recebeu `ACTIONS_RUNNER_HOOK_JOB_COMPLETED` por drop-in de `systemd`; prova real em journal às 16:33:44 UTC com `START` e `OK`. Hook não é cron novo. O cron de limpeza geral observado ainda continha `journal,gz,pip-cache,npm-cache`, **sem runner-work**.
- No evento, **984 objetos Git** (~49,2 GiB lógicos) foram excluídos do checkout descartável com runner parado. Com a limpeza pós-job posterior, `df` mediu **52 GiB livres**, depois **51 GiB** com novos jobs. `df` é estado temporal.
- Foram removidos caches descartáveis, logs antigos e quatro worktrees comprovadamente limpas. Trabalho dirty no `/root/CentralDark` e uma worktree dirty foram **preservados**.
- Hermes instalado foi observado em `/root/.local/bin/hermes`; pesos GGUF **preservados**: `Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf`, `Llama-3.2-3B-Instruct-Q4_K_M.gguf`, `Qwen3-8B-Q4_K_M.gguf`. Presença no disco não comprova modelo em execução.
- Servicos `centraldark-native-mcp-http.service` e runner 1 ativos no último readback. Tailscale MCP `HTTP 401` foi observado antes, **não corrigido pela faxina**.

## Aprendizado e proveniência

- [Aprendizado temático](../APRENDIZADOS/2026-10-18-VPS-RUNNER-EPHEMERAL-POSTJOB.md): distinguir clone efêmero de runtime vivo; cron instalado não basta; `COMMITTED != DEPLOYED`; `POST_JOB_ACK` + readback provam a automação.
- [Receipt técnico com fatos e contraprovas](../RECEIPTS/2026-10-18-vps-runner-postjob-faxina-prova.md).
- **Regra de memória:** este documento guarda a intenção e ponte histórica; GitHub atual + medição ao vivo do runtime prevalecem sobre números/timestamps antigos. Não criar segunda limpeza ou outro Hermes; reaproveitar PR #1807 e script pós-job.

**NEXT_CURSOR:** verificar novos `journalctl -t centraldark-runner-clean` e `df -h /`, conciliar backlog sem apagar deltas não publicados, e monitorar eventual concorrência entre hook do runner e limpeza geral. A ativação nos runners VPS 2–4 continua `UNKNOWN`/não feita; não pintar verde.

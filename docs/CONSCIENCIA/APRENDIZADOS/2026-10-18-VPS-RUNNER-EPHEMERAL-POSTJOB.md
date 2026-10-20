---
title: "Aprendizado operacional — runner efêmero, GitHub como fonte, limpeza pós-job"
date: 2026-10-18
tags: ["centraldark", "aprendizado", "vps", "runner", "git", "hermes", "limpeza", "post-job", "evidencia"]
owner: "scripts/limpeza-autonoma.sh"
related_owner: "scripts/vps/centraldark-runner-postjob-clean.sh"
canonical_receipt: "docs/CONSCIENCIA/RECEIPTS/2026-10-18-vps-runner-postjob-faxina-prova.md"
related_pr: 1807
status: "PROVADO_NO_RUNNER_1"
---

# 🧠 Aprendizado — checkout do runner é descartável; código publicado não é

**Identidade temática:** `VPS_RUNNER_EPHEMERAL_POSTJOB_20261018`.  
**Âncora de origem:** PR [#1807](https://github.com/ServerVpss/CentralDark/pull/1807) (merged).  
**Owner geral único:** `scripts/limpeza-autonoma.sh`; subowner pós-job `scripts/vps/centraldark-runner-postjob-clean.sh`.  
**Prova detalhada:** [receipt 2026-10-18](../RECEIPTS/2026-10-18-vps-runner-postjob-faxina-prova.md).

## Regra aprendida

A VPS não deve armazenar permanentemente cópias de GitHub Actions como se fossem a fonte da verdade. O GitHub mantém o código versionado, as PRs, artefatos e receipts; a VPS executa o job e descarta o checkout temporário ao final. Hermes consulta owners/receitas e executa apenas rotas legitimadas por prova/autoridade, sem precisar de 49+ GiB de Git packs repetidos.

**Separar quatro conceitos:** `GITHUB_CANONICAL` ≠ `/root/CentralDark_RUNTIME_DIRTY` ≠ `RUNNER_EPHEMERAL_CHECKOUT` ≠ `HERMES_MODELS_AND_SESSIONS`. A regra de descartar vale **apenas ao terceiro elemento**. Não significa apagar os dois últimos ou promover mudanças sujas em bloco.

## Erros que viraram critérios

1. **Não inferir que cron existe e funciona:** no histórico do PR #1807, o cron passou a enviar `pip-cache` que o script em produção não aceitava; acumulou 33 falhas. Verificar argumentos reais de crontab, versão de script e logs antes de declarar manutenção ativa.
2. **Limpar objetos Git só quando são de checkout confirmado:** 984 arquivos de pack descartáveis medidos sob runner parado, com 49,2 GiB liberados. Não aplicar ao repo principal nem a worktrees com dirty/unpushed.
3. **Falhar fechado inicialmente é acerto, não impedimento:** 6 `tmp_pack_*` foram recusados pelo filtro de extensões; só liberar os objetos depois de inventário e validação do diretório, runner inativo e tipo regular.
4. **Hook nativo melhor que cron novo para esse evento:** `ACTIONS_RUNNER_HOOK_JOB_COMPLETED` dispara depois do job, sem agendamento paralelo. Ele complementa o limpador geral do #1807 e não o substitui para journal/gz/caches.
5. **Não confundir code push com deploy:** `COMMITTED_MAIN` não era prova do gancho vivo; instalar a cópia idêntica (Git blob `62b9d215f2c2f2df0433f63a8d59b21dd9c48107`), reiniciar o runner e medir `/proc/<Runner.Listener>/environ` demonstrou carregamento.
6. **Não confundir teste manual com automático:** journal registrou `START` / `OK` às 2026-10-18 16:33:44 UTC após um job real, além de dois testes manuais consecutivos que comprovaram idempotência.
7. **Usar `df` como realidade:** espaço livre oscilou de 52 para 51 GiB depois de novos jobs; 0 GiB no início; números são temporais e devem ser medidos.
8. **Proteção não é burocracia:** `--dry-run`, caminho fixo, symlink/mount guard, lock, timeout, verificação do runner parado em manutenção manual e preservar `_actions`/`_tool` evitam apagamentos fora do cone causal.

## Aceite observado / limites

- `HOOK_INSTALLED=true` runner VPS 1.
- `HOOK_TRIGGERED_AFTER_REAL_JOB=true` (journal 16:33:44 UTC).
- `RUNNER_RUNNING_AFTER_RESTART=true`, `NRestarts=0` na observação.
- `MCP_NATIVE_ACTIVE=true` na mesma observação.
- `OTHER_RUNNERS_HOOK_CONFIGURED=NOT_PROVED` (runners 2–4 não instalados pelo trabalho).
- `TAILSCALE_401_FIXED=false` (outro escopo).
- `DIRTY_REPO_MAIN_SYNCED=false/UNKNOWN`: nenhum `git reset --hard`, commit seletivo ou cherry-pick desses deltas feito nesta operação.
- `CRON_RUNNER_WORK_ENABLED=false` no crontab observado; não adicionar segundo cron por reflexo.

## Receita de reaproveitamento

`CONSULTAR #1807 + SCRIPT + RECEIPT` → `MAPEAR df + runner process + checkout + mounts` → `SE job terminou, usar hook` → `CONTAR entries e ler journal` → `CONTRAPROVA df + serviços + PID` → `DOCUMENTAR NEXT_CURSOR`.

**NEXT_CURSOR:** conferir pós-job em execução futura e se há corrida com `runner-work` do owner geral antes de habilitar novos serviços; manter distinção entre código de execução e arquivo permanente. Este aprendizado temático **não reivindica novo número L197 nem altera o manifesto NeuroLink**, para preservar a linhagem numerada existente; sua proveniência é PR #1807 + receipt + commit do hook.

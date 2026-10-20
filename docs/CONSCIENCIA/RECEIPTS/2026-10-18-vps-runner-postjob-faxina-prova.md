# 🪬 Receipt — VPS efêmera: faxina, runner pós-job, Hermes preservado

**Data:** 2026-10-18 UTC  
**Intenção do CHEFE:** VPS = continuidade/execução de scripts; GitHub = fonte da verdade; Hermes consulta owners canônicos; nenhum histórico Git de checkout descartável precisa viver permanentemente na VPS.  
**PR equivalente histórico:** [#1807 — limpeza-autonoma, merged 2026-10-14](https://github.com/ServerVpss/CentralDark/pull/1807). **Não criar PR/limpador/agendador paralelo.**  
**Owner geral existente:** `scripts/limpeza-autonoma.sh` (`--clean-selected journal,gz,pip-cache,npm-cache,runner-work`).  
**Owner especializado pós-job na main:** [`scripts/vps/centraldark-runner-postjob-clean.sh`](../../../scripts/vps/centraldark-runner-postjob-clean.sh), commit [`dfef59900739ce614d5adbb6d143422e38d7f334`](https://github.com/ServerVpss/CentralDark/commit/dfef59900739ce614d5adbb6d143422e38d7f334). É *um gancho do GitHub Actions*, não outro cron.

## Estado medido antes da intervenção e origem

- `/dev/sda3`: capacidade 196 GiB; tinha **0 MB disponíveis** no início das rodadas de faxina; `centraldark-native-mcp-http.service` apresentava falhas de reinício (370 reinícios observados).
- Os 49+ GiB principais estavam em `/root/actions-runners/centraldark-vps-1/_work/CentralDark/CentralDark/.git/objects/pack`, checkout do GitHub Actions, não no repositório principal `/root/CentralDark`.
- `/root/CentralDark` continha código modificado e arquivos untracked. **Não houve `git reset --hard`, push cego, exclusão desses deltas ou rebase forçado**.
- O runner ativo foi identificado por `actions.runner.ServerVpss-CentralDark.centraldark-vps-1.service`. Os serviços 2–4 não estavam ativos no `systemd` nesta leitura.

## Operações de limpeza observadas (não atribuir efeito duas vezes)

1. Log syslog truncado após medir ~372 MB; limpeza de caches `/root/.cache/electron-builder` e `/root/.cache/electron` (~172 MB), e sete `/root/.npm/_npx` sem processos utilizadores (~782 MB). Um diretório `_npx` vinculado a processo ativo foi **preservado**.
2. Logs diagnósticos de runners: 21.572 `Runner_*.log` / `Worker_*.log` antigos, com critérios de idade, abertos e 20 mais recentes protegidos, ~2,96 GiB lógicos removidos. **Lógico ≠ recuperação `df` idêntica**.
3. Quatro worktrees Git limpas, sem commits exclusivos nem processos usuários, removidas pelo próprio `git worktree remove`, sem `--force`; a worktree `omni-router-owner-seal-20261011` com três dirty files foi **preservada**. Espaço `df` aumentou cerca de 1,78 GiB nesta etapa.
4. Runner 1 parado e confirmado sem `Runner.Worker`/Listener, depois eliminados **984 arquivos de objetos `.pack/.idx/.rev` e `tmp_pack_*`** da sua cópia de trabalho. Resultado medido: **49,2 GiB lógicos** removidos, `df` de ~1,6 GiB livres para ~50,8 GiB. O serviço foi religado, com `ActiveState=active, SubState=running`; o MCP permaneceu ativo.
5. Hook pós-job instalado e testado: teste seco encontrou 106 entradas (~2.403.528 KiB); teste negativo de workspace fora da allowlist retornou `SKIP`, de `--offline-clean` com runner ativo retornou bloqueio esperado; durante parada controlada, `--offline-clean` removeu as 106 entradas; segunda execução informou checkout vazio. Imediatamente após, `df` mostrou **52 GiB livres**, depois **51 GiB** com jobs retomados. Esses são instantes medidos, não promessa de espaço fixo.

## Deploy e prova de execução automática

- Script instalado em `/usr/local/libexec/centraldark/runner-postjob-clean.sh`, `root:root`, permissão `755`.
- `git hash-object` na VPS = blob GitHub `62b9d215f2c2f2df0433f63a8d59b21dd9c48107` (conteúdo idêntico).
- Drop-in persistente no `systemd`: `/etc/systemd/system/actions.runner.ServerVpss-CentralDark.centraldark-vps-1.service.d/20-centraldark-runner-postjob-clean.conf`.
- `ACTIONS_RUNNER_HOOK_JOB_COMPLETED=/usr/local/libexec/centraldark/runner-postjob-clean.sh` observado no serviço **e no ambiente do processo Runner.Listener** depois do reinício.
- Logger/journal `centraldark-runner-clean`: 2026-10-18 16:33:44 UTC, `START: runner=centraldark-vps-1 entries=1` seguido de `OK: checkout ephemeral removed; runner preserved (centraldark-vps-1)`. **Prova de trigger automático real após a configuração**, não apenas teste manual.
- `systemctl` pós-deploy: runner `active/running`, `NRestarts=0` na medição; MCP `active`; `df -h /` ~51 GiB disponíveis / 74% de uso.
- Cron pré-existente de `scripts/limpeza-autonoma.sh` permanece com categorias `journal,gz,pip-cache,npm-cache`: **não tem `runner-work` habilitado nesse crontab**. O hook nativo pós-job complementa o owner geral sem cron adicional. Não reivindicar 2 schedulers iguais.

## Invariantes + aprendizado (reaproveitar antes de criar)

- `SOURCE_OF_TRUTH=GITHUB_MAIN`; `VPS_EXECUTOR_NOT_ARCHIVE=true`; `WORKSPACE_EPHEMERAL=true`; `POST_JOB_HOOK_NOT_NEW_CRON=true`; `RUNNER_INSTALL_AND_HERMES_PRESERVED=true`.
- Só a pasta descartável `_work/CentralDark/CentralDark` fica na allowlist; todos os caminhos pai, runner, `_actions`, `_tool`, `_temp`, `/root/CentralDark`, `/root/.hermes`, modelos GGUF, secrets e dados permanentes ficam intocados.
- Guardas: caminhos canônicos, symlink e mount, identidade do runner, `flock`, `timeout`; modo `--dry-run`, modo `--offline-clean` exige runner parado; dupla execução idempotente.
- **Lição crítica:** limpar `git pack` de checkout do runner não destrói a `main` remota, mas **qualquer artefato/commit que exista exclusivamente dentro do checkout precisa ser publicado ANTES do encerramento do job**. `COMMITTED_MAIN != DEPLOYED`; instalação é provada pelo hash e PID, automação pelo journal pós-job. Estado de `df` deve ser remensurado durante jobs; eles podem refazer checkout.
- **Contraprova:** exclusão por extensão inicialmente recusada por 6 arquivos `tmp_pack_*` desconhecidos; a allowlist foi ampliada somente após inventário demonstrar que eram objetos temporários dentro do `pack` do checkout, já com runner inativo. Não burlar guardas sem evidência.
- **Erro recuperado:** limpeza cron antiga falhava em categoria `pip-cache` incompatível (#1807). Identificar dono, script, versão e cron real antes de atribuir limpeza a uma automação.
- **Estado não resolvido por esta faxina:** Tailscale via MCP retornava `PROVIDER_HTTP_401`; o hook não corrige credenciais. `/root/CentralDark` ainda tem deltas locais a reconciliar por owners. Não confundir nenhum dos dois com a operação de limpeza.

## Hermes offline — inventário observado, não removido

- CLI `/root/.local/bin/hermes`, configuração `/root/.hermes/config.yaml`.
- `/root/.hermes/models/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf` = 4.920.739.232 bytes.
- `/root/.hermes/models/Llama-3.2-3B-Instruct-Q4_K_M.gguf` = 2.019.377.696 bytes.
- `/root/.hermes/models/Qwen3-8B-Q4_K_M.gguf` = 5.027.783.488 bytes.
- Arquivos presentes no levantamento, **não prova de modelo carregado em memória**. Nenhum foi excluído nesta operação.

## Reversão e NEXT_CURSOR

- **Reversão:** remover apenas o drop-in `20-centraldark-runner-postjob-clean.conf`, `systemctl daemon-reload`, reiniciar runner sob janela autorizada e conferir `Environment`/PID. Manter script versionado e receipt. Não apagar cache de trabalho fora da allowlist.
- **NEXT_CURSOR:** observar próximo job finalizado e confirmar journal `OK` + worker retomado + `df`; comparar cron/owner #1807 e hook especializado antes de futuras edições, evitando corrida/duplicidade; se ativar runners 2–4, medir e habilitar apenas serviços reais, com prova individual; reconciliar deltas `/root/CentralDark` para o GitHub de forma seletiva. Sem afirmar reparo do Tailscale.

**Linguagem de prova:** `DOCUMENTED != DEPLOYED`; `DEPLOYED != E2E`; `UNKNOWN != PASS`; um writer por escopo; CHEFE decide, JARVIS coordena, Hermes executa quando sua participação for observada.

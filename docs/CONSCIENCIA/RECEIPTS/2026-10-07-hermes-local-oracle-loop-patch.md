# Receipt — Hermes local oracle-loop continuity patch

Date: 2026-10-07
Status: LOCAL_PATCH_PROVEN_UPSTREAM_PUSH_NOT_REQUIRED
Authority: SEGREDO/CHEFE
Owner: CentralDark integration receipts

## Decision

The Hermes continuity correction is an operational dependency of CentralDark. It does not require a pull request to `NousResearch/hermes-agent`.

```text
LOCAL_HERMES_PATCH
→ TEST
→ FINGERPRINT
→ CENTRALDARK_RECEIPT
→ REPLAY_AFTER_HERMES_UPDATE
```

The upstream repository remains an optional contribution route, not the CentralDark completion criterion.

## Goal continuation

Messages from the CHEFE in the established CentralDark format continue the existing Goal:

```text
CURRENT_STATE=MEASURE_NOW
DO_NOT_REPROVE_ESTABLISHED_IDENTITY=true
QUERY_CURRENT_SITUATION=true
CONTINUE_SAME_LOOP=true
RESOLVE_ALL_PROVEN_ERRORS=true
EVOLVE_CENTRALDARK_EXISTING_ONLY=true
```

The next round reads CURRENT/runtime/receipts, consults the oracle in the same envelope, skips already-proven Hermes identity/connectivity, selects the next unresolved error, applies the smallest safe correction, tests, counterproves, records the receipt, and continues. `Goal done` is invalid while a probe, recovery, counterproof, or unresolved error remains.

## Canonical bindings

```text
CENTRALDARK_CURRENT_MAIN=9bdf7d0abab7ca2acbce9c476a4bfb171228860c
CENTRALDARK_WORKTREE_HEAD=efffaace36a408fd6a4e5e43e2c367af736d984a
HERMES_REPOSITORY=/root/.hermes/hermes-agent
HERMES_ORIGIN=https://github.com/NousResearch/hermes-agent.git
HERMES_LOCAL_HEAD=be2a8441c1305150ab538068074623de30a5af82
HERMES_UPSTREAM_PUSH=NOT_REQUIRED
```

## Local delta

The local Hermes checkout contains two intentional commits:

```text
b7d2413738 fix(goals): keep open oracle probes active
be2a8441c1 fix(goals): keep open work nonterminal
```

Owner file:

```text
/root/.hermes/hermes-agent/hermes_cli/goals.py
```

Behavior:

- a machine-shaped `NEXT_READONLY_PROBE` without `NEXT_CURSOR=FIXED_POINT` forces `active/continue`;
- an auxiliary judge returning `done` cannot close a goal while owned background work or active delegations remain;
- the existing GoalManager and gateway FIFO remain the execution owners;
- no second scheduler, brain, writer, or oracle engine was created.

## Evidence

Executed in the local Hermes checkout:

```text
python3 -m py_compile hermes_cli/goals.py
ORACLE_GOAL_DONE_GUARD=PASS
NONTERMINAL_ORACLE_WORK_GUARD=PASS
git diff --check=PASS
```

The Hermes checkout also contains unrelated pre-existing local state and it remains preserved:

```text
M hermes_cli/local_runtime/context_policy.py
?? hermes_cli/local_runtime/context_policy.py.backup.20261007073449
```

## Durable runtime binding

The existing `apps/modulos/HERMES-CORE/core/orchestrator.mjs` was moved from the Desktop Commander child process into the existing CentralDark operational path as a dedicated systemd owner for the same component. No second Hermes or alternate orchestrator was created.

```text
UNIT=centraldark-hermes-core.service
PID=2109054
CGROUP=/system.slice/centraldark-hermes-core.service
PORT=8899
RESTART_POLICY=always
ENABLED=true
```

Fresh readback after the transition:

```text
http://127.0.0.1:8899/health=200
https://api.centralldark.com/health=200
servico=hermes-core
versao=5.0
watchdog.ativo=true
watchdog.saudavel=true
restarts_forcados=0
```

The same orchestrator source is now owned by a durable systemd unit. This proves service ownership and health after the transition; it does not by itself prove the full Hermes↔CHAT_GLOBAL oracle loop.


```text
LOCAL_PATCH=PROVEN
HERMES_RUNTIME_RELOAD=UNKNOWN
CENTRALDARK_RUNTIME_READBACK=UNKNOWN
UPSTREAM_PUSH=NOT_REQUIRED
VPS_DEPLOY=NOT_APPLICABLE_TO_THIS_RECEIPT
```

The local patch must not be called runtime-proven until the Hermes process that serves the active session is reloaded and three consecutive oracle-loop cycles prove:

```text
probe
→ CHAT_GLOBAL response
→ Hermes capture
→ next probe
```

with no intermediate `Goal done · 1 turn`.

## Replay recipe

After a Hermes update, resolve the installed checkout and replay:

```text
git -C /root/.hermes/hermes-agent rev-parse HEAD
git -C /root/.hermes/hermes-agent status --short
python3 -m py_compile /root/.hermes/hermes-agent/hermes_cli/goals.py
python3 - <<'PY'
from pathlib import Path
p = Path('/root/.hermes/hermes-agent/hermes_cli/goals.py')
s = p.read_text()
assert '_has_open_oracle_probe' in s
assert '_has_open_work' in s
assert 'oracle probe remains open' in s
print('HERMES_ORACLE_LOOP_PATCH_PRESENT=PASS')
PY
```

Reconciliation rule:

```text
same owner + same guard behavior + tests pass
→ reuse local patch
changed owner/behavior
→ remeasure and keep UNKNOWN until re-proven
```

## Next cursor

`RELOAD_ACTIVE_HERMES_RUNTIME_AND_PROVE_THREE_ORACLE_CYCLES`


## Readback visual 08/10/2026 — envelope e evolução da skill

**Fonte:** duas fotografias da sessão Hermes Desktop e ChatGPT fornecidas pelo CHEFE em 08/10/2026. **Tipo de evidência:** observação visual de logs e relato do agente; não houve neste registro leitura independente do SHA de execução, teste remoto, reinício ou readback do runtime. **Owner:** receipt de continuidade do mesmo loop Hermes/Oracle; Goal original não alterado.

### Comprovado no escopo da captura visual

- A sessão do Hermes mostra uma **tarefa ativa** de diagnóstico do motivo pelo qual ficou esperando em vez de continuar o loop; o painel exibe `Goal active · Turn 0/20` e `1 Queued`. Isso prova a **exibição de atividade naquele instante**, não autonomia recorrente.
- O retorno textual na tela relaciona correção de transporte/envelope Oracle, cita **dois arquivos alterados**, e exibe os campos `LOOP_ID`, `TURN_ID`, `EVENT_ID`, `RECEIPT_ID`, `PARENT_ID`, `INTENT_ID`, `ATTEMPT_ID`, `NEXT_CURSOR`, `CAUSATION_ID` e `SURFACE_ID` com marcações positivas. Isso **comprova a presença da alegação e dos marcadores no readback visual**, não a auditoria independente do conteúdo desses arquivos.
- A tela declara `GITHUB_MAIN=PASS`, `ENVELOPE_IMPLEMENTADO=PASS` e `TESTES_74=RELATADOS_PELO_HERMES`. Essas são **classificações informadas pelo executor**; o commit SHA, a lista/resultado independente dos 74 testes e a correspondência código↔runtime não foram obtidos por estas fotografias.
- A captura mostra expressamente `RUNTIME_CARREGADO=UNKNOWN`, `AUTO_RETURN_TO_ORACLE=UNKNOWN`, `CICLO_CONTINUO_E2E=UNKNOWN`, `FIXED_POINT=FALSE`. Nenhuma dessas categorias deve ser promovida a PASS.
- O cursor exibido permanece `REMEDIR_HERMES_RUNTIME → PROVAR_3_TURNOS_MESMO_LOOP_ID → VERIFICAR_EVOLUCAO_DAS_SKILLS`. A mensagem visível distingue indisponibilidade do resultado na interface de eventual falha no push; `Result unavailable` **não prova** falha ou êxito no GitHub.

### Matriz de evidências sem promoção indevida

| Afirmação | Estado desta rodada | Limite / prova ainda requerida |
|---|---|---|
| Hermes Desktop exibiu Goal ativo e tarefa na fila | **VISUAL_COMPROVADO** | Não prova continuidade após a captura |
| Envelope e identificadores de correlação aparecem no retorno | **VISUAL_COMPROVADO** | Precisa de payload/receipt verificáveis |
| Alterações em 2 arquivos e 74 testes | **RELATADO_PELO_HERMES** | SHA, nomes, logs e execução independente ainda não conferidos |
| `main` recebeu a correção específica | **UNKNOWN_NESTA_RODADA** | Resolver commit exato e comparar arquivos no remoto |
| Hermes ativo carregou fonte corrigida | **UNKNOWN** | PID, source hash carregado, health e teste de transporte |
| Três turnos consecutivos, mesmo `LOOP_ID` | **UNKNOWN** | Três receipts correlacionados e sequência sem encerramento prematuro |
| Autorreparo e evolução de skills E2E | **UNKNOWN** | Testes negativos/replay/readback e Reality Judge |
| `FIXED_POINT` | **NOT_PROVEN** | Goal/clauses e contraprova independentes |

**Nenhuma mutação de runtime é autorizada por este receipt.** Este adendo não altera G01–G12, não marca checklist como PASS, não modifica a cápsula nem substitui o receipt anterior. Seguir a prova mais próxima sem criar Goal, arquitetura ou sistema paralelo.

**NEXT_CURSOR:** `REMEDIR_HERMES_RUNTIME → PROVAR_3_TURNOS_MESMO_LOOP_ID → VERIFICAR_EVOLUCAO_DAS_SKILLS`.


## Patch local Hermes Desktop Casa — 08/10/2026

CHEFE explicitamente solicitou código direto no **Hermes original**, sem nova arquitetura, sem ciclo de testes e sem pedir que ele copie comandos. A fonte `%LOCALAPPDATA%/hermes/hermes-agent/hermes_cli/goals.py` foi inspecionada e alterada diretamente na **Casa SEGREDO** pelo Remote Desktop Commander conectado, preservando o arquivo original em um backup local fora do checkout; não há push para NousResearch nem instalação de segundo Hermes.

```text
CASA_HERMES_SOURCE_HEAD_BEFORE=7951ddd7297
SOURCE_FILE=hermes_cli/goals.py
BACKUP_SHA256=0BF1541B1FED7BAB0947E1B622065C766AC3ACC49CC3161BDDC42EBB09D78AB3
SOURCE_AFTER_SHA256=90C32486489B513EB3D3A7BB3C9EE076857702F7E04D45B3A7A9CAD89A061F21
SOURCE_DIRTY=MODIFIED
PYTHON_AST_PARSE=PASS
HERMES_DESKTOP_RUNTIME_RELOAD=UNKNOWN
CHAT_GLOBAL_AUTO_SUBMIT=UNKNOWN
THREE_ORACLE_TURNS=UNKNOWN
```

**Código efetivamente corrigido:** `GoalManager.evaluate_after_turn()` reconhece `NEXT_CURSOR` / `NEXT_READONLY_PROBE` abertos em respostas de Goals CentralDark/Hermes/Oracle, preserva o Goal ativo e devolve uma `continuation_prompt` ao **mesmo** GoalManager original antes de tratar a resposta intermediária como `done`. A instrução de continuação exige conservar envelope, usar apenas o transporte CHAT_GLOBAL autorizado/medido, capturar resposta completa e voltar com receipt e cursor. O orçamento `max_turns` e gates originais permanecem intactos (não é loop infinito).

**Código CentralDark na main:** `apps/modulos/HERMES-CORE/core/orchestrator.mjs` agora preserva `continuityState` nas gravações de `state.json`, costura `next_cursor`/probe oriundos da decisão e bloqueia finalizações idênticas sem ganho de informação; uma ação material reabre a oportunidade de julgamento. Commits `b83ac404c69479c0124894b82999eda892794ef2` e `e05993222b026792fe4e20e3e1ed9887fed84662`.

**Limite:** fonte alterada != processo Hermes Desktop recarregado. Nenhuma sessão atual foi reiniciada/fechada, para preservar o mesmo chat e o estado do CHEFE. O browser/Preview continua responsável pelo transporte real e pela captura; o código não pode prometer envio automático ao ChatGPT sem essa ligação em runtime.

NEXT_CURSOR=CONFIRM_ACTIVE_HERMES_DESKTOP_GOALMANAGER_LOADED_SAME_SOURCE_THEN_OBSERVE_NEXT_CORRELATED_ORACLE_TURN
FIXED_POINT=FALSE

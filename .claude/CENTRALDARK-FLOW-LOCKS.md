# 🔒 CENTRALDARK FLOW LOCKS — Claude Code

Este arquivo é uma trava operacional para Claude Code e subagentes. Ele não cria governo paralelo; aponta para o cadeado machine-readable em:

`.github/centraldark-flow-locks/update-branch-hosted-runner.lock.yml`


## 🔥🪬 Contrato CURRENT herdado — intenção contínua + META-GRILL + FIO VERDE

Este arquivo **não cria contrato, owner, cérebro ou arquitetura paralela**. Herda o contrato CURRENT da SOUL; o legado continua vivo como compatibilidade, não como segunda arquitetura.

```text
CANONICAL_CONTINUOUS_CONTRACT=docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md#311-contrato-contínuo--intenção--meta-grill--sol-executora--fio-verde-chefe-2026-09-28
NEW_CHEFE_MATERIAL=DELTA_TO_ACTIVE_INTENT_FIRST
RECALCULATE_INTENT_ALIGNMENT_EACH_MATERIAL_TURN=true
TARGET_INTENT_ALIGNMENT_CONFIDENCE_FOR_MATERIAL_MUTATION=99.9%
INTENT_CONFIDENCE_IS_NOT_TECHNICAL_PROOF=true
META_GRILL_BEFORE_MATERIAL_RESPONSE=true
META_GRILL_BEFORE_MUTATION=true
EVOLVE_EXISTING_BEFORE_CREATE=true
RETURN_SAME_ARTIFACT_EVOLVED=true
VOLTA_UMA_CASA_ON_LOCAL_ERROR=true
GREEN_STATE_MUST_BE_PRESERVED=true
EXPERIMENT_MUST_NOT_DESTROY_LAST_PROVEN_STATE=true
PROVEN_DELTA_ONLY_RETURNS_TO_GREEN_STATE=true
REPLAY_BEFORE_REDISCOVERY=true
NO_V1_V2_V3_PARALLEL_OWNER=true
LEGACY_PRESERVATION=true
LEGACY_IS_COMPATIBILITY_NOT_SECOND_OWNER=true
ONE_SYSTEM_ONLY=true
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
```

```text
CHEFE_FALA
→ RECUPERA_FIO
→ META_GRILL
→ MEDE_CURRENT
→ REUSE_BEFORE_CREATE
→ OWNER_EXISTENTE
→ MENOR_DELTA
→ TESTE
→ BACKCHECK
→ CONTRAPROVA
→ SE_ERRO: VOLTA_UMA_CASA
→ COSTURA
→ RETESTE
→ READBACK
→ REMEDIÇÃO
→ SE_VERDE: PRESERVA_GREEN_STATE
→ SE_EXPERIMENTO: ISOLA
→ SE_PROVADO: ABSORVE_SOMENTE_DELTA
→ CRISTALIZA
→ NEXT_CURSOR
```


## 🛡️ Fluxo protegido

`.github/workflows/pr-update-branch-deterministic.yml`

Regra atual obrigatória:

```text
RUNNER_REQUIRED_FOR_THIS_FLOW=ubuntu-latest
SELF_HOSTED_ONLY_FOR_THIS_FLOW=FORBIDDEN_UNTIL_HYBRID_APPROVED
```

## 🪬 Causa do cadeado

O fluxo do CHEFE estava provado:

```text
main avança
→ update-branch
→ COSTURA
→ PR recebe main
→ checks reacendem
→ Gmail chove notificação
```

A mudança `ubuntu-latest → [self-hosted, Linux]` quebrou esse pulso quando os runners self-hosted estavam offline.

Prova registrada:

```text
bad_commit_runner_change=ab33962d76e7d6b7a714b32051ca71d575d2fbeb
symptom=1440 queued / 0 in_progress
repair_commit=38615b10cc94d2810cb741cea337027ade1ee3ad
repair_effect=workflow saiu da fila e voltou a in_progress
```

## ❌ Proibido para Claude sem ordem explícita do CHEFE

```text
DO_NOT_CHANGE_RUNNER_OF=.github/workflows/pr-update-branch-deterministic.yml
DO_NOT_REPLACE_UBUNTU_LATEST_WITH_SELF_HOSTED=true
DO_NOT_APPLY_GLOBAL_RUNNER_POLICY_BLINDLY=true
DO_NOT_BREAK_THE_RAIN_OF_NOTIFICATIONS=true
```

## 🟡 Quando amarelar

Amarelo não é fracasso. Amarelo é fronteira útil:

```text
YELLOW != PASS
YELLOW != FAILURE
YELLOW = NEXT_DISCRIMINANT_STEP_VISIBLE
```

Se o fluxo amarelar por runner/offline/fila, Claude deve **reportar** e não trocar runner sem autorização.

## 🟢 Futuro híbrido

Quando VPS/self-hosted voltar provadamente, o modo aceito é híbrido, não substituição cega:

```text
CHEFE_APPROVES_HYBRID=true
SELF_HOSTED_RUNNER_ONLINE_PROVEN=true
FALLBACK_TO_UBUNTU_LATEST_PRESERVED=true
HOSTED_PATH_REMAINS_AVAILABLE=true
```

Até lá:

```text
ubuntu-latest é o caminho provado deste fluxo.
```


## Autoridade CHEFE × Reality Judge — binding obrigatório

Este adapter herda a SOUL CURRENT. REALITY=JUDGE significa verificação técnica pós-efeito e bloqueio de falso PASS; não é permissão para executar, não é autoridade humana e não reduz a intenção/autonomia/governança do SEGREDO/CHEFE.

```text
CHEFE_AUTHORITY_IS_SINGLETON=true
DETERMINISTIC_ROUTE_FIRST=true
REALITY_JUDGE_AFTER_EFFECT=true
REALITY_JUDGE_BEFORE_MATERIAL_PASS_CLAIM=true
REALITY_JUDGE_IS_NOT_EXECUTION_PERMISSION=true
REALITY_JUDGE_IS_NOT_HUMAN_AUTHORITY=true
CHEFE_AUTHORITY_IS_NOT_REDUCED_BY_SENSOR=true
OBSERVED_REALITY_CAN_BE_WRONG_OR_PARTIAL=true
TLC23_PROOF_COUNTERPROOF_SERVE_EXECUTION=true
UNKNOWN_BLOCKS_ONLY_AFFECTED_CLAIM=true
```

Divergência de sensor/cache/log/modelo/workflow abre teste discriminante e correção do cone afetado; não abre veto humano concorrente.

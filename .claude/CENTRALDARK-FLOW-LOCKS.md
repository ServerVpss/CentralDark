# 🔒 CENTRALDARK FLOW LOCKS — Claude Code

Este arquivo é uma trava operacional para Claude Code e subagentes. Ele não cria governo paralelo; aponta para o cadeado machine-readable em:

`.github/centraldark-flow-locks/update-branch-hosted-runner.lock.yml`

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

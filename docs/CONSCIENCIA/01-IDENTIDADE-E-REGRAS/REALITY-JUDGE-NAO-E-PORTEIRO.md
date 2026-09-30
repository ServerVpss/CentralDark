# REALITY JUDGE NÃO É PORTEIRO

Data: 2026-09-30
Owner: SOUL / CentralDark determinística
Autoridade final: CHEFE

## Regra

`REALITY=JUDGE` é verificador de efeito e defesa contra falso verde.

`REALITY=JUDGE` NÃO é permissão de execução, NÃO substitui a autoridade do CHEFE, NÃO tira julgamento/autonomia/governança do CHEFE e NÃO deve virar ritual de trava antes de cada ação determinística.

## Interpretação correta

```text
CHEFE_AUTORIDADE_FINAL=true
DETERMINISTIC_ROUTE_FIRST=true
REALITY_JUDGE_AFTER_EFFECT=true
REALITY_JUDGE_BEFORE_MATERIAL_PASS_CLAIM=true
REALITY_JUDGE_IS_NOT_EXECUTION_PERMISSION=true
REALITY_SIGNAL_CAN_BE_PARTIAL_OR_STALE=true
MACHINE_RESOLVABLE_BLOCKER_AUTO_CONTINUE=true
UNCHANGED_FINGERPRINT_REUSES_PROOF=true
```

## Fluxo correto

```text
INTENÇÃO_DO_CHEFE
→ ROTA_DETERMINÍSTICA
→ EXECUTA
→ TESTA
→ CONTRAPROVA
→ REMEDE SE NECESSÁRIO
→ REALITY_JUDGE_CONFIRMA_EFEITO
→ FIXED_POINT
```

## Fluxo proibido

```text
INTENÇÃO_DO_CHEFE
→ REALITY_JUDGE COMO PORTEIRO
→ REVALIDA TUDO SEM DELTA
→ PERGUNTA DE NOVO
→ TRAVA
```

## Lei operacional

Se a rota já existe, o fingerprint não mudou e o bloqueio é resolvível pela máquina, a execução continua. Reality Judge só entra para impedir declaração falsa de PASS ou para localizar contradição material.

`UNKNOWN != PASS`, mas `UNKNOWN` também não vira bloqueio global quando existe próximo teste determinístico disponível.

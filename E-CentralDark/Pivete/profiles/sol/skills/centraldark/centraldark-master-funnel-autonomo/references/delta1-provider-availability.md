# Δ1 — Provider Availability / Free-Tier Resilience

## Essência
FALHA DE UMA INVOCAÇÃO ≠ ROTA/ARQUITETURA QUEBRADA. Antes de classificar como quebrado, identificar CLASSE REAL da falha.

## Classificação de falhas

### Transitórias (NÃO estruturais)
- AUTH_EXPIRED, CREDIT_EXHAUSTED, QUOTA_EXHAUSTED, FREE_TIER_EXHAUSTED
- RATE_LIMITED, MODEL_TEMPORARILY_UNAVAILABLE, PROVIDER_OUTAGE
- NETWORK_TRANSIENT, TIMEOUT

**Tratamento:** registrar causa → marcar rota TEMPORARILY_UNAVAILABLE → não retry infinito → pular para próximo fallback comprovado → continuar missão.

**Exemplo:** MODEL_A → HTTP 429 → TEMPORARILY_UNAVAILABLE → MODEL_B → continuar. MODEL_B → crédito esgotado → TEMPORARILY_UNAVAILABLE → MODEL_C → continuar. Isso NÃO invalida router, CLI, fallback engine.

### Estruturais (só com evidência)
- ROUTER_ERROR, CONFIG_ERROR, MODEL_ROUTING_ERROR
- INVALID_MODEL_MAPPING, SELF_ROUTING_LOOP, INVALID_PROVIDER_BINDING
- REQUEST_NOT_REACHING_ROUTER, FALLBACK_NOT_ADVANCING

**Tratamento:** diagnosticar causa → corrigir owner existente → retestar → continuar. SEM loop. `MAX_ATTEMPTS_PER_SAME_CAUSE = pequeno`.

Se repetir MESMA falha material: NÃO insistir → registrar → NEXT_FALLBACK.

## Fixed point da cadeia
`CHAIN_MECHANISM_PROVEN ≠ ALL_MODELS_AVAILABLE_NOW`

A cadeia é operacional se: ROUTER=PASS, FALLBACK_MECHANISM=PASS, NEXT_MODEL_ADVANCE=PASS, AT_LEAST_ONE_USABLE_ROUTE=PASS, SELF_LOOP_GUARD=PASS, NO_HIDDEN_DIRECT_PROVIDER=PASS.

Exemplo: 7 candidatos → 3 PASS / 2 RATE_LIMITED / 1 CREDIT_EXHAUSTED / 1 MODEL_UNAVAILABLE → CHAIN_MECHANISM=PASS, ALL_MODELS=NÃO. NÃO mentir que 7/7 funcionam.

## Auth boundary
→ identificar somente TIPO do erro
→ NÃO imprimir token
→ NÃO registrar credencial em log

## Frase
```
PROVIDER SEM CRÉDITO NÃO É ROUTER QUEBRADO.  
API EXPIRADA NÃO É ARQUITETURA QUEBRADA.
RATE LIMIT NÃO É REGRESSÃO.
CLASSIFICA. PULA. CONTINUA. PROVA O RESTO.
```

## Regra cristalizada
```
DELTA_ID=1 | NOME=Provider Availability / Free-Tier Resilience
OBJETIVO=impedir confundir "provider sem quota" com "arquitetura quebrada"
CLASSE=TRANSITÓRIO_NÃO_ESTRUTURAL | MATERIALIDADE=ALTA
BIBLE=Pv 18:17 | "Oxe, o portãonem abriu ainda; não adianta culpar o motor lá dentro."
```

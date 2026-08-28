---
title: "Writer provenance — ouro preservado do PR #664"
date: 2026-08-06
absorbed: 2026-08-14
status: "CANDIDATO_PRESERVADO_NAO_GATE_ATIVO"
source_pr: 664
---

# Proveniência do Writer — gap preservado no projeto

Este registro absorve para a Fonte da Verdade o ouro do PR #664 sem promover a implementação antiga como gate ativo.

## Problema que continua válido

```text
GIT_AUTHOR/COMMITTER = IDENTIDADE_DA_CONTA
GIT_AUTHOR/COMMITTER != PROVA_DO_AGENTE_WRITER
TEXTO_NO_CORPO_DO_PR != PROVENIENCIA_AUTENTICADA
```

Vários agentes podem operar pela mesma conta GitHub. Portanto, atribuir um commit a Claude, Codex, SOL, Hermes ou outro agente apenas pelo `author/committer` ou pelo próprio texto do PR é evidência fraca.

## Ouro técnico do candidato antigo

O PR #664 propôs:

```text
COMMIT
→ TRAILER Writer: <slug>
→ Writer-Session: <id-opaco> opcional
→ parser lê apenas trailers no rodapé
→ sessão com shape de credencial = FAIL + REDACTED
→ intervalo vazio = FAIL
→ histórico sem trailer = UNKNOWN_LEGACY, nunca autoria inventada
→ múltiplos Writers não reconciliados = FAIL
```

E trouxe testes discriminativos para:

- `Writer:` citado no corpo não contar como identidade;
- ausência de trailer não virar PASS;
- histórico sem trailer virar `UNKNOWN_LEGACY`;
- slug inválido reprovar;
- sessão com formato de credencial reprovar sem ecoar valor;
- intervalo vazio reprovar;
- mais de um Writer não reconciliado reprovar.

Os bytes de referência continuam preservados na branch histórica `fix/writer-unico-gate-deterministico-20260806` e no histórico do PR #664.

## Por que NÃO ativar o script antigo como está

A Casa amadureceu depois de 06/08:

```text
ONE_WRITER_PER_SCOPE=true
ROLE_FOLLOWS_STATE_SCOPE_NEED=true
HANDOFF_REAL_MAY_CHANGE_WRITER=true
SELF_VALIDATION_WITHOUT_INDEPENDENT_COUNTERPROOF=UNPROVEN
```

O candidato antigo tratava um único Writer por branch/intervalo como regra geral e chamava a própria aprovação do gate de “dogfood”. Isso conflita com o contrato atual: handoff legítimo pode trocar Writer; e um provador não fica provado só por aprovar a si próprio.

## Contrato para uma implementação moderna futura

Se o gap for fechado mecanicamente, reutilizar o mecanismo de identidade/prova já existente e exigir no mínimo:

```text
COMMIT_PROVENANCE
→ Writer
→ Writer-Scope
→ Mission/Intent receipt aplicável
→ HEAD/commit exato
→ cadeia de handoff quando Writer muda
→ consumidor real
→ teste positivo
→ teste negativo
→ contraprova independente
```

A mudança de Writer só é válida quando a sequência provar que o Writer anterior liberou ou que o estado/escopo livre permitia nova posse. Dois Writers simultâneos no mesmo escopo continuam proibidos.

## Estado atual

```text
PLAN_IN_PROJECT=true
OLD_IMPLEMENTATION_ACTIVE=false
RESIDUAL_GAP=AGENT_WRITER_PROVENANCE_PER_COMMIT
AUTHORITY=SEGREDO/CHEFE
WRITER_RECEIPT_AT_PR_LEVEL=EXISTS_IN_CURRENT_PROMOTION_PATH
PER_COMMIT_AGENT_PROOF=NOT_YET_CANONICALLY_ENFORCED
UNKNOWN_IS_NOT_PASS=true
DEPLOY=NAO
```

Este documento preserva o plano e os falsificadores do #664 até existir encaixe mínimo e moderno. Ele não cria uma segunda identidade, um segundo Writer engine ou uma nova autoridade.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre

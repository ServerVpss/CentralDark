---
title: "⏰ Padrão canônico de timestamp — UTC na origem, local na apresentação"
status: "ATIVO_PROPOSTO"
date: 2026-09-17
owner: "docs/CONSCIENCIA/PADRAO-TIMESTAMP-UTC-LOCAL.md"
truth_scope: "TIMESTAMP_PROVENANCE_AND_DISPLAY"
canonical: true
---

# ⏰ Padrão canônico de timestamp — UTC na origem, local na apresentação

## Intenção

Preservar timestamps recebidos do GitHub e demais fontes exatamente como foram emitidos, sem reescrever a evidência, e apresentar ao SEGREDO/CHEFE a hora local da Casa.

## Lei

```text
UTC_AT_REST=true
LOCAL_AT_DISPLAY=true
NEVER_OVERWRITE_SOURCE_TIMESTAMP=true
SOURCE_TIMESTAMP_IS_EVIDENCE=true
DISPLAY_TIMESTAMP_IS_PRESENTATION=true
DISPLAY_TIMEZONE=America/Bahia
MANUAL_FIXED_HOUR_SUBTRACTION=FORBIDDEN
UNKNOWN_TIMEZONE != PASS
```

## Contrato

1. `source_timestamp` guarda o valor original da fonte, incluindo `Z`/offset quando fornecido.
2. `display_timestamp` é derivado do valor original no momento da apresentação.
3. A conversão usa timezone IANA (`America/Bahia`), não subtração manual de horas.
4. Logs, receipts, artifacts, filas, workflows, Dependabot, reconcile, promotion gate, micro deploy, rollback e health preservam o timestamp-fonte para auditoria.
5. Interfaces e relatórios voltados ao SEGREDO/CHEFE mostram primeiro a hora local; UTC pode aparecer entre parênteses quando útil para contraprova.
6. Conversão de apresentação nunca altera ordenação, identidade de run, HEAD, SHA, status ou evidência original.
7. Se a fonte não trouxer timezone/offset suficiente para conversão segura, marcar `UNKNOWN` em vez de inventar horário.

## Exemplo

```text
source_timestamp = 2026-09-17T05:22:55Z
display_timezone = America/Bahia
display_timestamp = 2026-09-17T02:22:55-03:00
```

O segundo valor é uma projeção de apresentação do primeiro. Não é um novo evento e não substitui a evidência original.

## Gate de revisão

```text
SOURCE_PRESERVED
AND IANA_TIMEZONE_USED
AND DISPLAY_DERIVED_FROM_SOURCE
AND NO_MANUAL_OFFSET_ARITHMETIC
AND UNKNOWN_FAILS_CLOSED
→ TIMESTAMP_PRESENTATION_PASS
```

## Escopo de adoção

Este contrato deve ser reutilizado pelos owners existentes que renderizam ou registram horários. Não autoriza criar runtime, fila, workflow ou arquitetura paralela. A implementação em cada consumidor continua sujeita a teste e contraprova; `DOCUMENTED != EXECUTED`.

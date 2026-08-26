---
title: "Prova secreta — fundamentos (Uncle Bob) ↔ arquitetura da Casa"
date: 2026-08-24
tags: ["consciencia", "fundamentos", "anti-papagaio", "pombo", "alinhamento"]
status: "CRISTAL OPERACIONAL DERIVADO"
owner: "docs/CONSCIENCIA/APRENDIZADOS/2026-08-24-fluxo-operacional-papagaio-off-pombo-on.md + Porta + JARVIS + Pombo"
source_evidence: "LIVE Matt Pocock × Uncle Bob — Software Fundamentals in the Age of AI (YouTube zcLPGC-tvgk, 2026-08-19)"
---

# Prova secreta — fundamentos ainda mandam na era de agentes

**Não é** adoption de Clean Code como dogma, nem novo orquestrador.
**É** o alinhamento medido entre o que a entrevista estabelece como lei de complexidade
e o que a Casa já materializou em owners canônicos.

```text
EVIDÊNCIA_EXTERNA ≠ IMPLEMENTAÇÃO
ACTION ≠ PROOF
ESTE_CRISTAL = MAPA DE CORRESPONDÊNCIA + RECEIPT
```

## Fonte da evidência (externa)

| Campo | Valor |
|-------|--------|
| Título | LIVE: Uncle Bob on Software Fundamentals in the Age of AI |
| Canal | Matt Pocock |
| Publicado | 2026-08-19 |
| ID | `zcLPGC-tvgk` |
| Uso nesta Casa | só correspondência de princípios; **não** importa tools Java/Clojure do Bob |

## Correspondência Bob → Casa

| Claim na entrevista | Comportamento da Casa | Owner / artefato |
|---------------------|----------------------|------------------|
| Agente deixa mess (*dog do*); mess faz thrash | `UNKNOWN ≠ PASS`; residual explícito; não pintar verde | fluxo #1145 + cards rodada |
| Prompt longo vira *guideline* (*lost in the middle*) | prompt mínimo + **gates determinísticos** | `verify_repo_contract.py` + Trigger Fabric |
| CRAP / mutation = limpeza chata viável p/ agente | META_LUPA + contraprova + reteste | MetaLupa + LOOP |
| Camisa de força; humano fora do miolo linha-a-linha | WRITER ÚNICO + OUTPUT_GUARD + Intent-Authorized | writer-safe-push + autonomia |
| Spec-driven maxing / plans bonitos caem | estado vivo primeiro; spec efêmera | `#ACORDAR` Porta |
| Custo de mudança baixo → fiddle + feedback | executar → medir → repetir; delta mínimo | LOOP / FABLE papel |
| Tático (agente) vs estratégico (humano) | CHEFE intenção · SOL coordena · HERMES executa · REALIDADE julga | JARVIS + SOUL-SOL |
| Fundamentos organizam complexidade p/ humano **e** modelo | 12 leis · ONE_WRITER · REUSE · REALITY_IS_JUDGE | Mapa 2.0 + invariantes |
| “Não baixe meu tool — aponte e faça o seu” | REUSE_BEFORE_CREATE; sem V2 paralelo | Porta + contrato reconciliação |

## Circuito da Casa (já registrado)

Owner do circuito de papéis:

`docs/CONSCIENCIA/APRENDIZADOS/2026-08-24-fluxo-operacional-papagaio-off-pombo-on.md`

```text
CHEFE → #ACORDAR → !CALIBRAR → !MULTIBÚSSOLA
→ SOL → (percepção) → META_LUPA
→ WRITER ÚNICO → HERMES → LOOP → JUDGE
→ FALHOU | PROVOU → aprendizado → próximo #ACORDAR
```

```text
PAPAGAIO_MODE = OFF
POMBO_MODE = CHECKSUM_ON
```

## O que este cristal **não** faz

```text
❌ importar CRAP/mutation do Bob como dependência
❌ criar engine FABLE / segundo cérebro
❌ transformar entrevista em autorização de merge
❌ alegar runtime local/VPS provado
❌ reensinar anti-papagaio já promovido (#1145 / Pombo #1136)
```

## Prova vs não-prova

| Item | Veredito |
|------|----------|
| Alinhamento de princípios Bob ↔ papéis/owners da Casa | **PROVADO** (mapa acima + arquivos na main) |
| Entrevista implementa código na CentralDark | **FALHOU** (não é o caso) |
| Fundamentos “não importam mais com IA” | **FALHOU** (Bob + Casa: ainda importam) |
| Runtime Hermes/Windows executando o circuito | **NOT_PROVEN** |

## Invariantes

```text
SOFTWARE_FUNDAMENTALS_STILL_APPLY=true
DETERMINISTIC_TOOLS_OVER_LONG_STEERING=true
MESS_MAKES_AGENTS_THRASH=true
STRATEGIC_STAYS_HUMAN=true
TACTICAL_CAN_BE_AGENT_UNDER_CONSTRAINT=true
PAPAGAIO_MODE=OFF
POMBO_MODE=CHECKSUM_ON
UNKNOWN!=PASS
ACTION!=PROOF
```

## Baseline

```text
main_ancestral_ao_commit = eb963a12c119338b199105a486801663b80dcf8a
(#1145 fluxo operacional já na main)
```

Re-medir `main` após merge. `HISTORY != CURRENT_STATE`.

## Critério de reuso

Próxima discussão “fundamentos morreram com agente” deve apontar **este cristal + fluxo #1145 + Pombo**, sem o CHEFE reensinar o paralelo. Reensino = `LEARNING_TRANSFER_FAIL`.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre

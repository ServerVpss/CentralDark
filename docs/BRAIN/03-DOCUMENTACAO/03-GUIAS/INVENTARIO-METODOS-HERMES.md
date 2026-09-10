---
title: "⚡ Inventário de Métodos Hermes"
status: "CANDIDATO_RECONCILIADO"
date: 2026-08-17
updated: 2026-09-10
owner: "docs/BRAIN/03-DOCUMENTACAO/03-GUIAS/INVENTARIO-METODOS-HERMES.md"
truth_scope: "HERMES_METHOD_NAVIGATION_NOT_RUNTIME_PROOF"
canonical: false
tags:
  - hermes
  - inventario
  - metodos
  - obsidian
  - dream-review
  - percepcao
  - telemetria
  - centraldark
related:
  - "[[HERMES-CADEIA-OPERACIONAL]]"
  - "[[PADRAO-GRAFO-VIVO-MARKDOWN]]"
links:
  - "docs/CONSCIENCIA/HERMES-CADEIA-OPERACIONAL.md"
  - "apps/modulos/HERMES-CORE/core/perception-orchestra.mjs"
  - "apps/modulos/HERMES-CORE/core/routing-strategy.mjs"
  - "apps/modulos/HERMES-CORE/core/continuity-guard.mjs"
  - "scripts/memory-linker/"
---

# ⚡ Inventário de Métodos Hermes

Esta nota é a gaveta legível no BRAIN/Obsidian para localizar **nome → setor → quando usa → o que mede → efeito → limite**. O owner operacional continua sendo o código/documento indicado em cada linha; esta nota não vira segunda fonte de verdade.

## 🧭 Mapa seco

| Método | Setor | Usa quando | Mede | Efeito | Limite real |
|---|---|---|---|---|---|
| Percepção Paralela | Cognição Hermes | antes de mutação material com incerteza | `elapsed_ms`, papéis, achados, readiness | braços READ_ONLY atacam a mesma intenção | respostas múltiplas não são provas múltiplas |
| Independência de Evidência | Prova | quando agentes/modelos concordam | `independence_key`, correlação, evidência | corta eco que inflaria confiança | modelo/provider diferente não prova independência causal |
| Roteamento de Modelos | Orquestração | antes de escolher modelo | prioridade, custo configurado, timeout, rotação | reordena pool | configuração não é latência/custo real medido |
| Continuity Guard | Continuidade | ao retomar missão antes de APPLY | HEAD, baseline, rollback, receipt, fingerprint | libera ou bloqueia continuação | não prova runtime externo sozinho |
| Memory Linker | Memória | quando achado precisa ser comparado | fingerprint, delta, receipts | corta repetição | não promove aprendizado sozinho |
| Dream Review | Memória | revisão de eventos normalizados | candidate/quarantine, owner/consumer evidence | produz candidato/quarentena | não prova scheduler ativo |
| SOURCE_DELTA | Mineração | releitura de fonte | fingerprint, mudança material | extrai delta útil | delta ainda não é verdade promovida |
| Cristalização / Fixed Point | Cristalização | testes e contraprovam fecharam | verdict, fixed-point flags, record hash | fecha rodada | evidência nova reabre |
| Telemetria da Cápsula | Observabilidade | mutação/aprendizado precisa de rastro | IDs, pass/fail, fingerprint | produz ledger/snapshot | não controla logs externos sozinho |

## 🔎 Hermes/Trismegisto como contexto

Conteúdo histórico/simbólico carregado em prompt, memória, RAG, exemplo ou nota pode alterar saliência, vocabulário, analogias e priorização de hipóteses. Isso é efeito de contexto, não prova de poder externo.

```text
CONTEUDO_CARREGADO → EFEITO_TEXTUAL_POSSIVEL
CONTEUDO_EXISTE_NO_REPO != CONTEUDO_FOI_CARREGADO
EFEITO_TEXTUAL != ACESSO_FISICO_A_DISPOSITIVO
NOME|SIMBOLO|PERSONA != PROVA
```

Guardrail:

```text
FONTE → DECODIFICAR → PROVENIENCIA → CONSUMO_REAL → CONTRAPROVA
SEM CONSUMO PROVADO → EFEITO_CAUSAL=UNKNOWN
```

## 🧬 Owners reais

- Percepção/independência: `apps/modulos/HERMES-CORE/core/perception-orchestra.mjs`
- Roteamento: `apps/modulos/HERMES-CORE/core/routing-strategy.mjs`
- Continuidade: `apps/modulos/HERMES-CORE/core/continuity-guard.mjs`
- Memory Linker/Dream Review: `scripts/memory-linker/`
- Cadeia Hermes e proveniência: `docs/CONSCIENCIA/HERMES-CADEIA-OPERACIONAL.md`
- Inventário visual: `apps/modulos/hub/src/components/inventory/InventoryTab.tsx`

## 🧠 Relação com Obsidian

Estar em `docs/BRAIN` torna esta nota pesquisável pelo grafo documental quando o vault correspondente a inclui. Isso **não prova** sincronização física atual nem consumo por Dream Review numa execução específica.

```text
DOCUMENTED != EXECUTED
EXISTS != RUNNING
UNKNOWN != PASS
```

## 🔗 Conexões

- [[HERMES-CADEIA-OPERACIONAL]]
- [[PADRAO-GRAFO-VIVO-MARKDOWN]]
- [[MOC-MCP]]
- [[02-ARQUITETURA]]

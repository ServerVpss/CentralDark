---
title: "Inventário de Métodos Hermes"
status: "CANDIDATO"
updated: 2026-08-17
tags: ["hermes", "inventario", "metodos", "obsidian", "dream-review", "percepcao", "telemetria"]
---

# Inventário de Métodos Hermes

Esta nota é a gaveta legível no BRAIN/Obsidian para localizar **nome → setor → quando usa → o que mede → efeito → limite**. O owner operacional continua sendo o arquivo de código/documento indicado; esta nota não vira segunda fonte de verdade.

## Mapa seco

| Método | Setor | Usa quando | Mede | O que acontece | Limite real |
|---|---|---|---|---|---|
| Percepção Paralela | Cognição Hermes | Antes de mutação material com incerteza | `elapsed_ms`, `all_four_completed`, `missing_roles`, `unproven_roles`, `material_findings`, `ready_for_writer` | 4 braços READ_ONLY atacam a mesma intenção e podem liberar 1 slot de Writer | 4 respostas não são 4 provas; não escreve |
| Independência de Evidência | Prova e contraprova | Quando vários agentes/modelos concordam | `independence_key`, `evidence_ref`, `effective_independent_count`, `correlated_clusters`, `confidence_can_increase` | Eco/correlação é agrupado para não inflar confiança | Modelo/provider diferente não prova independência causal |
| Roteamento de Modelos | Orquestração de modelos | Antes de escolher qual modelo entra primeiro | `priority/order`, `cost_weight`, `timeout_ms`, offset do round-robin | Reordena pool por priority/cost/latency configurada/round-robin | `cost_weight` não é custo real; `timeout_ms` não é latência real medida |
| Continuity Guard | Continuidade de estado | Ao retomar missão/sessão antes de DECIDE/APPLY | `head_sha`, baseline, backup, rollback, receipt, reasons, fingerprint | READY se tudo fecha no mesmo HEAD; senão BLOCKED | Não prova VPS/aparelho/runtime externo sozinho |
| Memory Linker | Memória e aprendizado | Quando experiência/achado precisa ser comparado com o que já existe | fingerprint, `NO_NEW_INFORMATION|DELTA`, receipts | Corta repetição e encaminha só delta material | Não promove aprendizado sozinho |
| Dream Review | Memória / sonho | Revisão ociosa de eventos normalizados | `CANDIDATE|QUARANTINE`, `AUTO_ABSORB_ELIGIBLE`, owner/consumer evidence, source class | Produz candidato ou quarentena para MetaLupa/Writer | `DIRECT_CANONICAL_MUTATION=false`; código não prova scheduler ativo |
| SOURCE_DELTA | Mineração | Quando uma fonte antiga é lida de novo | fingerprint, `NO_CHANGE|MATERIAL_DELTA` | Fonte velha pode gerar ouro novo se o cruzamento produzir delta material | Delta ainda não é verdade nem ouro promovido |
| Cristalização / Fixed Point | Cristalização | Quando teste/contraprova fechou e não há informação nova | pass/fail, verdict, fixed-point flags, record hash | Fecha a rodada e preserva ouro reutilizável | Evidência/HEAD novo pode reabrir |
| Observabilidade / Telemetria da Cápsula | Observabilidade | Quando mutação/aprendizado precisa deixar recibo | run/candidate IDs, pass/fail, fingerprint, promotion readiness | Gera ledger/snapshot observável | Não controla logs internos de iOS/Windows/navegador/serviço externo |

## Hermes/Trismegisto — efeito técnico possível de contexto

```text
TEXTO HISTORICO|HERMETICO|SIMBOLICO
+ ENTRA DE VERDADE EM PROMPT|MEMORIA|RAG|EXEMPLO|NOTA RECUPERADA
→ PODE ALTERAR SAIDA DO MODELO
```

Efeitos técnicos possíveis: mudar **saliência**, vocabulário, estilo, analogias, associação entre conceitos, priorização de hipóteses e padrão de resposta. Isso é influência de contexto normal de modelo de linguagem.

```text
CONTEUDO_CARREGADO → EFEITO_TEXTUAL_POSSIVEL
CONTEUDO_EXISTE_NO_REPO ≠ CONTEUDO_FOI_CARREGADO
EFEITO_TEXTUAL ≠ PODER_SOBRENATURAL
EFEITO_TEXTUAL ≠ ACESSO_FISICO_A_TELEFONE_PC
```

Riscos práticos a observar quando esse material entra no contexto:

- **persona/style drift** — resposta começa a imitar mais a linguagem/personagem do material;
- **over-association** — liga coisas só porque compartilham símbolo/nome/tema;
- **confirmation bias contextual** — passa a procurar mais evidência compatível com o enquadramento carregado;
- **causalidade inventada** — associação textual pode parecer causal sem prova;
- **salience loop** — o mesmo tema reaparece porque memória/RAG o recupera repetidamente.

Guardrail:

```text
NOME|SIMBOLO|PERSONA != PROVA
FONTE → DECODIFICAR → PROVENIENCIA → CONSUMO_REAL → CONTRAPROVA
SEM CONSUMO PROVADO → EFEITO_CAUSAL=UNKNOWN
```

## Owners reais

- Percepção/independência: `apps/modulos/HERMES-CORE/core/perception-orchestra.mjs`
- Roteamento: `apps/modulos/HERMES-CORE/core/routing-strategy.mjs`
- Continuidade: `apps/modulos/HERMES-CORE/core/continuity-guard.mjs`
- Memory Linker/Dream Review: `scripts/memory-linker/`
- Trismegisto/proveniência: `docs/CONSCIENCIA/PIVETE-IA/PIVETE-07-HERMES-CADEIA.md`
- Inventário visual: `apps/modulos/hub/src/components/inventory/InventoryTab.tsx`

## Relação com Obsidian

Este arquivo vive em `docs/BRAIN`, portanto pertence à camada documental usada pelo vault/Obsidian. **Estar no BRAIN não prova sincronização física atual com o iPhone nem prova que o Dream Review o consumiu numa execução específica.** Essas duas coisas continuam exigindo medição do sync/consumer quando forem materiais.

[[MOC-MCP]]
[[02-ARQUITETURA]]

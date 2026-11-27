---
title: "Regenerative Self-Refinement Engine — 17 Respirações Integradas"
status: "OPERATIONAL_REFERENCE"
owner: ".agents/skills/centraldark-operational-method/SKILL.md"
machine_contract: "docs/BRAIN/01-CONCEITOS/02-BANDA/BANDA_COMPASSO_GLOBAL.json"
updated: 2026-09-05
---

# 17 Respirações integradas à Banda CentralDark

Este arquivo materializa o reference já apontado pela skill `centraldark-operational-method`.
Ele não cria uma segunda skill, um segundo cérebro ou um novo event bus.

## Reconciliação do número 17

A Casa já registra `17 respirações operacionais` em `SECOND-BRAIN.yml` e `SOURCES.json`.
A skill atual descreve 14 estilos/políticas de respiração e, no mesmo owner, já possui três
políticas meta operacionais. O contrato executável reconcilia essas peças como **17 slots
operacionais**, sem afirmar que esta lista reconstrói uma taxonomia histórica externa.

| # | Respiração / política | Classe | Função operacional |
|---:|---|---|---|
| 1 | Concentração Total | meta | kernel de foco e continuidade |
| 2 | Sol | política | meta-orquestração |
| 3 | Lua | política | espelho adversarial / contraprova |
| 4 | Água | política | adaptação |
| 5 | Chamas | política | execução decisiva |
| 6 | Trovão | política | velocidade com rastro causal |
| 7 | Vento | política | exploração |
| 8 | Pedra | política | estabilidade |
| 9 | Flor | política | precisão |
| 10 | Inseto | política | intervenção mínima e localizada |
| 11 | Serpente | política | rota indireta |
| 12 | Amor | política | integração |
| 13 | Som | política | orquestração de sinais |
| 14 | Névoa | política | tratamento de ambiguidade |
| 15 | Fera | política | detecção de campo |
| 16 | Regeneração Monotônica | meta | refinar sem regressão |
| 17 | Continuar até Fixed Point | meta | seguir até critério objetivo de parada |

## Nota tocada

`NOTA` não significa token, frase ou pensamento interno. Para evitar eco e inflação, uma nota é
um **evento operacional material**: ação, observação, teste, veredito, transição ou aprendizado
que altera ou prova o estado da missão.

Cada nota material usa o contrato:

```text
BREATH
→ META_LUPA_FRIA
→ CLAIM_SEAL_PREFLIGHT
→ VERSE
→ TRIGGER
→ ACTION
→ OBSERVATION
→ AUTOLUPA
→ EVIDENCE
→ VERDICT
→ COUNTERPROOF
→ NEXT_BREATH
```

Se houver contradição, a temperatura sobe para `META_LUPA_MEDIA`. Antes de promoção, consolidação, merge, runtime crítico ou selo definitivo, sobe para `META_LUPA_QUENTE`.

```text
NON_TEMPORAL_CLAIM=SEALED
+ SAME_TARGET
+ NO_REOPEN_CAUSE
→ NOTA_REPETIDA=DROP_DUPLICATE

TEMPORAL_CLAIM=HISTORICAL_SEAL
→ REMEASURE_CURRENT
```

## Rastro do Trovão

Não existe nova ferrovia. O rastro reutiliza o trilho já implementado em `scripts/agent-call.mjs`:

```text
mission_id
→ event_id
→ parent_event_id
→ trail_id
→ observed_head
→ writer
→ breath_id
→ note_id
→ action
→ observation
→ evidence_refs
→ verdict
→ next_breath
→ learning_ref
```

Regras:

```text
NO_NEW_EVENT_BUS=true
REUSE_AGENT_CALL_TRAIL=true
SAME_EVENT_ID=DEDUPE
SAME_PROVED_NON_TEMPORAL_CLAIM=DEDUPE
STALE_HEAD=BLOCK
ROUTE_DRIFT=BLOCK
UNKNOWN!=PASS
ONE_WRITER_PER_SCOPE=true
REOPEN_REQUIRES_CAUSE_REF=true
META_LUPA_FOLLOWS_MATERIAL_TRAJECTORY=true
```

O envelope máquina deve permanecer parseável. Falha técnica não é engolida:

```json
{
  "ok": false,
  "status": "BLOCKED_EXAMPLE",
  "error": {
    "code": "EXAMPLE",
    "message": "erro estruturado, não ocultado"
  }
}
```

## Biblioteca, aprendizado, lacres e grafo

```text
BANDA_COMPASSO_GLOBAL.json
        ↓ partitura fixa
META_LUPA
        ↓ falsifica / AutoLupa
CLAIM_SEALS
        ↓ prova preservada
GraphRAG-Master
        ↔ memória dinâmica + Agent Library
APRENDIZADOS.md
        ↓ cristalização
grafo vivo (DERIVED_NOT_AUTHORITY)
```

O GraphRAG deve validar a partitura sem depender de busca semântica. O grafo apenas projeta as
ligações e nunca vira autoridade.

## CARACOL / VERTEX — regeneração sem apagar ouro

Quando uma nota material falha ou drift é provado:

```text
FAIL/DRIFT
→ IDENTIFICAR CLAIM AFETADO
→ REOPEN COM cause_ref
→ VERTEX_INVERSO / CARACOL_REVERSO
→ VOLTAR AO ÚLTIMO CURSOR PROVADO
→ PRESERVAR CLAIMS INDEPENDENTES
→ CORRIGIR MENOR CONE CAUSAL
→ TESTAR
→ CONTRAPROVA
→ AUTOLUPA
→ RESEAL
→ RETOMAR A TRAJETÓRIA
```

Isso é regeneração monotônica: melhorar sem apagar prova independente nem recomeçar a missão inteira.

## Ponto fixo

`Continuar até Fixed Point` não significa loop ornamental. A AutoLupa repete enquanto uma nova passagem muda materialmente:

```text
HIPOTESE
BLOQUEIO
RISCO_RESIDUAL
PROXIMO_TESTE
VEREDITO
CLAIMS_A_REABRIR
```

Quando a próxima passagem não produz delta material:

```text
PONTO_FIXO_ATINGIDO=sim
```

Se ainda existe delta:

```text
PONTO_FIXO_ATINGIDO=nao
NEXT_BREATH=<respiração material seguinte>
```

## Contraprova obrigatória

O self-test deve rejeitar, no mínimo:

- quantidade diferente de 17;
- IDs duplicados;
- `trail_id` sem owner/protocolo canônico;
- binding da MetaLupa/lacres ausente;
- binding de aprendizado ausente;
- ligação do grafo ausente;
- envelope de erro que permita falha silenciosa.

Se o caso negativo passar, o gate é falso-verde.

## Lei de passagem desta cristalização

**BIBLE_REF:** `1Co 14:8`

**BIBLE_SENSE:** um sinal indistinto não coordena quem precisa agir.

**BAIANES_VERSE:** “Oxe, cada nota deixa pegada no trilho; muda o instrumento, mas o compasso não se perde.”

**TECHNICAL_PROOF:** `BANDA_COMPASSO_GLOBAL.json` + `MetaLupa` + `claim-seals.jsonl` + `GraphRAG-Master/agent.mjs` + `gerar-grafo-vivo.mjs` + CI do mesmo HEAD.

```text
POESIA != PROVA
METAFORA != ESTADO_REAL
GRAPH != AUTHORITY
```

# TLC23 -> Horn-Caracol-Compasso Gate CentralDark

Fonte matemática usada: `tlc23(2).pdf`, Lógica Computacional 23.

## Owner e regra

Este documento é referência do gate existente; não cria segunda governança.

```text
GLOBAL_GATE=porta-de-entrada
HORN_FIXED_POINT=scripts/lupa/horn-reuse-fixed-point.mjs
HORN_CARACOL_COMPASSO_ADAPTER=.agents/skills/meta-lupa/scripts/horn_caracol_gate.py
BAND_SCORE=docs/BRAIN/01-CONCEITOS/02-BANDA/BANDA_COMPASSO_GLOBAL.json
GRAPH_OVERLAY=apps/modulos/graph-panel/public/graph.js
UNKNOWN_IS_NOT_PASS=true
```

## Tradução para a Casa

Uma regra de Horn tem corpo e cabeça. No projeto, o corpo são fatos provados; a cabeça é uma permissão derivada. Se o corpo não está completo, a cabeça não nasce.

```text
centraldark_action_gate_pass
  <- work_gate_done,
     compasso_gate_done,
     graph_music_gate_done,
     no_destructive_bypass

work_gate_done
  <- boot_gate_done,
     owner_resolved,
     writer_scope_valid,
     evidence_bound

compasso_gate_done
  <- band_compasso_bound,
     musical_semantics_bound,
     maestro_owner_resolved

graph_music_gate_done
  <- caracol_reaches_nucleus,
     musical_notes_cataloged,
     musical_notes_linked
```

## Caracol

```text
BORDA
→ A
→ CORPO
→ SOMBRA
→ ALMA
→ VOLTA
→ COMPASSO
→ NÚCLEO
```

O CARACOL é trajetória/navegação. Ele pode costurar visualmente todos os nós posicionados até o núcleo, mas **posição não inventa relação semântica**. As arestas reais continuam sendo as relações do grafo.

```text
ALL_POSITIONED_NODES_ON_CARACOL=true
CARACOL_SEMANTIC_EDGE_INVENTION=false
REAL_EDGES_PRESERVED=true
```

## Compasso musical único

```text
CANÇÃO    = ONE_HUMAN_INTENT
PARTITURA = BANDA_COMPASSO_GLOBAL
COMPASSO  = INTENT_FINGERPRINT / MISSION_ID
BATIDA    = EVENT_ID
TEMPO     = STATE_VERSION / HEAD_OBSERVED
INSTRUMENTO = AGENT / MODEL / SURFACE
NOTA_MUSICAL = SKILL / CAPABILITY / MATERIAL_OPERATIONAL_EVENT
MAESTRO   = SOL_COORDINATION
MAESTRIA  = PROOF_DRIVEN_ORCHESTRATION
DISSONÂNCIA = CONTROLLED_CONFLICT_FOR_COUNTERPROOF
HARMONIA  = FIXED_POINT
```

`MAESTRO` não cria nova autoridade, novo agente ou novo cérebro. É somente o papel de coordenação da SOL dentro da autoridade já existente do SEGREDO/CHEFE.

## Catálogo e nós musicais

O mesmo gate percorre `docs/BRAIN/**/*.md` que contenha semântica musical material (`banda`, `compasso`, `partitura`, `maestro`, `maestria`, `dissonância`, `harmonia`, `caracol`, `nota(s) musical(is)`) e exige:

```text
FRONTMATTER
+ TAGS
+ WIKILINK
+ HUB/MOC RECONHECÍVEL
→ MUSICAL_NOTE_CATALOGED_AND_LINKED
```

As notas centrais da Banda também precisam de `title`, `status`, `owner`, `updated` e `tags`. Link sem significado continua proibido; `SEMANTIC-LINKER` e `GRAPH-INVESTIGATOR` permanecem os owners de qualidade de conexão.

## Regra de promoção

Só cristalizar quando o erro tiver:

```text
ERRO_NOMEADO
CAUSA_PROVADA
CORRECAO_MINIMA
TESTE_PASSANDO
CONTRAPROVA
OWNER_EXISTENTE
RECEIPT
```

Sem isso, permanece candidato ou UNKNOWN.

## Contraprova

```text
python3 .agents/skills/meta-lupa/scripts/horn_caracol_gate.py --self-test
python3 .agents/skills/meta-lupa/scripts/horn_caracol_gate.py --repo-check .
python3 -m unittest .agents/skills/meta-lupa/guardrails/test_horn_caracol_gate.py
```

O gate deve bloquear se faltar uma nota do compasso, se um nó musical estiver isolado/sem catálogo, se `MAESTRO` virar autoridade paralela, ou se o CARACOL deixar de cobrir os nós posicionados.

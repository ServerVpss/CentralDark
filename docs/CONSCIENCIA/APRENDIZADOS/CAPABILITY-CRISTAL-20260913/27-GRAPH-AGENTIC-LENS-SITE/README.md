# CentralDark Graph Agentic Lens — patch candidate

Objetivo: **evoluir o owner existente `apps/modulos/graph-panel`**, não criar frontend/brain paralelo.

O visual foi inspirado nas evidências anexadas pelo CHEFE: grafo radial denso, câmera/zoom e núcleo visual.
O patch corrige os pontos que esse estilo normalmente não resolve sozinho:

- núcleo protegido: linhas não atravessam a lente central;
- cada nota tem uma `PRIMARY_SPINE` para seu owner/pai/âncora de comunidade;
- cross-links são roteados por fora do núcleo;
- espaçamento radial matemático evita esmagamento;
- labels aparecem por foco/zoom, não todas de uma vez;
- `REFERENCES` e `CAUSED` têm visuais diferentes;
- filtros por state/type/relation;
- análise agentic **read-only** de orphan/conflict/unknown/stale/high-degree;
- foco causal em anéis;
- provenance de cada sugestão;
- modo LIVE tenta consumir `/api/graph?mode=vivo`;
- fallback local usa `sample-graph.json`.

## Não é um serviço novo

`dev-server.mjs` serve apenas o protótipo local. Em produção, os assets devem ser encaixados no
`graph-panel` existente e continuar consumindo `/api/graph`.

## Rodar local

```bash
cd 27-GRAPH-AGENTIC-LENS-SITE
node dev-server.mjs
# http://127.0.0.1:4177
```

## Arquitetura visual

```text
                     RING 4 — HISTORY/REFERENCE
             RING 3 — MEMORY/DEPENDENCY/DECISION
          RING 2 — AGENT/TOOL/SOURCE/EVIDENCE
            RING 1 — DIRECT CAUSAL NEIGHBORS
                  [ FOCUS LENS ]
```

O centro é **lente virtual**, não owner, não autoridade e não “AGI node”.

## Geometria

Para um nó num raio `r`, o espaçamento angular mínimo é:

`dθ >= 2 * asin((node_radius + padding) / r)`

Quando o setor não comporta mais nós, o overflow sobe para o próximo anel.

Uma aresta cujo segmento cruza `CORE_GUARD_RADIUS` é transformada em curva de Bézier
com ponto de controle tangencial fora do núcleo.

## Agentic Lens

O ranking local não escreve nada. Ele só produz candidatos:

`CONFLICT > UNKNOWN > ORPHAN > STALE > HIGH_DEGREE`

Cada sugestão inclui `reason`, `score`, `node_id` e `evidence fields`.
A promoção continua pertencendo aos owners/gates da CentralDark.

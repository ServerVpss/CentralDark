# PADRAO - CENTRALDARK-FORJA-FLASH-GROK-ONE-SHOT-20260824.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\🔒PASTA TRANCADA APELO CHEFE🔒\CENTRALDARK-FORJA-FLASH-GROK-ONE-SHOT-20260824.md
**SHA:** 1bf82bde2345e2e5
**Timestamp:** 2026-08-27T15:05:36.862507
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- RESTART=false
- - Runtime prompt: apps/modulos/HERMES-CORE/prompts/hermes-core.md

### Contratos
- Sem teste/gate: `CANDIDATE`.
- - crystal lacks owner/consumer/test/gate = not FLASH_READY;

### Ouro Bruto (primeiros 5000 chars)
```
# CentralDark — FORJA → CRISTAL → FLASH

**Pacote de arquitetura + comando one-shot para Grok Build**  
**Data:** 2026-08-24  
**Missão:** absorver o ouro das fontes no Segundo Cérebro CentralDark já existente no GitHub e nas superfícies locais, com gatilhos automáticos, generalização por evidência e zero cérebro paralelo.

---

## 1. Veredito executivo

Não criar `AutoBot V2`, novo RAG, segundo cérebro **paralelo**, novo MCP, novo daemon nem novo workflow.

A CentralDark já possui os órgãos principais:

- `CENTRALDARK-TRIGGER-FABRIC`: entrada, retomada, pré-retorno, gates e continuidade;
- `session-intelligence-harvester`: colhe decisão, erro, padrão, contradição, evidência e delta temporal;
- `scripts/memory-linker`: normalização, fingerprint, dedupe, Dream Review, padrão determinístico e handoff ao Writer;
- `knowledge-compiler`: FORJA rigorosa, owner/skill/consumer/test/gate, cristal operacional e rota `FLASH_READY`;
- `vector-memory`: owner declarado da memória semântica, ainda sem runtime provado;
- `GraphRAG-Master`: consumidor real do Hermes, hoje com grafo + fallback textual local;
- Hermes/PIVETE: único executor e preservador da continuidade;
- GitHub: ledger **e camada canônica do Segundo Cérebro** (`docs/CONSCIENCIA`, owners, skills, memória/knowledge, contratos, histórico e provas);
- superfícies locais/Obsidian/arquivos: captura, trabalho e consulta do mesmo Segundo Cérebro lógico;
- grafo e índice vetorial: projeções derivadas desse mesmo cérebro, nunca autoridade paralela;
- realidade/runtime: Judge.

```text
SECOND_BRAIN_LOGICAL=ONE
SECOND_BRAIN_SURFACES=GITHUB_CANONICAL+LOCAL_OBSIDIAN_FILES+DERIVED_GRAPH_VECTOR
GITHUB_IS_NOT_JUST_OUTPUT=true
LOCAL_IS_NOT_PARALLEL_BRAIN=true
GRAPH_VECTOR_ARE_DERIVED_INDEXES=true
```

O delta útil é **interligar e endurecer**, não reconstruir:

```text
MATÉRIA NOVA | CORREÇÃO | ERRO | FALHA | CONTRADIÇÃO | DELTA DE ESTADO
→ TRIGGER FABRIC
→ SESSION INTELLIGENCE HARVESTER
→ MEMORY LINKER
→ KNOWLEDGE COMPILER
→ OWNER + SKILL + CONSUMER + TEST + GATE
→ CRISTAL CANÔNICO
→ VECTOR MEMORY + GRAPH RAG
→ ROTA FLASH DO HERMES
→ AÇÃO + PROVA + CONTRAPROVA
→ NOVA MATÉRIA
```

Isso é um **autobot generalizador deliberado**, mas com fronteira correta:

```text
ROTINA CONHECIDA → DETERMINÍSTICA
AMBIGUIDADE MATERIAL → GENERATIVA/DELIBERATIVA
MUTAÇÃO → UM WRITER
PROMOÇÃO → PROVA + GATE
REALIDADE → JUDGE
```

## 2. Estado vivo usado como baseline

> Este snapshot serve só como ponto de partida. O Grok deve medir tudo novamente antes da primeira mutação e antes do veredito final.

```yaml
repository: ServerVpss/CentralDark
default_branch: main
main_head_observed: d85a5c27058fa131a16783831aaacc0edb9a275d
live_pr:
  number: 1131
  state_observed: OPEN
  mergeable_observed: true
  branch: feat/trigger-fabric-camisa-forca-operacional
  head_observed: 61d7127db11410726cc58131b2bf24af4d9aaeae
  writer_declared: SOL
  scope: trigger-fabric+bot-entry+hermes-engine-binding+autonomia-ci
collision_watch:
  - pr: 1130
    writer_declared: Grok/SOL
    scope: writer-safe-push+labels+autonomia-varredura
mutation_done_by_this_package: false
deploy_authorized_by_this_package: false
```

O PR [#1131](https://github.com/ServerVpss/CentralDark/pull/1131) já implementa `BOT_ENTRY`, `PRE_HUMAN_RETURN`, `RESUME`, `OUTPUT_GUARD`, engine binding e gate de pacote. Portanto, toda evolução desta missão deve continuar nesse mesmo owner/PR quando o estado vivo ainda confirmar isso.

## 3. Ouro extraído das fontes

| Fonte | Ciência útil | Tradução CentralDark | Decisão |
|---|---|---|---|
| [Grok Build — DataCamp](https://www.datacamp.com/pt/tutorial/grok-build-tutorial) | instruções permanentes de projeto, permissões seguras, hooks, worktrees, memória entre sessões, loop e inspeção | `AGENTS.md`/boot já são instruções permanentes; Trigger Fabric já é a família de hooks; worktree serve para isolamento; engine nunca vira owner | **Reusar**; acrescentar somente hook físico/prova e binding de Grok como engine |
| [De engenheiro a sênior](https://ps11.hashnode.dev/from-software-engineer-to-senior) | perguntar “por quê”, escolher impacto máximo com solução simples, equilibrar velocidade/qualidade, assumir ponta a ponta, buscar feedback | `DESTINATION_LOCK`, `META_MENOS_E_MAIS`, owner/consumer, Writer responsável e ciclo erro→correção→aprendizado | **NO_CHANGE arquitetural**; virar critério de roteamento/receipt |
| [RAG Builder local](https://ps11.hashnode.dev/beyond-google-search-understand-and-build-your-personal-ai-with-rag-builder) | load→chunk→embed→store; busca semântica + keyword; query expansion; rerank; contexto com fonte e score; local-first | ativar o owner `vector-memory` e conectá-lo ao `GraphRAG-Master`; indexar o Segundo Cérebro canônico do GitHub e as fontes locais permitidas, respeitando sensibilidade/proveniência | **GAP REAL** |
| [Robô Keku](https://ps11.hashnode.dev/i-built-a-robot-crab-named-keku-here-s-everything-that-went-wrong-and-right) | testar cada parte antes da montagem, construir
```
---
title: "Reconciliação de Memória — Memory Linker × Grafo Vivo × Canônico"
date: 2026-09-15
status: "RECONCILIADO"
owner: "docs/RELATORIOS/2026-09-15-memory-linker-reconciliation.md"
truth_scope: "MEMORIA_RECONCILIACAO_MEMORY_LINKER_GRAFIVO_VIVO_CANONICO"
canonical: false
tags:
  - memoria
  - memory-linker
  - reconciliação
  - grafo-vivo
  - linker-report
related:
  - "[[docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md]]"
  - "[[docs/CONSCIENCIA/MAPA-DO-CEREBRO.md]]"
  - "[[docs/CONSCIENCIA/APRENDIZADOS.md]]"
links:
  - "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json"
  - "docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md"
---

# Reconciliação de Memória — Memory Linker × Grafo Vivo × Canônico

> Registro de cruzamento entre o relatório do memory-linker (analyst-decision.json), o pipeline de memória canônico (`scripts/memory-linker/`) e o grafo vivo (`scripts/grafo-vivo/`). Objetivo: mostrar para onde cada link quebrado/delta deve ir, sem criar memória paralela.

## Estado real medido antes do cruzamento

- `docs/CONSCIENCIA/00-MEMORIA/` **não existe**. Memória canônica não mora aqui.
- Memória canônica ativa:
  - `docs/CONSCIENCIA/APRENDIZADOS.md`
  - `docs/CONSCIENCIA/APRENDIZADOS/`
  - `docs/CONSCIENCIA/MAPA-DO-CEREBRO.md`
  - `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md`
  - `docs/CONSCIENCIA/CONTRATO-LUPA-BAYESIANA.md`
  - `docs/CONSCIENCIA/PADRAO-GRAFO-VIVO-MARKDOWN.md`
  - `docs/CONSCIENCIA/PROTOCOLO-INICIALIZACAO.md`
  - `docs/CONSCIENCIA/MAPA-DOS-BOTS.md`
  - `docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md`
- Memory-linker canônico: `scripts/memory-linker/`.
  - Inbox com 4 lotes: `15c61037b1978c83`, `4b4c857f6efdfb61`, `9833c18b2d85bc59`, `e158bcd0e578b626` — contêm node_modules de MCP packages (chrome-devtools-mcp, hono, playwright, screenpipe), não memória.
  - `routes.json` **não existe** — o pipeline não usa roteamento externo.
  - Motor de mineração: `dream-review.mjs`, `delta-core.mjs`, `library-router.mjs`, `pattern-discovery.mjs`.
- Grafo vivo: loop `scripts/grafo-vivo/loop.mjs` a cada 5min; `cron-grafo-unificado.sh` a cada 6h.
- analyst-decision.json: timestamp `2026-09-15T16:15:02Z`, fingerprint `97f298c3ea5836d7eaa842c3ea940c1d4b72b2705ec6e5a8086ec6d7e3041b08`, `totalAlto: 36`, `totalAutoFix: 47`, `totalCritico: 0`.

## Conclusão central

A maioria dos “link quebrados” reportados não é conteúdo perdido. É **referência cruzada de vault Obsidian antigo** (`docs/BRAIN/`) que usa wikilinks com nomes conceituais ou títulos que não resolvem como arquivos físicos no filesystem do memory-linker. O canônico atual já possui a maioria dos alvos reais, em outros caminhos.

Não há gap de memória ativa. Há vestígio de vault antigo e índice inconsistente.

## Mapping detalhado

### Links que existem em outro caminho no Git

| link reportado | originou de | existe no Git | dono canônico corrente | ação mínima |
|---|---|---|---|---|
| `06-REUNIOES-NOTAS` | `README` | `docs/BRAIN/06-REUNIOES-NOTAS` (vault antigo) | histórico/espelho | não criar |
| `07 - APRENDIZADOS & MEMÓRIAS/README` | garimpos 2026-08-28 | `docs/BRAIN/07-APRENDIZADOS-MEMORIAS` | histórico; canônico: `docs/CONSCIENCIA/APRENDIZADOS.md` | não criar |
| `07-APRENDIZADOS-MEMORIAS` | `README` | `docs/BRAIN/07-APRENDIZADOS-MEMORIAS` | mesma coisa | mesma coisa |
| `08 - APRENDIZADOS & MEMÓRIAS/README` | `2026-08-16-verde-delta-fechado-promove` | não encontrei arquivo exato | canônico: `docs/CONSCIENCIA/APRENDIZADOS.md`; aprendizado: `docs/CONSCIENCIA/APRENDIZADOS/2026-08-16-verde-delta-fechado-promove.md` | registrar mapeamento |
| `30-DETERMINISTIC-FULL-PACKAGE` | `2026-09-09-CRISTAL-FULL-SESSAO-CENTRALDARK` | `docs/INSTALADOR/30-deterministic-full-package.md` | `docs/INSTALADOR/30-deterministic-full-package.md` | registrar mapeamento |
| `ADM-GATILHOS-OPERACIONAIS` | `PADRAO-EMOJIS` | `docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json` | `docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json` | registrar mapeamento |
| `BIBLIOTECA COGNITIVA` | `README` | `docs/BRAIN/.../BIBLIOTECA.md` | vault antigo; canônico próximo: `docs/CONSCIENCIA/` sem biblioteca ativa explícita | registrar mapeamento |
| `BIBLIOTECA/README` | `2026-09-03-mandato-preservar-ouro-chefe` | `docs/BRAIN/.../BIBLIOTECA.md` | mesma coisa | mesma coisa |
| `CENTRALDARK LIVING LEARNING` | `README` | não encontrei | provável nó antigo sem owner ativo | registrar como histórico |
| `CENTRALDARK_FONTES_GITHUB_DRIVE_RECONCILIATION` | `PADRAO-GRAFO-VIVO-MARKDOWN` | `docs/RECEIPTS/CENTRALDARK_FONTES_GITHUB_DRIVE_RECONCILIATION.md` | `docs/RECEIPTS/CENTRALDARK_FONTES_GITHUB_DRIVE_RECONCILIATION.md` | registrar mapeamento |
| `CENTRALDARK_ZENDRIVE_OBSIDIAN_AUTOMACOES` | `PADRAO-GRAFO-VIVO-MARKDOWN` | `docs/RECEIPTS/CENTRALDARK_ZENDRIVE_OBSIDIAN_AUTOMACOES.md` | `docs/RECEIPTS/CENTRALDARK_ZENDRIVE_OBSIDIAN_AUTOMACOES.md` | registrar mapeamento |
| `CENTRALDARK-HUBBOT` | `MOC-PM2` | `docs/BRAIN/.../MOC-CentralDark-HubBot.md` | vault antigo | registrar mapeamento |
| `COCKPIT-AVANCO` | `OMNI-MEGAZORD-LOOP` | `docs/CONSCIENCIA/COCKPIT-AVANCO.json` + README | `docs/CONSCIENCIA/COCKPIT-AVANCO.md` | registrar mapeamento |
| `ELITE-GATEWAY` | `PROTOCOLO-INICIALIZACAO` | `apps/modulos/elite-gateway/`, revisoes | `docs/CONSCIENCIA/06-MCP-CENTRALDARK.md`, `04-MCP-E-CONECTORES/` | registrar mapeamento |
| `MEMORIA-LONGA` | `OBSIDIAN-CASA-SINCRONIZACAO` | `apps/bot-telegram/skills/externas/memoria-longa.cjs` | `apps/bot-telegram/skills/externas/memoria-longa.cjs` | registrar mapeamento |
| `META-LUPA` | `DISSONANCIA_OPERACIONAL_CONTROLADA` | `.agents/skills/meta-lupa/SKILL.md`, `CONTRATO-LUPA-BAYESIANA.md` | mesma coisa | registrar mapeamento |
| `RELATORIO-SWARM-GRAFO` | `INDEX` | `docs/BRAIN/.../RELATORIO-SWARM-GRAFO.json` | vault antigo | registrar mapeamento |

### Nós conceituais (wikilinks sem arquivo separado)

| link reportado | originou de | natureza | dono canônico de referência |
|---|---|---|---|
| `CLAUDE` | `PROTOCOLO-INICIALIZACAO` | nó conceitual do vault antigo | `docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md`, `JEITO-CORRETO-DO-PIVETE.md` |
| `GITHUB` | `PROTOCOLO-INICIALIZACAO` | nó conceitual | `REPOSITORIO-OFICIAL.md`, `GITHUB-PR-OBSERVAR-CODEX.md` |
| `HUB` | `PROTOCOLO-INICIALIZACAO` | nó conceitual | `MAPA-DOS-BOTS.md`, MOC-HubBot |
| `IA` | `MAPA-DOS-BOTS` | nó conceitual | `00-PORTA-DE-ENTRADA-IA.md` |
| `INFRA/DEPENDENCIAS` | `PENDENCIAS` | nó conceitual | `PENDENCIAS.md`, `04-ESTRUTURA-VPS.md` |
| `KNOWLEDGE COMPILER` | `README` | skill canônico | `.agents/skills/knowledge-compiler/SKILL.md` |
| `LINKS` | `GUIA-PROMPTS`, `TUTORIAL-OBSIDIAN` | nó conceitual | índice de links não é arquivo separado |
| `OBSIDIAN-WRITER` | `TUTORIAL-OBSIDIAN` | nó conceitual | sem owner separado; provável histórico |
| `OBSIDIAN` | `PROTOCOLO-INICIALIZACAO` | nó conceitual | vault antigo `docs/BRAIN/` |
| `PM2` | `PROTOCOLO-INICIALIZACAO` | nó conceitual | `INVENTARIO-PM2-VPS.md`, `08-HISTORICO-DECISOES.md` |
| `SEM TÍTULO` / `SEM TÍTULO 1` | `INDEX` | histórico não identificado | orfão candidato |
| `SINCRONIA-4-PONTO` | `PROTOCOLO-INICIALIZACAO` | nó conceitual | `PROTOCOLO-INICIALIZACAO.md` (linha 140-143) |
| `SKILL` / `SKILLS` | `PROTOCOLO-INICIALIZACAO` | nó conceitual | `.agents/skills/`, `inventario-skills.json` |
| `TELEGRAM` | `PROTOCOLO-INICIALIZACAO` | nó conceitual | `apps/bot-telegram/`, `MAPA-DOS-BOTS.md` |
| `VPS` | `PROTOCOLO-INICIALIZACAO` | nó conceitual | `04-ESTRUTURA-VPS.md`, `INVENTARIO-PM2-VPS.md` |
| `MOC-PM2` | `PROTOCOLO-INICIALIZACAO` | nó conceitual | `MAPA-DOS-BOTS.md`, MOC-HubBot |
| `MOC-MCP` | `PROTOCOLO-INICIALIZACAO` | nó conceitual | `00-PORTA-DE-ENTRADA-IA.md` |

### AutoFix “sem-conexoes-rapidas” e “sem-frontmatter”

Lista de 47 arquivos. Vários existem e são canônicos (ex: `APRENDIZADOS.md`, `HORN-COGNITIVE-LOCK`, `PADRAO-EMOJIS`, `PADRAO-GRAFO-VIVO-MARKDOWN`, `OMNI-MEGAZORD-AUTONOMY-V3`, `OMNI-MEGAZORD-LOOP`, `MEGAZORD-001-RECEIPT`, `POMBO-LINEAGE-RULE`, `DELTA-UTIL-FULL-CENTRALDARK-HARNESS-20260909`, `REFERENCIA-LOGICA-HORN-REUSE-FIXED-POINT`, `BRANCHES-ESTACIONADAS-PR-MAE`). A flag é relativa ao índice do vault antigo, não ao canônico atual. Não aplicar correção em massa sem `--dry-run` e revisão arquivo a arquivo.

### Orfas-excessivas: 406

Vestígio do vault antigo `docs/BRAIN/` com centenas de notas desconectadas do índice canônico atual. Não é gap de memória ativa. Não absorver como memória nova.

## O que é delta real

- Existe arquivo real no Git que o índice do memory-linker não resolveu porque o índice era do vault antigo e usa nomes diferentes dos caminhos atuais. Exemplo: `30-DETERMINISTIC-FULL-PACKAGE` existe em `docs/INSTALADOR/30-deterministic-full-package.md`.
- `PADRAO-GRAFO-VIVO-MARKDOWN.md` já é consistente: linka os receips existentes e menciona os títulos no frontmatter.

## O que é ruído/órfão/histórico

- Wikilinks conceituais que nunca foram arquivos rastreados: `CLAUDE`, `GITHUB`, `HUB`, `IA`, `PM2`, `TELEGRAM`, `VPS`, `SKILL`, `SKILLS`, `SINCRONIA-4-PONTO`, `OBSIDIAN`, `MOC-PM2`, `MOC-MCP`.
- `docs/BRAIN/` como vault antigo: READMEs e índices dele geraram a maioria dos breakers.
- `SEM TÍTULO`, `CENTRALDARK LIVING LEARNING`, `OBSIDIAN-WRITER`: sem owner canônico ativo identificado.

## Para onde cada classe de delta deve ser absorvida

1. Links que apontam para arquivo existente em outro caminho: registrar mapeamento no **relatório** e, se autorizado, atualizar o **arquivo que referencia** (ex: `PADRAO-GRAFO-VIVO-MARKDOWN.md`, `PROTOCOLO-INICIALIZACAO.md`) com note de mapeamento, sem criar arquivo paralelo.
2. Nós conceituais: registrar mapeamento no relatório; dono canônico de referência é o arquivo que cita o nó (ex: `PROTOCOLO-INICIALIZACAO.md`, `00-PORTA-DE-ENTRADA-IA.md`, `MAPA-DOS-BOTS.md`).
3. Orfas/excessivas: não absorver; registrar como vestígio do vault antigo.
4. AutoFix sem-conexoes-rapidas: auditar arquivo por arquivo; não aplicar em massa.

## Gap real detectado

- Não existe registro explícito de mapeamento entre os títulos/nós do vault antigo e os owners canônicos atuais. Isso é um gap de documentação, não de memória. O menor delta para cobrir é registrar esse mapeamento no relatório e, se desejado, no `00-LEIA-PRIMEIRO.md` ou `MAPA-DO-CEREBRO.md`.
- O memory-linker pode estar varrendo índice que inclui `docs/BRAIN/` como se fosse canônico vivo. Se o vault antigo não deve mais ser escaneado como memória ativa, isso deve ser configurado no pipeline, não resolvido arquivo a arquivo.

## O que NÃO foi feito agora

- Não toquei `APRENDIZADOS.md`, `SOUL-SOL.md`, `PROTOCOLO-INICIALIZACAO.md`, `PADRAO-GRAFO-VIVO-MARKDOWN.md`, `MAPA-DO-CEREBRO.md`, `CONTRATO-LUPA-BAYESIANA.md` — só li.
- Não apliquei autoFix do memory-linker em massa.
- Não criei memória paralela. Este relatório é registro de atividade, não memória canônica nova.

## Próximo passo

Se o CHEFE aprovar, eu:
1. Rodo `memory-executor-agent.mjs --dry-run` para mostrar o que o executor faria com esses achados.
2. Aplico o menor delta documental seguro: atualizar o arquivo que referencia o alvo real com link canônico explícito e/ou registrar mapeamento mínimo no owner canônico correto.
3. Registro recibo com SHA, diff e comando.

## Fio da missão

Reconciliação de memória: cruzar memory-linker × grafo vivo × canônico e mapear onde cada breakpoint/delta deve ir. Sem criar memória paralela.

---

Gerado por: SOL/Hermes no CentralDark.
Estado real medido em 2026-09-15.

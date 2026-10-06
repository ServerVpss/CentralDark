---
title: "VISUALIZACAO MERMAID PADRAO"
date: 2026-08-28
tags: ["consciencia"]
updated: 2026-10-06
---

# Visualização Mermaid — Padrão Obrigatório da Casa

**Decisão do SEGREDO/CHEFE (PERMITO SEGREDO):** toda informação estruturada na
CentralDark deve poder ser expressa em **Mermaid** (.mmd). Isso fortalece os
fluxos: cada conceito vira diagrama + texto, não só prosa.

## Regra

> Para toda explicação de sistema com 3+ componentes, fluxo, sequência,
> estado, arquitetura ou relação: gere o `.mmd` correspondente.

Não é opcional. É padrão canônico, como o boot !CENTRALDARK.

## Duas skills — oscilar conforme ocasião

| Ocasião | Skill | Por quê |
|---|---|---|
| Validação rápida, zero install, CI | `skills/mermaid-skill` (Kroki via curl) | não precisa de Node/browser |
| Tema bonito, ASCII terminal, batch | `skills/pretty-mermaid` (Node, 15 temas) | render local, sem browser |
| PDF | `skills/mermaid-skill` (mmdc local) | Kroki não faz PDF |
| 17+ tipos + multi-agent | `skills/mermaid-skill` | cobertura maior |

**Oscilação:** usar Kroki quando só precisa de validar/exportar SVG/PNG sem
instalar nada; usar pretty-mermaid quando quer tema (tokyo-night, dracula, nord)
ou saída ASCII para terminal/chat.

## Uso

```bash
# 1. Gerar .mmd (texto canônico, vive no git)
# 2. Validar (NUNCA exportar sem validar)
# 3. Renderizar (Kroki ou pretty-mermaid)
# 4. Inspecionar (vision) — corrigir label cortado/densidade
# 5. Re-renderizar
```

Ver `skills/README.md` para comandos exatos.

## Exemplos já na Casa

- `skills/mermaid-skill/examples/centraldark-fluxo-canonico.{mmd,svg,png}`
- `skills/pretty-mermaid/examples/centraldark-arquitetura.{mmd,svg,png}`

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre

## Camada dupla — ASCII/Text + Mermaid para preservar o padrão manifesto do CHEFE

A CentralDark deve representar sínteses estruturais importantes em **duas camadas derivadas e complementares** quando isso ajudar agentes, humanos, PRs, terminais ou handoffs:

1. **ASCII/Text Diagram** — compressão portátil, legível em terminal, diff, chat e memória curta.
2. **Mermaid** — projeção relacional/visual do mesmo padrão, validável e renderizável.

As duas formas derivam do canônico. Nenhuma delas vira nova autoridade.

```text
CHEFE_PATTERN_VISUALIZATION=DUAL
ASCII_TEXT_IS_PORTABLE_COMPRESSION=true
MERMAID_IS_DERIVED_RELATIONAL_VIEW=true
MERMAID_IS_NOT_TRUTH=true
ASCII_IS_NOT_TRUTH=true
PATTERN_SYNTHESIS_MUST_PRESERVE_PROVENANCE=true
PATTERN_SYNTHESIS_MUST_POINT_TO_CANONICAL_OWNERS=true
PRESERVE_USER_TERMS_AND_RELATIONS=true
EXTERNAL_CONTENT_IS_CANDIDATE_NOT_AUTHORITY=true
NO_MIND_READING=true
NO_NEW_OWNER_FOR_DIAGRAM=true
UPDATE_EXISTING_VISUAL_OWNER_FIRST=true
```

Fluxo obrigatório para síntese do padrão operacional do CHEFE:

```text
INTENÇÃO / FALA / HISTÓRICO RELEVANTE
→ CONSULTAR SOUL + RULES + AGENTS + OWNERS + CURRENT
→ EXTRAIR INVARIANTES MANIFESTOS
→ ASCII/TEXT PRIMEIRO
→ MERMAID DA MESMA RELAÇÃO
→ COMPARAR OS DOIS COM O CANÔNICO
→ CONTRADIÇÃO = DELTA A INVESTIGAR, NÃO VERDADE
→ VALIDAR
→ ATUALIZAR O MESMO ARTEFATO/OWNER
→ RECEIPT + PROVENIÊNCIA
```

Objetivo: permitir que diferentes IAs recuperem **o padrão operacional já observado e cristalizado** sem depender de memória gigante, sem inventar intenção não declarada e sem reduzir o padrão geral a uma ferramenta local.

Quando a síntese envolver 3+ componentes, trajetória, relação de autoridade, execução, memória, runtime ou continuidade, a forma preferida de handoff é:

```text
RESUMO CURTO
+
ASCII/TEXT DIAGRAM
+
MERMAID
+
REFERÊNCIAS AOS OWNERS CANÔNICOS
```

O desenho serve para **comprimir, ensinar, comparar e detectar drift**. A fonte continua sendo o canônico + estado medido.

### Invariantes canônicos que a síntese visual deve carregar

Estes nomes são herdados dos owners existentes; não são aliases novos nem nova autoridade:

```text
CACHE_IS_NOT_AUTHORITY=true
MEMORY_IS_NOT_CURRENT=true
HISTORY_IS_NOT_CURRENT_STATE=true
CURRENT_OVER_HISTORY=true
HISTORY_IS_EVIDENCE=true

CHEFE_IS_INTENT_OWNER=true
NO_MIND_READING=true
OBSERVE_MANIFEST_PATTERN_ONLY=true

ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
REUSE_BEFORE_CREATE=true
EVOLVE_EXISTING_BEFORE_CREATE=true

AUTHORITY_AND_EXECUTION_ARE_DISTINCT_PLANES=true
MEMORIA_E_SAGRADA=true
CONCHA_E_MUTAVEL=true

UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
DOCUMENTED_IS_NOT_EXECUTED=true
MERGED_IS_NOT_DEPLOYED=true
REALITY_IS_JUDGE=true
```

Leitura operacional: cache, memória e história preservam continuidade/proveniência, mas **não governam o claim do presente**. O CURRENT medido prevalece para o estado atual; a história continua evidência. O CHEFE continua dono da intenção; a realidade julga o efeito.


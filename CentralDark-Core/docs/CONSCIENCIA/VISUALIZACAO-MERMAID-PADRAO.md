---
title: "VISUALIZACAO MERMAID PADRAO"
date: 2026-08-28
tags: ["consciencia"]
updated: 2026-11-03
---

# Visualização Mermaid — Padrão Obrigatório da Casa

@code_ref: skills/mermaid_render.py
@code_ref: skills/pretty-mermaid/scripts/render.mjs
@last_updated: 2026-11-03T19:58:06.891Z

<!-- PR_MERMAID_TRIPLE_FORMAT_RENDER_20261103 -->
## 🍒+1 CURRENT — todo PR tem explicação visual derivada + três formatos

**Fonte da verdade:** código, owners e registries permanecem na `main`; diagramas, Mermaid, SVG/PNG/ASCII e Excalidraw são **projeções**, jamais prova de runtime nem autorização para alterar o desenho canônico.

**Protocolo automático:**
1. Se a explicação do PR contiver um bloco `mermaid`, preservar **exatamente** nós, subgraphs, setas, textos e conexões existentes; este bloco será a fonte da renderização.
2. Se o PR não contiver Mermaid, o gate `scripts/lupa/diagram-route-gate.mjs --pr-preview` utiliza `scripts/grafo-vivo/mermaid-core.mjs` para construir **apenas um mapa do fluxo de revisão**, com fingerprint e auditoria de arestas — não inventa capacidades, APIs ou estados de produção.
3. O renderizador `skills/mermaid_render.py` usa **o mesmo source Mermaid** para todos os três formatos: **SVG** (legível e escalável), **PNG** (imagem de prévia), **ASCII** (terminal, agente ou chat). Preferência automática: SVG para textos/diagramas, PNG para UI e ASCII para CLIs; **a preferência não impede produzir os demais**.
4. O workflow `.github/workflows/porta-de-entrada.yml` publica no próprio check/Actions do PR: `.mmd`, `.svg`, `.png`, `.txt` e `receipt.json`, vinculados ao **SHA do HEAD**, com SHA-256/tamanho das imagens. O resumo mostra Mermaid inline. Falha de renderização é **YELLOW** localizado, não bloqueia uma PR alheia.
5. O Excalidraw derivado continua sob o **mesmo** `scripts/lupa/diagram-route-excalidraw.mjs` e o Grafo Vivo continua sob seus owners. Não fazer escritores ou diagramas canônicos paralelos.

**Privacidade:** o `skills/mermaid_render.py` usa o render local `pretty-mermaid` por padrão. A API Kroki pública só é usada se o executor receber **`--allow-remote`** explícito, pois os diagramas podem conter topologias privadas. `CENTRALDARK_RENDER_NO_INSTALL=1` impede instalação npm silenciosa; em CI as dependências vêm de `npm ci` no lockfile da skill existente.

**Independente do modelo:** qualquer modelo/assistente pode fornecer Mermaid em Markdown ou imagens de apoio no PR. O gate processa a fonte, **sem acionar APIs externas de modelos, sem credenciais novas e sem afirmar que imagens não fornecidas foram geradas**.

**Comando já suportado pelo mesmo renderizador:**
```sh
python3 skills/mermaid_render.py diagrama.mmd --svg diagrama.svg --png diagrama.png --ascii diagrama.txt --theme tokyo-night
```

**Prova separada:** source/receitas escritas no PR #1977 ≠ render CI executado ≠ screenshots realmente inspecionados. `RENDERED=UNKNOWN` até arquivo, assinatura e SHA-256 serem produzidos pelo runner.

<!-- /PR_MERMAID_TRIPLE_FORMAT_RENDER_20261103 -->


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

**Oscilação histórica:** o Kroki existe como fallback opcional para conteúdo **publicável**, mas o padrão CURRENT para código privado é renderização local com pretty-mermaid. Kroki requer autorização explícita `--allow-remote`.
Usar pretty-mermaid quando desejar tema (tokyo-night, dracula, nord) ou saída ASCII para terminal/chat.

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


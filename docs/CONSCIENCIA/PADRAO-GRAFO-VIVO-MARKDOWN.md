---
title: "🫀 Padrão do Grafo Vivo Markdown — CentralDark"
status: "ATIVO_RECONCILIADO"
date: 2026-09-10
updated: 2026-09-12
owner: "docs/CONSCIENCIA/PADRAO-GRAFO-VIVO-MARKDOWN.md"
truth_scope: "DOCS_MARKDOWN_STRUCTURE_GRAPH_AND_VISUAL_CONTRACT"
canonical: true
tags:
  - centraldark
  - docs
  - markdown
  - grafo-vivo
  - obsidian
  - propriedades
  - tags
  - links
  - interligados
related:
  - "[[PADRAO-RESPOSTA-SEGREDO-CHEFE]]"
  - "[[PADRAO-EMOJIS]]"
  - "[[CENTRALDARK_ZENDRIVE_OBSIDIAN_AUTOMACOES]]"
  - "[[CENTRALDARK_FONTES_GITHUB_DRIVE_RECONCILIATION]]"
links:
  - "docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md"
  - "docs/CONSCIENCIA/PADRAO-EMOJIS.md"
  - "docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json"
  - "docs/RECEIPTS/README.md"
---

# 🫀 Padrão do Grafo Vivo Markdown — CentralDark

## 🧠 Intenção do Chefe

Um assunto vivo deve continuar sendo **o mesmo nó** ao longo do tempo. O nome do arquivo não envelhece a cada dia. A data, o estado e a atualização ficam nas propriedades do cabeçalho.

A nota não é uma ilha: `tags`, `related` e `links` mantêm o sangue do grafo correndo entre ideias, provas, motores, recibos e próximos passos.

## 🏠 Regra para arquivo vivo

Arquivo atual usa nome estável e sem data de execução no nome.

Exemplo:

`CENTRALDARK_ZENDRIVE_OBSIDIAN_AUTOMACOES.md`

Não criar cópias correntes como:

- `..._2026-09-10.md`
- `...-V1.md`
- `...-V2.md`
- `...-V3.md`
- `...-FINAL.md`
- `...-NOVO.md`

Quando o assunto evolui, atualizar o mesmo dono.

## 🧬 Propriedades mínimas do nó vivo

Toda nota Markdown viva tocada ou criada em `docs/` deve convergir para este cabeçalho:

- `title` — nome humano, com emoji semântico quando útil;
- `status` — estado atual;
- `date` ou `updated` — tempo no cabeçalho, não no nome do nó vivo;
- `owner` — caminho estável do dono;
- `truth_scope` — o que aquela nota pode afirmar;
- `canonical` — se governa ou apenas referencia;
- `tags` — famílias de busca/grafo;
- `related` — nós ligados, preferencialmente `[[WIKILINK]]`;
- `links` — caminhos reais para regras, código, testes, recibos e outros donos.

`aliases` pode preservar nomes antigos sem obrigar a manter um segundo arquivo vivo.

## 🔗 Sangue entre os nós

`tags` aproxima assuntos.

`related` liga nota com nota no Obsidian.

`links` liga a nota a arquivos e motores reais do GitHub.

Um arquivo atual sem nenhuma ligação deve ser tratado como candidato a nó órfão e revisado antes de ganhar autoridade.

## 🕰️ Histórico sem virar segunda verdade

Data no nome pode permanecer apenas quando **a data é parte da identidade histórica**, por exemplo snapshot, handoff, relatório ou auditoria imutável.

Esse material deve declarar no cabeçalho algo como `HISTORICAL`, `SNAPSHOT`, `HANDOFF`, `ARCHIVED` ou escopo equivalente e, quando existir um dono atual, apontar para ele por `related`/`links`.

Quando já existe um arquivo vivo estável e o arquivo datado é somente uma cópia/ponte duplicada, a ponte não permanece na pasta viva. O histórico continua preservado pelo Git e o nome antigo pode permanecer em `aliases` do dono estável.

Assim:

**história é preservada; duplicação viva não é.**

## 🎨 Emojis por dentro dos Markdown

Emoji é pista visual, não enfeite e não prova.

Para gatilhos oficiais, a escrita deve seguir `docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json`:

- 👑🪬 `!CENTRALDARK`
- 🔗 `!># INTERLIGADOS`
- ⭕ `!AURÉOLA CANÔNICA`
- 🧿 `#ACORDAR`
- 🎛️ `!CALIBRAR`
- 🧭 `!MULTIBÚSSOLA`
- 🔎 `!META_LUPA`
- 🔄 `!RECONCILIAR`
- ⚖️ `!CONTRAPROVA`
- 🔁 `!VERTEX_INVERSO`
- 🐚 `!CARACOL`
- 💠 `!FIXED_POINT`
- 🧾 `!REGISTRA`
- 🚀 `!BOOT`
- 💎 `!DELTAÚTIL`
- 🪬 `!MODO CIRURGIA DE RAIZ`

Cabeçalhos e trechos importantes podem usar emojis semânticos para tornar a nota legível por humano e agente. Não decorar cada palavra e não reutilizar mapa antigo quando ele contradizer o registry atual.

## ♻️ Migração sem quebrar legado

Ao encontrar Markdown fora do padrão:

1. 🧿 medir o arquivo e suas referências;
2. 🔎 descobrir se é nó vivo, histórico real ou duplicata;
3. 🔄 localizar o dono existente antes de criar qualquer outro;
4. 🫀 se for vivo, convergir para nome estável + propriedades + grafo;
5. 🔗 preservar nomes antigos por `aliases` quando útil;
6. 🕰️ se for histórico real, marcar claramente como histórico e ligar ao dono atual;
7. 🧹 se for sombra datada de um dono estável e não houver consumidor, remover a sombra da árvore viva; o Git preserva a história;
8. 🎨 reconciliar emojis com o registry atual;
9. ⚖️ conferir links, estado e escopo antes de dizer que terminou.

## 🚫 Zero família paralela

`V1`, `V2`, `V3`, `FINAL`, `NOVO`, `COPY`, `BACKUP` não são estratégia de evolução para nó vivo.

Versões técnicas necessárias de API, schema, protocolo ou dependência podem continuar **dentro do conteúdo/código** quando fazem parte da compatibilidade real. A proibição é contra criar uma família concorrente de documentos correntes.

## 🎛️ Autoria visual do mesmo Grafo Vivo

A superfície visual é uma forma humana de declarar intenção e relação; ela **não vira segunda fonte de verdade** e não escreve estado runtime diretamente.

```text
VISUAL_AUTHORING_SURFACE=true
VISUAL_IS_TRUTH=false
VISUAL_MUST_REUSE_GRAFO_VIVO=true
VISUAL_MUST_NOT_CREATE_SECOND_ROUTER=true
VISUAL_MUST_NOT_WRITE_RUNTIME_STATE_DIRECTLY=true
```

Fluxo canônico:

```text
HUMAN_VISUAL_INTENT
→ GRAPH_EDIT
→ VALIDATE_OWNER_AND_CONTRACT
→ COMPILE_TO_EXISTING_CANONICAL_OWNERS
→ TEST/GATE
→ COMMIT/PUSH/MAIN
→ RUNTIME
→ TELEMETRY
→ SAME_GRAPH_STATUS_PROJECTION
→ REALITY_JUDGE
```

A UI pode esconder complexidade sem apagar semântica. Cada nó visual deve poder carregar, quando aplicável:

```text
owner
gate
entrada
saida
condicao
permissao
proof_key
fallback
next_cursor
```

Esses campos podem ficar recolhidos no clique do nó; a ausência visual deles não autoriza a runtime a inventar valores.

### 🔀 Semântica mínima das setas

```text
→  CONTINUE
↺  RETRY_OR_LOOP
↩  RETURN_TO_PREVIOUS_PROVEN_STAGE
⊣  BLOCK
⇢  OPTIONAL
⇄  SYNCHRONIZE
```

A seta é contrato, não decoração. Mudança de sentido ou tipo de aresta é mudança semântica e deve passar pelo mesmo gate de qualquer outra mutação.

### 🧠 IA como designer/compilador, não como dona da intenção

A IA pode:

```text
AUTO_LAYOUT
ALIGN_SPACING
DRAW_CURVES
GROUP_SECTORS
VALIDATE_SCHEMA
GENERATE_PATCH_PROPOSAL
COMPILE_VISUAL_INTENT
```

A IA não pode, sem prova/autorização do fluxo:

```text
CHANGE_CHEFE_INTENT
REASSIGN_OWNER_SILENTLY
BYPASS_GATE
PROMOTE_UNKNOWN_TO_PASS
CREATE_PARALLEL_ARCHITECTURE
```

### 🌈 Telemetria de volta ao mesmo mapa

O runtime pode projetar estado observado sobre os mesmos nós e arestas:

```text
GREEN  = PASS fresco no escopo
YELLOW = UNKNOWN | PENDING | STALE | BLOCKED_EXTERNAL
RED    = FAIL comprovado
```

Cor não é verdade eterna. Toda cor material precisa carregar timestamp, fonte/proof key e vínculo com a revisão/HEAD quando aplicável.

### 🟡 Estado atual desta capacidade

Já existem Grafo Vivo, `graph-data.json`, gerador, painel, plugin e gates relacionados. O **editor visual drag-and-drop bidirecional** descrito acima ainda não está provado como runtime existente.

```text
GRAFO_VIVO_EXISTENTE=PROVED_BY_REPO
VISUAL_STATUS_PROJECTION=PROVED_BY_REPO
DRAG_DROP_AUTHORING_RUNTIME=UNKNOWN
VISUAL_TO_CANONICAL_COMPILER=UNKNOWN
ROUND_TRIP_EDIT_TELEMETRY_FIXED_POINT=UNKNOWN
```

Portanto, implementar essa capacidade futura deve começar em `REUSE_BEFORE_CREATE`: medir painel/plugin/gerador atuais, escolher owner e estender o mínimo necessário.

## ⚖️ Leis

- ❓ UNKNOWN != PASS
- 🧾 ACTION != PROOF
- 📄 DOCUMENTED != EXECUTED
- 🚀 MERGED != DEPLOYED
- 🕰️ HISTORY != CURRENT_STATE
- 🔗 LINK != PROOF
- 🎛️ VISUAL != TRUTH
- 🧭 ARROW_SEMANTICS != DECORATION
- 🫀 NÓ VIVO = um dono estável evoluindo
- ⚖️ REALIDADE É O JUIZ

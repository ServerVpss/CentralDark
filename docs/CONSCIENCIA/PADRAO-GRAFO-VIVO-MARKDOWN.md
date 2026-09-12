---
title: "🫀 Padrão do Grafo Vivo Markdown — CentralDark"
status: "ATIVO_RECONCILIADO"
date: 2026-09-10
updated: 2026-09-10
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

## ⚖️ Leis

- ❓ UNKNOWN != PASS
- 🧾 ACTION != PROOF
- 📄 DOCUMENTED != EXECUTED
- 🚀 MERGED != DEPLOYED
- 🕰️ HISTORY != CURRENT_STATE
- 🔗 LINK != PROOF
- 🫀 NÓ VIVO = um dono estável evoluindo
- ⚖️ REALIDADE É O JUIZ

---
title: "🫀 RECEIPTS — índice vivo"
status: "ATIVO_RECONCILIADO"
date: 2026-09-10
updated: 2026-09-10
owner: "docs/RECEIPTS/README.md"
truth_scope: "RECEIPTS_STRUCTURE_AND_GRAPH"
canonical: true
tags:
  - centraldark
  - receipts
  - grafo-vivo
  - obsidian
  - propriedades
  - links
  - tags
related:
  - "[[CENTRALDARK_ZENDRIVE_OBSIDIAN_AUTOMACOES]]"
  - "[[CENTRALDARK_FONTES_GITHUB_DRIVE_RECONCILIATION]]"
  - "[[PDF_CC2003_MAIN_FIXED_POINT]]"
  - "[[PADRAO-GRAFO-VIVO-MARKDOWN]]"
  - "[[PADRAO-RESPOSTA-SEGREDO-CHEFE]]"
links:
  - "docs/CONSCIENCIA/PADRAO-GRAFO-VIVO-MARKDOWN.md"
  - "docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md"
  - "docs/CONSCIENCIA/PADRAO-EMOJIS.md"
  - "docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json"
---

# 🫀 RECEIPTS — índice vivo

## 🧠 Regra da Casa

Os recibos **atuais** usam nome estável. A data fica nas propriedades do cabeçalho, não no nome do arquivo vivo.

Exemplo certo: `CENTRALDARK_ZENDRIVE_OBSIDIAN_AUTOMACOES.md`.

A regra geral de todos os Markdown está em [[PADRAO-GRAFO-VIVO-MARKDOWN]].

## 🧬 Estrutura mínima

Cada recibo vivo tocado ou criado deve convergir para:

- 🧠 `title`
- ⚖️ `status`
- 📅 `date` ou `updated`
- 👑 `owner`
- 🔎 `truth_scope`
- 🫀 `canonical`
- 🏷️ `tags`
- 🔗 `related`
- 🔗 `links`

## 🔗 Sangue do grafo

`related` liga notas pelo nome no Obsidian.

`links` aponta para arquivos, regras, testes e motores reais do GitHub.

`tags` aproxima famílias de conhecimento sem criar arquitetura paralela.

Emojis dentro do Markdown são pistas visuais da Casa. Emoji não substitui prova.

## 🧱 Hierarquia viva desta pasta

### 🏠 Casa / automação / memória

- [[CENTRALDARK_ZENDRIVE_OBSIDIAN_AUTOMACOES]]

### 📚 Fontes / GitHub / Drive

- [[CENTRALDARK_FONTES_GITHUB_DRIVE_RECONCILIATION]]

### 📜 Prova / conformidade

- [[PDF_CC2003_MAIN_FIXED_POINT]]

## 🕰️ Legado

O histórico continua no Git.

Quando um arquivo datado era somente sombra/ponte de um dono estável e não havia consumidor real, ele **não permanece nesta pasta viva**. O nome antigo pode ficar em `aliases` do dono atual.

Arquivo datado só deve existir na árvore corrente quando a data for parte da identidade histórica real, como snapshot, handoff, relatório ou auditoria. Nesse caso ele precisa declarar que é histórico e apontar para o dono atual quando houver.

Regra simples:

**história preservada ≠ duplicata viva preservada.**

## 🎨 Emojis

Os gatilhos e seus emojis vêm de `docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json`.

Não usar mapa antigo que contradiga o registry atual.

## ⚖️ Leis

- ❓ UNKNOWN != PASS
- 🧾 ACTION != PROOF
- 📄 DOCUMENTED != EXECUTED
- 🚀 MERGED != DEPLOYED
- 🕰️ HISTORY != CURRENT_STATE
- ⚖️ REALIDADE É O JUIZ

## 🧭 Migração

Ao tocar em recibo antigo desta pasta:

1. 🧿 medir estado e referências;
2. 🔎 descobrir se é vivo, histórico real ou sombra;
3. 🔄 localizar o dono atual;
4. 🫀 manter nó vivo com nome estável;
5. 🏷️ colocar tempo/estado nas propriedades;
6. 🔗 conectar `tags`, `related` e `links`;
7. 🎨 reconciliar emojis com o registry atual;
8. 🧹 remover da pasta viva sombra datada sem consumidor, preservando o histórico no Git;
9. 🚫 não criar família `v1`, `v2`, `v3`, `FINAL`, `NOVO` ou `COPY` para o mesmo assunto.
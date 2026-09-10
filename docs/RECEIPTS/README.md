---
title: "🫀 RECEIPTS — índice vivo"
status: "ATIVO_RECONCILIADO"
date: 2026-09-10
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
  - "[[PADRAO-RESPOSTA-SEGREDO-CHEFE]]"
links:
  - "docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md"
  - "docs/CONSCIENCIA/PADRAO-EMOJIS.md"
  - "docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json"
---

# 🫀 RECEIPTS — índice vivo

## 🧠 Regra da Casa

Os recibos atuais usam **nome estável**. A data fica nas propriedades do cabeçalho, não no nome do arquivo.

Exemplo certo:

`CENTRALDARK_ZENDRIVE_OBSIDIAN_AUTOMACOES.md`

A estrutura mínima de cada nota atual é:

- 🧠 `title`
- ⚖️ `status`
- 📅 `date`
- 👑 `owner`
- 🔎 `truth_scope`
- 🏷️ `tags`
- 🔗 `related`
- 🔗 `links`

## 🔗 Sangue do grafo

`related` liga notas pelo nome no Obsidian.

`links` aponta para arquivos, regras e motores reais do GitHub.

`tags` permite agrupar assuntos sem criar pastas ou arquiteturas paralelas.

Emojis dentro do Markdown funcionam como pistas visuais da Casa. Emoji não substitui prova.

## 🧱 Hierarquia

### 🏠 Casa / automação / memória

- [[CENTRALDARK_ZENDRIVE_OBSIDIAN_AUTOMACOES]]

### 📚 Fontes / GitHub / Drive

- [[CENTRALDARK_FONTES_GITHUB_DRIVE_RECONCILIATION]]

### 📜 Prova / conformidade

- [[PDF_CC2003_MAIN_FIXED_POINT]]

## ♻️ Legado

Arquivos antigos com data no nome podem permanecer somente como **ponte de compatibilidade** apontando para o arquivo estável atual.

Eles não viram segundo dono, segunda verdade ou nova arquitetura.

Regra:

LEGADO → aponta para OWNER ESTÁVEL → preserva histórico → não governa estado atual.

## ⚖️ Leis

- ❓ UNKNOWN != PASS
- 🧾 ACTION != PROOF
- 📄 DOCUMENTED != EXECUTED
- 🚀 MERGED != DEPLOYED
- 🕰️ HISTORY != CURRENT_STATE
- ⚖️ REALIDADE É O JUIZ

## 🧭 Migração

Ao tocar em recibo antigo desta pasta:

1. encontrar o dono atual;
2. manter o nome atual estável sem data;
3. colocar data/status nas propriedades;
4. conectar `tags`, `related` e `links`;
5. usar emojis semânticos no corpo;
6. preservar o caminho antigo como ponte de legado quando necessário;
7. não criar `v1`, `v2`, `v3` nem família paralela.

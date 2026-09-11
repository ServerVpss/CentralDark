---
title: "📜 PDF CC2003 — Main Fixed Point"
status: "ATIVO_RECONCILIADO"
date: 2026-09-09
owner: "docs/RECEIPTS/PDF_CC2003_MAIN_FIXED_POINT.md"
truth_scope: "PDF_CONFORMANCE_RECEIPT"
canonical: true
aliases:
  - "2026-09-09-pdf-cc2003-main-fixed-point"
tags:
  - centraldark
  - receipts
  - pdf
  - cc2003
  - conformidade
  - horn
  - contraprovacao
  - grafo-vivo
related:
  - "[[PADRAO-RESPOSTA-SEGREDO-CHEFE]]"
  - "[[CENTRALDARK_FONTES_GITHUB_DRIVE_RECONCILIATION]]"
links:
  - "docs/CONSCIENCIA/04-MCP-E-CONECTORES/PDF-CONFORMANCE-CC2003.md"
  - "scripts/lupa/pdf-conformance-cc2003.mjs"
  - "docs/CONSCIENCIA/PADRAO-EMOJIS.md"
---

# 📜 PDF CC2003 — Main Fixed Point

## 🧠 Intenção

Incorporar o PDF `tlc23(3).pdf` ao padrão operacional da CentralDark como base de conformidade para o Harness, sem criar arquitetura paralela.

## 🔎 Prova da fonte

- 📄 SOURCE=`tlc23(3).pdf`
- 📦 SIZE_BYTES=`206674`
- 🔐 SHA256=`b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1`
- 📚 PAGES=`8`
- 🧠 TOPICS=`Horn; satisfiability; Herbrand minimum model; resolution`

## 🏛️ Delta na main

- 📄 `docs/CONSCIENCIA/04-MCP-E-CONECTORES/PDF-CONFORMANCE-CC2003.md`
- 🛠️ `scripts/lupa/pdf-conformance-cc2003.mjs`

## 🔗 Regra cristalizada

REUSE_BEFORE_CREATE → Horn gate → menor modelo operacional → ação mínima → pós-prova → contraprova → recibo.

## ⚖️ Veredito

- ✅ PDF_IDENTITY_CONFIRMED=PROVED_IN_SCOPE
- ✅ CONFORMANCE_DOC_ON_MAIN=PROVED_IN_SCOPE
- ✅ DETERMINISTIC_GATE_ON_MAIN=PROVED_IN_SCOPE
- ❓ SAME_HEAD_CI=UNKNOWN
- ❓ BINARY_PDF_IN_REPO=NOT_PROVED

## 🧭 Limite

Este recibo prova cristalização textual/código na `main` e a identidade do PDF por hash/tamanho. Não declara deploy, execução na VPS nem CI verde sem medição específica.

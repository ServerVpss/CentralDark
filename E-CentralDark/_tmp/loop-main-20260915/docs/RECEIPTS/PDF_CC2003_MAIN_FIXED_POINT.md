---
title: "📜 PDF CC2003 — Main Fixed Point"
status: "ATIVO_RECONCILIADO"
date: 2026-09-09
updated: 2026-09-12
owner: "docs/RECEIPTS/PDF_CC2003_MAIN_FIXED_POINT.md"
truth_scope: "PDF_CONFORMANCE_AND_ARTIFACT_IDENTITY_RECEIPT"
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
  - "scripts/lupa/pdf-conformance-cc2003.test.mjs"
  - "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml"
  - "apps/modulos/HERMES-CORE/prompts/hermes-core.md"
---

# 📜 PDF CC2003 — Main Fixed Point

## 🧠 Intenção

Incorporar o PDF CC2003 ao padrão operacional da CentralDark e cristalizar o aprendizado de que nome transitório de upload não é identidade de artefato.

## 🔎 Prova da fonte

- 📄 SOURCE_CANONICAL=`docs/CONSCIENCIA/04-MCP-E-CONECTORES/tlc23.pdf`
- 📄 HISTORICAL_ALIASES=`tlc23(2).pdf; tlc23(3).pdf`
- 📦 SIZE_BYTES=`206674`
- 🔐 SHA256=`b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1`
- 📚 PAGES=`8`
- 🧠 TOPICS=`Horn; satisfiability; Herbrand minimum model; resolution`
- 🟢 BINARY_PDF_IN_REPO=`PROVED_IN_SCOPE`
- 🔐 BINARY_GIT_BLOB_SHA=`ab84cb54a77bfd4647b487e526b1714223c12c96`
- 📌 BINARY_COMMIT=`1fd16f186f880858a39b98701859c48e30fbfb9f`

## 🏛️ Delta cristalizado na main

- `scripts/lupa/pdf-conformance-cc2003.mjs`
  - path explícito continua suportado;
  - sem path, resolve artefato por SHA-256 + tamanho nos locais autorizados;
  - busca é limitada aos filhos diretos dos roots autorizados, sem varredura cega do disco;
  - identidade divergente falha fechado;
  - ausência não provada permanece `UNKNOWN`.
- `scripts/lupa/pdf-conformance-cc2003.test.mjs`
  - mesmo SHA/tamanho com nome diferente = PASS esperado;
  - mesmo nome com bytes diferentes = FAIL_CLOSED esperado;
  - path vazio + identidade conhecida = RESOLVE_REFERENCE esperado;
  - path vazio + identidade não encontrada = UNKNOWN esperado.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml`
  - regra global para Hermes local, Hermes VPS, CI/CD, MCP, CLI, Desktop, site, API e Harness.
- `docs/CONSCIENCIA/04-MCP-E-CONECTORES/PDF-CONFORMANCE-CC2003.md`
  - documentação da política e herança VPS → main → Casa.

## 🔗 Cristal reutilizável

```text
ARTIFACT_NAME_IS_NOT_IDENTITY=true
UPLOAD_SUFFIX_IS_TRANSIENT=true
DISCOVER_BY_HASH_FIRST=true
KNOWN_LOCATIONS_FIRST=true
EMPTY_PATH_WITH_KNOWN_IDENTITY=RESOLVE_REFERENCE
EMPTY_PATH != ARTIFACT_MISSING
SAME_HASH_AND_SIZE_DIFFERENT_NAME=SAME_ARTIFACT
SAME_NAME_DIFFERENT_HASH=FAIL_CLOSED
UNRESOLVED_KNOWN_IDENTITY=UNKNOWN
```

```text
HERMES_VPS aprende
→ prova
→ cristaliza no owner
→ main
→ HERMES_LOCAL sincroniza
→ carrega mesmo contrato
→ reutiliza aprendizado
```

Hermes já carrega `ARTIFACT-PROPERTIES.yml` no prompt canônico; portanto a transferência é por código/contrato/prova, não por memória privada de sessão.

## ⚖️ Veredito atual

- ✅ PDF_IDENTITY_CONFIRMED=`PROVED_IN_SCOPE`
- ✅ BINARY_PDF_IN_REPO=`PROVED_IN_SCOPE`
- ✅ CONFORMANCE_DOC_ON_MAIN=`PROVED_IN_SCOPE`
- ✅ DETERMINISTIC_GATE_ON_MAIN=`PROVED_IN_SCOPE`
- ✅ ARTIFACT_IDENTITY_POLICY_ON_MAIN=`PROVED_IN_SCOPE`
- ✅ TEST_FILE_ON_MAIN=`PROVED_IN_SCOPE`
- 🟡 TEST_EXECUTION_AFTER_2026_09_12_DELTA=`UNKNOWN_UNTIL_RUNTIME_OR_CI_OUTPUT`
- 🟡 SAME_HEAD_CI=`UNKNOWN_UNTIL_MEASURED`
- 🟡 HERMES_LOCAL_RUNTIME_CONSUMPTION=`UNKNOWN_UNTIL_SYNC_AND_TEST`
- 🟡 HERMES_VPS_RUNTIME_CONSUMPTION=`UNKNOWN_UNTIL_SYNC_AND_TEST`

## 🧭 Limite

`ON_MAIN != EXECUTED` e `DOCUMENTED != RUNTIME_PROVED`. O ponto fixo desta melhoria só sobe de **cristalização canônica** para **ponto fixo operacional cruzado** quando Casa e VPS sincronizarem a mesma main e produzirem os outputs determinísticos esperados sem regressão.

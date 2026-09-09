# 📜 Receipt — PDF CC2003 Main Fixed Point

**Data:** 2026-09-09

**Intenção:** incorporar o PDF `tlc23(3).pdf` ao padrão operacional da CentralDark como base de conformidade para o Harness, sem criar arquitetura paralela.

## Evidência da fonte

```text
SOURCE=tlc23(3).pdf
SIZE_BYTES=206674
SHA256=b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1
PAGES=8
TOPICS=Horn; satisfiability; Herbrand minimum model; resolution
```

## Delta na main

```text
docs/CONSCIENCIA/04-MCP-E-CONECTORES/PDF-CONFORMANCE-CC2003.md
scripts/lupa/pdf-conformance-cc2003.mjs
```

## Regra cristalizada

```text
REUSE_BEFORE_CREATE
→ Horn gate
→ menor modelo operacional
→ ação mínima
→ pós-prova
→ contraprova
→ receipt
```

## Veredito

```text
PDF_IDENTITY_CONFIRMED=PROVED_IN_SCOPE
CONFORMANCE_DOC_ON_MAIN=PROVED_IN_SCOPE
DETERMINISTIC_GATE_ON_MAIN=PROVED_IN_SCOPE
SAME_HEAD_CI=UNKNOWN
BINARY_PDF_IN_REPO=NOT_PROVED
```

## Limite

Este receipt prova a cristalização textual/código na `main` e a identidade do PDF anexado por hash/tamanho. Não declara deploy, execução na VPS, nem CI pass sem medição específica.

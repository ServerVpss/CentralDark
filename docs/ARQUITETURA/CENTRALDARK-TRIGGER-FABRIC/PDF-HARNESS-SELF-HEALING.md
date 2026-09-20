---
title: CentralDark - PDF Harness Self-Healing Core
status: CRISTALIZADO
scope: pdf-harness, self-healing, failure taxonomy, receipt learning, Casa, VPS, MCP
owner: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PDF-HARNESS-BRIDGE.md
writer: SOL
source_zip_sha256: d15f80ef58b65c12c60b5b97da3a5e14e3a79b88a8bfd4bd88c4e0d0b50b3e21
---

# CentralDark - PDF Harness Self-Healing Core

## Ouro extraido

O erro de fala do Chefe vira ouro quando o harness transforma intencao ruidosa em contrato deterministico. O self-healing entra no coracao do harness, mas nao ganha autoridade para reescrever o proprio core sozinho.

## Formula soberana

```text
render -> verify -> operate -> re-render -> diff_or_verify -> receipt -> NEXT_CURSOR
```

Esta formula gira todo uso de PDF. Descoberta pode ser probabilistica; aplicacao precisa ser deterministica.

## Coracao self-healing

```text
input PDF / intencao
  -> plan deterministico
  -> executar formula
  -> detectar falha observavel
  -> classificar failure_signature
  -> corrigir o ponto material
  -> reexecutar gates
  -> registrar receipt
  -> aprender padrao sem alterar core automaticamente
```

## Limite de seguranca

```text
SELF_HEALING != SELF_REWRITE
RECEIPT_LEARNING != AUTO_MUTATION
UNKNOWN != PASS
REGRESSION_UNKNOWN != PROMOTION
```

O harness aprende por receipts. A regra nova so sobe para o core quando houver padrao recorrente, teste novo, receipt e ausencia de regressao.

## Classes profissionais

| Classe | Poder | Escopo |
|---|---:|---|
| CLASS_C | 10 | detectar e reportar |
| CLASS_B | 25 | retry seguro e triagem read-only |
| CLASS_A | 50 | normalizar entrada e rerotear deterministicamente |
| CLASS_S | 75 | corrigir ferida material com regression guard |
| SENIOR | 90 | provar com renderers, anti-regressao e receipt learning |
| MESTRE | 100 | promover regra so depois de teste e receipts |

## Taxonomia inicial

- `RENDER_FAIL` -> normalizar PDF, trocar renderer, renderizar novamente.
- `OUTPUT_NO_RENDER` -> bloquear PASS, renderizar output, verificar.
- `TEXT_CLIPPED` -> rejeitar PDF final e voltar para DOCX/PPTX quando necessario.
- `OCR_LOW_CONFIDENCE` -> marcar UNKNOWN, rerodar OCR e verificar texto.
- `REDACTION_OVERLAY` -> bloquear, aplicar true redaction e extrair texto para provar ausencia.
- `FORM_FIELD_MISMATCH` -> inspecionar AcroForm e valores aceitos antes de preencher.
- `COORDINATE_DRIFT` -> recalcular PDF points e image pixels.
- `NO_RECEIPT` -> bloquear PASS e escrever receipt com NEXT_CURSOR.
- `REGRESSION_DIFF_UNKNOWN` -> bloquear promocao ate classificar diff visual.

## Fixed point mensuravel

```text
same capability + same scope + different executor
  -> same material_id
  -> same task
  -> same pipeline
  -> self_healing.enabled=true
  -> self_rewrite_allowed=false
  -> validation.ok=true
```

## NEXT_CURSOR

Ligar receipts reais de operacao PDF da Casa/VPS/MCP ao mesmo contrato: entrada PDF material, render antes, operacao, re-render, diff, receipt e promocao de regra somente com prova.

---
title: CentralDark - PDF Harness Bridge
status: CRISTALIZADO
scope: PDF skill, render-verify loop, harness, bridge, Casa e VPS
source: SEGREDO/CHEFE, sessao 2026-09-09
owner: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC
writer: SOL
---

# CentralDark - PDF Harness Bridge

## Principio

PDF entra na Casa como capability, nao como sistema paralelo.

```text
intencao PDF
  -> capability/scope
  -> pdf-harness
  -> render/verify
  -> operar
  -> re-render/verify
  -> receipt/NEXT_CURSOR
```

## Regra operacional

A regra do setor e: renderizar antes, verificar imagem, operar no menor ponto, renderizar de novo e comparar quando houver entrada anterior.

Para documentos text-heavy, autorar em DOCX e converter. Para layout de slides, autorar em PPTX e exportar. Para geracao programatica, ReportLab e aceito.

## Dez frentes deterministicas

1. leitura/revisao: render -> inspecionar PNG -> receipt.
2. extracao: texto, palavras, tabelas, imagens, anexos e formularios.
3. coordenadas: converter entre PDF pt e imagem px sem chute.
4. edicao: merge, split, rotate, crop, watermark, paginate, encrypt e repair.
5. formularios: preencher, conferir valores aceitos e flatten quando pedido.
6. formulario nao preenchivel: escolher caixas e carimbar texto/checkmarks.
7. OCR: transformar scan em PDF pesquisavel sem falso-verde.
8. preflight: detectar criptografia, paginas ruins, fontes e renderer.
9. redacao: remover conteudo subjacente, nao apenas cobrir visualmente.
10. diff/paridade: comparar renders e usar dois renderers quando for formulario dificil.

## Gate

```text
UNKNOWN != PASS
SKIPPED != PASS
PDF_RENDER_ABSENT != PASS
OCR_TEXT_WITHOUT_VISUAL_VERIFY != PASS
REDACTION_OVERLAY != TRUE_REDACTION
```

## Bridge

O `scripts/pdf-harness/centraldark-pdf-harness.mjs` recebe contexto minimo, escolhe pipeline e devolve receipt JSON. Ele nao edita repositorio, nao acessa segredo e nao decide autoridade. O executor real fica no harness/Casa/VPS.

## NEXT_CURSOR

Integrar o runner da Casa/VPS ao mesmo contrato: entrada JSON -> plano deterministico -> execucao da menor operacao -> render final -> receipt.

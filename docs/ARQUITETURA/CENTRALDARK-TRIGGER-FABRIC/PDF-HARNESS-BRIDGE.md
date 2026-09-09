---
title: CentralDark - PDF Harness Bridge
status: CRISTALIZADO
scope: PDF skill, render-verify loop, harness, bridge, Casa, VPS, MCP e executores neutros
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
  -> executor neutro
  -> render/verify
  -> operar
  -> re-render/verify
  -> receipt/NEXT_CURSOR
```

## Regra operacional

A regra do setor e: renderizar antes, verificar imagem, operar no menor ponto, renderizar de novo e comparar quando houver entrada anterior.

Para documentos text-heavy, autorar em DOCX e converter. Para layout de slides, autorar em PPTX e exportar. Para geracao programatica, ReportLab e aceito.

## Executor neutro

O PDF Harness nao pertence somente ao Hermes. Hermes, Casa, VPS, GitHub CI, MCP, ChatGPT connector, Codex, Claude ou agente futuro podem chamar a mesma peca.

```text
CentralDark coordena
  -> capability/scope escolhe
  -> executor executa
  -> harness planeja
  -> receipt prova
  -> realidade julga
```

Invariantes: modelo e proveniencia, executor nao e autoridade, MCP e ponte e nao cerebro, harness nao cria sistema paralelo.

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
HERMES_ONLY != VALID
EXECUTOR_WITH_AUTHORITY != VALID
```

## Bridge

O `scripts/pdf-harness/centraldark-pdf-harness.mjs` recebe contexto minimo, escolhe pipeline e devolve receipt JSON. Ele nao edita repositorio, nao acessa segredo e nao decide autoridade. O executor real fica no harness/Casa/VPS/MCP/conector autorizado.

## Fixed point mensuravel

O primeiro fixed point deste setor e local e deterministico: mesmo input material gera mesmo `material_id`, mesmo task e mesmo pipeline mesmo quando muda o executor.

```text
same capability + same scope
  -> same material_id
  -> same task
  -> same pipeline
  -> executor_neutral=true
  -> hermes_only=false
```

Esse fixed point nao afirma que um PDF real ja foi editado. Ele prova que o contrato de roteamento, bridge e neutralidade esta fechado antes da execucao material.

## NEXT_CURSOR

Integrar o runner da Casa/VPS ao mesmo contrato: entrada JSON -> plano deterministico -> execucao da menor operacao -> render final -> receipt.

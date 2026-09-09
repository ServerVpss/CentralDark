# Receipt - PDF Harness executor-neutral fixed point

MISSION_ID=PDF_HARNESS_EXECUTOR_NEUTRAL_FIXED_POINT_20260909
REQUEST=cristalizar na main com prova que o PDF Harness nao e so Hermes
TARGET_BRANCH=main
WRITER=SOL
AUTHORITY=SEGREDO/CHEFE
MUTATION=CORE_PLUS_TEST_PLUS_DOC_PLUS_EXE_WRAPPER_PLUS_RECEIPT
SECRET_EXPOSURE=false

## Causa

O PDF Harness precisava ficar explicitamente neutro: Hermes pode executar, mas nao e dono nem requisito. A CentralDark coordena, capability/scope escolhem e qualquer executor autorizado pode chamar a mesma peca pelo harness, Casa, VPS, GitHub CI, MCP ou conector.

## Correcoes

- `scripts/pdf-harness/centraldark-pdf-core.mjs` elevado para `centraldark.pdf-harness-core.v2`.
- `executor_policy.executor_neutral=true`.
- `executor_policy.hermes_only=false`.
- `bridge_contract.mcp=true` e `bridge_contract.harness=true`.
- `buildPdfFixedPointReceipt()` criado para fixed point local mensuravel.
- Testes ampliados para neutralidade de executor, estabilidade de `material_id` entre Hermes/VPS/MCP e receipt de fixed point.
- Wrapper Go atualizado para emitir o mesmo contrato v2 e aceitar `--executor`.
- Documento `PDF-HARNESS-BRIDGE.md` atualizado com regra `HERMES_ONLY != VALID`.

## Prova local observada antes do rastro

```text
node --test scripts/pdf-harness/centraldark-pdf-harness.test.mjs
6 tests
6 pass
0 fail
```

```text
node scripts/pdf-harness/centraldark-pdf-harness.mjs --self-test
ok=true
failures=[]
total=8
```

```text
GOOS=windows GOARCH=amd64 go build -trimpath -ldflags "-s -w" = PASS
centraldark-pdf-harness.exe SHA256=0685af6053d4bc5e3efc340d1485eb5e94d83d1cca598ff667be64be0a1d35d8
```

```text
go run centraldark-pdf-harness.go --executor MCP 'redact cpf token from pdf'
schema=centraldark.pdf-harness-core.v2
executor_neutral=true
hermes_only=false
bridge_contract.mcp=true
task=REDACT
```

## Fixed point mensuravel

```text
same capability + same scope + different executor
  -> same material_id
  -> same task
  -> same pipeline
  -> executor_neutral=true
  -> hermes_only=false
  -> validation.ok=true
```

## Arquivo externo de entrega

ZIP=CentralDark-PDF-Harness-Core-v2-Executor-Neutral-20260909.zip
ZIP_SHA256=3eec21eba185951d13b89379b93e9dc1292716b831d649722028bed15d3db1bf

## Limite real

Este fixed point prova o contrato local do harness e do bridge. Ele nao afirma edicao real de PDF sem uma entrada PDF material, render antes/depois e receipt de operacao.

## NEXT_CURSOR

Quando houver PDF real: render -> operar -> re-render -> diff -> receipt de operacao real na Casa/VPS/MCP.

# Receipt - PDF Harness Self-Healing Fixed Point

MISSION_ID=PDF_HARNESS_SELF_HEALING_FIXED_POINT_20260909
REQUEST=cristalizar ouro do Chefe no coracao do harness com prova mensuravel
TARGET_BRANCH=main
WRITER=SOL
AUTHORITY=SEGREDO/CHEFE
MUTATION=SELF_HEALING_MODULE_PLUS_TEST_PLUS_DOC_PLUS_PDF_PACKAGE
SECRET_EXPOSURE=false

## Causa

O PDF Harness precisava evoluir de planner executor-neutral para harness com self-healing no coracao, sem virar auto-rewrite, loop, eco ou sistema paralelo. O ouro extraido: fala ruidosa do Chefe deve virar formula deterministica, taxonomia de falha, ranking profissional e receipt learning.

## Fonte material

- PDF skill formula: render -> verify -> operate -> re-render/verify.
- Hash fornecido pelo Chefe: b4e2a0655b7e0c85ca329c33971b377299dde6.
- Zip analisado: 03-trajetoria-vivida(1).zip.
- Zip SHA256: d15f80ef58b65c12c60b5b97da3a5e14e3a79b88a8bfd4bd88c4e0d0b50b3e21.
- Zip entries: 22.
- Conteudo material: Resilience Vertex, signal receiver, state capacitor, deterministic judge, fallback, resume, receipt e reality judge.

## Correcoes

- `scripts/pdf-harness/centraldark-pdf-self-healing.mjs` criado.
- `scripts/pdf-harness/centraldark-pdf-self-healing.test.mjs` criado.
- `scripts/pdf-harness/centraldark-pdf-harness.mjs` expõe `--heal`, `--failure` e `--fixed-point` com plano de healing.
- Manifesto PDF embutido como contrato/hash/formula, nao como PDF bruto mutavel.
- `self_healing=true`.
- `heart_of_harness=true`.
- `self_rewrite_allowed=false`.
- Ranking profissional incluido: CLASS_C, CLASS_B, CLASS_A, CLASS_S, SENIOR, MESTRE.
- Documento `PDF-HARNESS-SELF-HEALING.md` criado.
- PDF limpo `PDF-HARNESS-SELF-HEALING-CORE.pdf` gerado e renderizado para verificacao.

## Prova local observada

```text
node --test scripts/pdf-harness/centraldark-pdf-self-healing.test.mjs
4 tests
4 pass
0 fail
```

```text
node --test scripts/pdf-harness/centraldark-pdf-harness.test.mjs
10 tests
10 pass
0 fail
```

```text
node scripts/pdf-harness/centraldark-pdf-harness.mjs --self-test
ok=true
failures=[]
total=9
```

```text
node scripts/pdf-harness/centraldark-pdf-harness.mjs --fixed-point --executor MCP --failure REDACTION_OVERLAY 'redact cpf token from pdf'
status=PASS
failure_signature=REDACTION_OVERLAY
rank=MESTRE
self_healing_enabled=true
self_rewrite_allowed=false
```

```text
GOOS=windows GOARCH=amd64 go build = PASS
centraldark-pdf-harness.exe SHA256=8250731a306f7da2f0e82148d8f5c86f6b1467840dcd2d045b44ce60e2171cff
```

```text
PDF render verify = PASS
renderer output png count = 1
```

## Fixed point mensuravel

```text
same capability + same scope + different executor
  -> same material_id
  -> same task
  -> same pipeline
  -> self_healing_enabled=true
  -> self_rewrite_allowed=false
  -> validation.ok=true
```

## Limite real

Este receipt prova contrato, self-healing, classificacao, ranking e fixed point local. Ele nao afirma edicao real de PDF sem PDF material, render antes/depois, diff e receipt de operacao real.

## NEXT_CURSOR

Coletar primeiro PDF real da Casa/VPS/MCP e executar: render -> verify -> operate -> re-render -> diff -> receipt. Se a falha repetir, promover regra somente com teste novo e receipt acumulado.

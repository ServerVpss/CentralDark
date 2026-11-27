# Receipt - PDF Harness Bridge cristalizado

MISSION_ID=PDF_HARNESS_BRIDGE_CORE_20260909
REQUEST=cristalizar metodo PDF na main com teste e artefato executavel
TARGET_BRANCH=main
WRITER=SOL
AUTHORITY=SEGREDO/CHEFE
MUTATION=DOC_PLUS_NODE_CORE_PLUS_TEST_PLUS_EXE_ARTIFACT
SECRET_EXPOSURE=false

## Arquivos

- docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PDF-HARNESS-BRIDGE.md
- scripts/pdf-harness/centraldark-pdf-core.mjs
- scripts/pdf-harness/centraldark-pdf-harness.mjs
- scripts/pdf-harness/centraldark-pdf-harness.test.mjs
- tools/pdf-harness/centraldark-pdf-harness.go
- tools/pdf-harness/README-BUILD.md
- docs/RELATORIOS/2026-09-09-pdf-harness-core-main-receipt.md

## Validacao

node --test scripts/pdf-harness/centraldark-pdf-harness.test.mjs = PASS local
node scripts/pdf-harness/centraldark-pdf-harness.mjs --self-test = PASS local
GOOS=windows GOARCH=amd64 go build = PASS local artifact

## Artefato executavel

centraldark-pdf-harness.exe foi gerado fora do repositorio e empacotado para entrega.
SHA256=71f79a97c84a985edc88af3756527a18b0cceb8fc0fc5fb0c1d8625d2458bec9

## Regras preservadas

UNKNOWN_IS_NOT_PASS=true
ONE_OWNER_PER_CAPABILITY=true
NO_PARALLEL_PDF_SYSTEM=true
RENDER_VERIFY_LOOP_REQUIRED=true
TRUE_REDACTION_REQUIRED=true
NO_SECRET_IN_LOG_OR_RECEIPT=true

## NEXT_CURSOR

Ligar o executor real da Casa/VPS ao receipt JSON do PDF Harness Bridge e publicar artefato de release quando o CI da main confirmar.

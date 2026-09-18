---
title: "AMD — Manageability + ROCm/HIP — realidade medida 2026-09-18"
status: "CANDIDATE_PROVEN_PARTIAL"
owner: "docs/BRAIN/03-DOCUMENTACAO/02-BIBLIOTECA/SETORES/ML-CIENCIA-DE-DADOS/AMD-MANAGEABILITY-ROCM-2026-09-18.md"
observed_at: "2026-09-18T12:25:11-03:00"
scope: "Casa SEGREDO / CentralDark"
tags:
  - amd
  - rocm
  - hip
  - dash-cli
  - manageability
  - biblioteca
  - garimpo
---

# AMD — Manageability + ROCm/HIP

## Regra-mãe extraída

```text
NO_FULL_REWRITE
→ COMMON_INTERFACE_FIRST
→ LOCALIZED_ADAPTER_SECOND
→ INCREMENTAL_CORE_MIGRATION_LAST
→ REMEASURE_EACH_STEP
```

Aplicação CentralDark: reutilizar owner/interface existente antes de criar artefato paralelo; quando houver dependência específica, adaptar somente a fronteira; migrar núcleo apenas quando a dependência real exigir.

## Fontes

- AMD ROCm migration infographic:
  https://www.amd.com/content/dam/amd/en/documents/developer/resources/rocm-hub/cuda-to-rocm-migration-paths-infographic.pdf
- AMD Manageability Tools:
  https://www.amd.com/en/support/downloads/manageability-tools.html
- AMD Adaptable Learning:
  https://learningcatalog-amd.netexam.com/
- Curso verificado: CUDA to HIP/ROCm Migration:
  https://learningcatalog-amd.netexam.com/Certification/69333/cuda-to-hip-rocm-migration

## Garimpo local

```text
E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE\AMD\cuda-to-rocm-migration-paths-infographic.pdf
SHA256=fe44dea00056ae845c89d7892197aaa2ea8de65fc3d9ce9710ea35156c219cb7
SIZE=5334785
```

## Realidade local medida

### DASH CLI

```text
PATH=C:\Program Files\AMD\Manageability API\bin\dashcli.exe
PRODUCT=DASH CLI
VERSION=9.0.0.470
STATE=EXISTS
```

Uso-alvo: automação, scripting e diagnóstico de AMD PRO/DASH. A página oficial AMD lista DASH CLI como ferramenta cross-platform de avaliação/diagnóstico.

### AMD Manageability API

```text
SERVICE=AMDManageabilityAPI
DISPLAY=AMD Manageability API
START_MODE=Auto
STATE=Stopped
EXE=C:\Program Files\AMD\Manageability API\bin\amdmanapi.exe
VERSION=9.0.0.470
CONFIG=C:\Program Files\AMD\Manageability API\config\settings.json
CONFIG_PORT=8080
LISTENER_8080=false
```

Config adicional:

```text
C:\Program Files\AMD\Manageability API\config\webserverConfig.json
http_port=8082
https_port=8080
```

AMC aponta para a API:

```text
C:\Program Files\AMD Management Console\config\config.json
AMAURI=https://127.0.0.1:8080/
```

### AMD Management Console

```text
SERVICE=AMCDASHService
STATE=Running
EXE=C:\Program Files\AMD Management Console\bin\AMCService.exe
VERSION=14.0.0.1485

SERVICE=AMC Web Service
STATE=Running
EXE=C:\Program Files\AMD Management Console\bin\AMCWebService.exe
VERSION=14.0.0.1485

PORT_3274=LISTEN
OWNER=AMCWebService
HTTP_127.0.0.1_3274=200
```

### AIM-T Manageability Service

```text
SERVICE=AIMTManageabilityService
DISPLAY=AIM-T Manageability Service
START_MODE=Auto
STATE=Stopped
EXE=C:\Program Files\AMD\Manageability Service\bin\AIMTSvc.exe
CONFIG=C:\Program Files\AMD\Manageability Service\bin\App.config
CLIServiceName=AIMTManageabilityService
```

### Portas observadas

| Porta | UI/Config | CURRENT medido | Owner/caminho |
|---:|---|---|---|
| 3274 | AMC Web Service | PROVED: TCP listen + HTTP 200 | `C:\Program Files\AMD Management Console\bin\AMCWebService.exe` |
| 3275 | AMC alert HTTP | NOT_PROVEN: sem listener | AMC / instalador; validar após instalação/serviço completo |
| 3277 | AMC alert HTTPS | NOT_PROVEN: sem listener | AMC / instalador; validar após instalação/serviço completo |
| 8080 | Manageability API HTTPS | BLOCKED/NOT_RUNNING: sem listener | `AMDManageabilityAPI` + `C:\Program Files\AMD\Manageability API\config\settings.json` |
| 8082 | Manageability API HTTP | UNKNOWN | `C:\Program Files\AMD\Manageability API\config\webserverConfig.json` |

## Pendências endereçadas

1. **AMD Manageability API não está ativa**
   - serviço: `AMDManageabilityAPI`
   - exe: `C:\Program Files\AMD\Manageability API\bin\amdmanapi.exe`
   - config: `C:\Program Files\AMD\Manageability API\config\settings.json`
   - dependência funcional: porta 8080
   - estado: `PENDING_RUNTIME_PROOF`

2. **AIM-T Manageability Service não está ativo**
   - serviço: `AIMTManageabilityService`
   - exe: `C:\Program Files\AMD\Manageability Service\bin\AIMTSvc.exe`
   - config: `C:\Program Files\AMD\Manageability Service\bin\App.config`
   - estado: `PENDING_RUNTIME_PROOF`

3. **Portas de alerta AMC 3275/3277 sem listener**
   - owner runtime: AMC
   - executável principal: `C:\Program Files\AMD Management Console\bin\AMCWebService.exe`
   - estado: `PENDING_FEATURE_ACTIVATION_OR_CONFIG_PROOF`

4. **Porta 8082 consta em config, mas não foi medida como listener**
   - arquivo: `C:\Program Files\AMD\Manageability API\config\webserverConfig.json`
   - estado: `PENDING_PORT_PROOF`

5. **Uso CLI ainda sem command-level receipt**
   - binário: `C:\Program Files\AMD\Manageability API\bin\dashcli.exe`
   - documentação local: `C:\Program Files\AMD\Manageability API\docs\AMD Manageability API Usage Guide.pdf`
   - estado: `PENDING_COMMAND_SMOKE_TEST`

6. **A fonte mencionada pelo CHEFE `gpus-for-ai-product-illuminator` não foi localizada pelo nome exato**
   - raiz oficial verificada: `https://learningcatalog-amd.netexam.com/`
   - curso relacionado e localizado: `CUDA to HIP/ROCm Migration`
   - estado: `UNKNOWN_EXACT_ASSET_NAME`

## Regra temporal

```text
HISTORY = provenance only
CURRENT = measured state
MAIN = canonical structure
UI_INSTALLER != RUNNING_SERVICE
CONFIGURED_PORT != LISTENING_PORT
EXISTS != RUNNING
```

## Próximo cursor

```text
FINALIZE_INSTALLATION_IF_PENDING
→ REMEASURE_SERVICES
→ PROBE_8080_8082_3275_3277
→ DASH_CLI_SMOKE_TEST
→ MAP_AMD_CAPABILITY_TO_EXISTING_CENTRALDARK_OWNER
→ MCP_ADAPTER_ONLY_IF_REAL_CAPABILITY_GAIN
→ COUNTERPROOF
→ RECEIPT
```

PDF_GATE permanece independente e fail-closed.

---
title: "AMD — Manageability + ROCm/HIP — 2026-09-18"
status: "MIRROR_OF_GIT_OWNER"
canonical_owner: "docs/BRAIN/03-DOCUMENTACAO/02-BIBLIOTECA/SETORES/ML-CIENCIA-DE-DADOS/AMD-MANAGEABILITY-ROCM-2026-09-18.md"
pr: 1576
observed_at: "2026-09-18T12:25:11-03:00"
---

# AMD — Manageability + ROCm/HIP

> Projeção Obsidian. Autoridade estrutural continua no owner Git acima.

## Cristal operacional

`NO_FULL_REWRITE → COMMON_INTERFACE_FIRST → LOCALIZED_ADAPTER_SECOND → INCREMENTAL_CORE_MIGRATION_LAST → REMEASURE_EACH_STEP`

## Garimpo

- PDF: `E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE\AMD\cuda-to-rocm-migration-paths-infographic.pdf`
- SHA256: `fe44dea00056ae845c89d7892197aaa2ea8de65fc3d9ce9710ea35156c219cb7`
- AMD Manageability Tools: https://www.amd.com/en/support/downloads/manageability-tools.html
- AMD Adaptable Learning: https://learningcatalog-amd.netexam.com/
- CUDA to HIP/ROCm Migration: https://learningcatalog-amd.netexam.com/Certification/69333/cuda-to-hip-rocm-migration

## CURRENT medido

| Componente | Estado | Evidência |
|---|---|---|
| DASH CLI | 🟢 EXISTS | `C:\Program Files\AMD\Manageability API\bin\dashcli.exe` v9.0.0.470 |
| AMC DASH Service | 🟢 RUNNING | `C:\Program Files\AMD Management Console\bin\AMCService.exe` |
| AMC Web Service | 🟢 RUNNING | `C:\Program Files\AMD Management Console\bin\AMCWebService.exe` |
| AMC porta 3274 | 🟢 HTTP 200 | localhost:3274 |
| AMD Manageability API | 🔴 STOPPED | serviço `AMDManageabilityAPI` |
| API porta 8080 | 🔴 NO LISTENER | `C:\Program Files\AMD\Manageability API\config\settings.json` |
| AIM-T Service | 🔴 STOPPED | serviço `AIMTManageabilityService` |
| AMC porta 3275 | 🟡 NOT_PROVEN | sem listener |
| AMC porta 3277 | 🟡 NOT_PROVEN | sem listener |
| API porta 8082 | 🟡 UNKNOWN | consta em `webserverConfig.json`, não provada |

## Pendências com endereço exato

- [ ] **AMD_API_RUNTIME**
  - service: `AMDManageabilityAPI`
  - exe: `C:\Program Files\AMD\Manageability API\bin\amdmanapi.exe`
  - config: `C:\Program Files\AMD\Manageability API\config\settings.json`
  - expected port: `8080`

- [ ] **AIMT_RUNTIME**
  - service: `AIMTManageabilityService`
  - exe: `C:\Program Files\AMD\Manageability Service\bin\AIMTSvc.exe`
  - config: `C:\Program Files\AMD\Manageability Service\bin\App.config`

- [ ] **AMC_ALERT_PORTS**
  - ports: `3275/3277`
  - runtime owner: `C:\Program Files\AMD Management Console\bin\AMCWebService.exe`

- [ ] **API_HTTP_PORT_8082**
  - config: `C:\Program Files\AMD\Manageability API\config\webserverConfig.json`

- [ ] **DASH_CLI_SMOKE**
  - binary: `C:\Program Files\AMD\Manageability API\bin\dashcli.exe`
  - guide: `C:\Program Files\AMD\Manageability API\docs\AMD Manageability API Usage Guide.pdf`

- [ ] **GPU_AI_PRODUCT_ILLUMINATOR_EXACT_ASSET**
  - exact asset name: UNKNOWN
  - verified root: `https://learningcatalog-amd.netexam.com/`

## Regra de prova

`UI_INSTALLER != RUNNING_SERVICE`  
`CONFIGURED_PORT != LISTENING_PORT`  
`EXISTS != RUNNING`  
`HISTORY = PROVENANCE_ONLY`  
`CURRENT = MEASURED_REALITY`

## NEXT_CURSOR

`FINALIZE_INSTALLATION_IF_PENDING → REMEASURE_SERVICES → PROBE_PORTS → DASH_CLI_SMOKE → MAP_TO_EXISTING_CENTRALDARK_OWNER → MCP_ADAPTER_ONLY_IF_GAIN → COUNTERPROOF → RECEIPT`

PDF_GATE permanece independente e fail-closed.


## Diagnóstico aprofundado — 12:xx

- **Host local:** Intel Core i5-10400F (GenuineIntel). AIM-T é orientado a plataforma AMD PRO; neste host, uso como endpoint local permanece incompatível/UNKNOWN até prova contrária.
- **AMD Manageability API:** coexistem registros MSI `8.0.0.346` e `9.0.0.470` no mesmo diretório `C:\Program Files\AMD\Manageability API\`.
  - v8 ProductCode: `{075C3B20-F610-4F81-8438-6E63A48FA281}`
  - v9 ProductCode: `{2F7CD50D-7C99-401F-BC03-4F8CF5E9A00A}`
  - binário atual: v9.0.0.470
  - serviço: FAIL com SCM 7009/7000, timeout 180000 ms
  - execução manual no diretório correto: exit code 1
  - log: `C:\ProgramData\AMD\ManageabilityAPI\ManageabilityAPI.log`
  - 8080/8082: sem listener
- **AIM-T:** instalação 6.0.0.1721 falhou.
  - MSI 1603
  - Event 11720 / Error 1720: VBScript permission denied em custom action `CopyInk`
  - houve também Error 1500: outra instalação em andamento
  - dependência de serviço: `AMS-MailBoxDrv`
  - `AMS-MailBoxDrv`: NÃO INSTALADO (SC 1060)
  - MSI source: `C:\Users\Administrador\AppData\Local\Downloaded Installations\{E134E664-AE2C-41F6-8476-71DEFC71F1EF}\AIM-T_Manageability_Service.msi`

### Nova regra

`SERVICE_REGISTERED_AFTER_FAILED_MSI != HEALTHY_INSTALL`  
`DUAL_MSI_REGISTRATION != ROOT_CAUSE_PROVEN`  
`PLATFORM_CAPABILITY_REQUIRES_PLATFORM_MATCH`

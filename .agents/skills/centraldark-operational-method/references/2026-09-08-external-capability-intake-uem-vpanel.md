# 🧿 EXTERNAL_CAPABILITY_INTAKE_UEM_VPANEL

status: `DELTA_UTIL_REGISTERED`
owner: `.agents/skills/centraldark-operational-method/SKILL.md`
pr: `#1463`
refs: `#1444`, `#1463`
writer: `SOL`
mode: `DELTA_UTIL_ONLY`

## INTENÇÃO

Absorver o que há de útil em fontes externas enviadas pelo CHEFE sem criar arquitetura paralela, sem importar código bruto às cegas, sem seguir link de anúncio como fonte de verdade e sem tocar `main` antes de prova.

```text
EXTERNAL_SOURCE != OWNER
EXTERNAL_REPO != COPY_TARGET
AD_LINK != TRUSTED_SOURCE_OF_TRUTH
USEFUL_CAPABILITY -> CENTRALDARK_CLASSIFIER -> EXISTING_OWNER -> TEST -> RECEIPT
```

## FONTES_MEDIDAS

```yaml
manageengine_endpoint_central:
  type: official_product_reference
  useful_as: capability_catalog
  code_import: false
  reason: proprietary/commercial external product; use as benchmark, not dependency

nobita329_vpanel_pro:
  type: public_github_repository
  visibility: public
  default_branch: main
  access: read_only
  useful_as: architecture_pattern_catalog
  code_import: false
  reason: README declares MIT but LICENSE file was not found at repository root in this measurement; no copy until license/provenance are reconciled
```

## DELTA_UTIL_ABSORVIDO

### 1. UEM / SOFTWARE DEPLOYMENT PATTERN

```text
CAPABILITY: endpoint inventory + package repository + staged deployment + patch/app lifecycle + rollback + remote support + audit/reporting
CENTRALDARK_MAPPING: deployment/control-plane checklist, not new product
```

Useful internal names:

```text
SOFTWARE_PACKAGE_REGISTRY
TARGET_INVENTORY
DEPLOYMENT_DRAFT
APPROVAL_GATE
ROLLBACK_READY
REMOTE_SESSION_AUDIT
HEALTH_AFTER_ACTION
```

### 2. VPANEL-PRO PATTERN

```text
CAPABILITY: web control panel for QEMU/KVM VM management
USEFUL_PARTS:
  - API-first panel
  - RBAC/subuser permissions
  - audit logs
  - terminal/log streaming via WebSocket/Xterm pattern
  - file manager with fallback engine
  - snapshot/backup scheduling
  - explicit port map
  - PM2/system service deployment shape
  - installer/preflight checklist
```

CentralDark mapping:

```text
CENTRALDARK_SITE_PANEL
  -> show live status, not fake proof
CENTRALDARK_REMOTE_BRIDGE
  -> terminal/log stream only after authorization
CENTRALDARK_DEPLOYMENT_CONTROL
  -> package/artifact/rollback/health gates
CENTRALDARK_AUDIT_TIMELINE
  -> every action emits receipt
```

## FORBIDDEN

```text
COPY_EXTERNAL_CODE_BLINDLY=false
RUN_EXTERNAL_INSTALLER_BLINDLY=false
INSTALL_MANAGEENGINE_AS_DEPENDENCY=false
IMPORT_VPANEL_AS_NEW_PANEL=false
RENAME_CENTRALDARK_HOME=false
CREATE_V2_V3_V4=false
SECRET_IN_RECEIPT=false
AD_CLICK_TRACKING_AS_SOURCE=false
```

## REQUIRED_BEFORE_IMPLEMENTING_ANYTHING

```text
1. Identify existing CentralDark owner.
2. Confirm license/provenance if any code is considered.
3. Convert external idea into CentralDark capability name.
4. Add test before integration.
5. Prove no regression on same HEAD.
6. Separate Casa proof from site proof.
7. Register receipt and NEXT_CURSOR.
```

## CANDIDATE_OWNER_MAPPING

```yaml
software_deployment_package_registry:
  existing_owner_candidate: deployment/artifact or release pipeline owner
  status: UNKNOWN_UNTIL_REPO_SEARCH

remote_control_or_terminal_stream:
  existing_owner_candidate: Remote Bridge / MCP / site panel owner
  status: UNKNOWN_UNTIL_RUNTIME_AUTHORIZATION

rbac_and_audit_timeline:
  existing_owner_candidate: CentralDark site/admin governance owner
  status: CANDIDATE_PATTERN_ONLY

snapshot_backup_scheduler:
  existing_owner_candidate: VPS/Casa backup/rollback owner
  status: CANDIDATE_PATTERN_ONLY
```

## ZERO_REGRESSION_TEST_IDEAS

```text
EXTERNAL_INTAKE_DOES_NOT_CREATE_DEPENDENCY
AD_LINK_IS_NOT_USED_AS_TRUSTED_SOURCE
EXTERNAL_REPO_IS_PATTERN_ONLY_UNTIL_LICENSE_CONFIRMED
CAPABILITY_MAP_REUSES_EXISTING_OWNER
SITE_PANEL_DOES_NOT_PROVE_CASA
CASA_RUNTIME_DOES_NOT_PROVE_SITE
ROLLBACK_REQUIRED_BEFORE_DEPLOY_ACTION
```

## NEXT_CURSOR

```text
search CentralDark for existing owners:
  package/artifact/deploy
  remote bridge
  site panel/admin
  audit timeline
  rollback/snapshot
then attach each useful external capability to the existing owner instead of creating a new subsystem.
```

UNKNOWN != PASS
DOCUMENTED != EXECUTED
EXTERNAL_IDEA != IMPLEMENTED_CAPABILITY

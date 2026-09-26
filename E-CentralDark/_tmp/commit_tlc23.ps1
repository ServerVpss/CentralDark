$ErrorActionPreference='Stop'
$repo='E:\CentralDark\worktrees\tlc23-master-fixed-point-20260915'
Set-Location $repo
git add .github/workflows/sol-wire-build-mcp-pairing-one-shot.yml
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
git add .gitignore apps/modulos/mcp/src/device-pairing.js apps/modulos/mcp/tests/device-pairing.test.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
git add docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
git add docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
git add docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/UNIVERSAL-ENGINE-METHOD.yml
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
git add scripts/trigger-fabric/centraldark_full_trigger_boot.py scripts/trigger-fabric/centraldark_master_cycle.py
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
git add scripts/trigger-fabric/test_centraldark_full_trigger_boot.py scripts/trigger-fabric/test_centraldark_master_cycle.py
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
git status --short --branch
git commit -m 'cristal-tlc23-master-heartbeat'
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
git rev-parse HEAD

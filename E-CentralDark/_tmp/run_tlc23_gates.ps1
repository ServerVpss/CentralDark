$ErrorActionPreference='Continue'
$repo='E:\CentralDark\worktrees\tlc23-master-fixed-point-20260915'
Set-Location $repo
python scripts/trigger-fabric/test_centraldark_master_cycle.py
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
python scripts/trigger-fabric/test_centraldark_full_trigger_boot.py
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
python .agents/skills/meta-lupa/scripts/horn_caracol_gate.py --self-test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
node --test apps/modulos/mcp/tests/device-pairing.test.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
node --check apps/modulos/mcp/src/device-pairing.js
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
git diff --check
exit $LASTEXITCODE

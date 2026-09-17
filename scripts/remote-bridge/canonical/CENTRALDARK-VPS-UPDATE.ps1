param(
  [string[]]$Targets = @("segredo-vpss", "root@100.121.152.119")
)

$ErrorActionPreference = "Stop"

Write-Host "╔══════════════════════════════════════════════╗"
Write-Host "║ CENTRALDARK · CANONICAL HYBRID SSH GATE    ║"
Write-Host "╚══════════════════════════════════════════════╝"
Write-Host ""

$Selected = $null
foreach ($Target in $Targets) {
    Write-Host "[TEST] $Target"
    & ssh -o ConnectTimeout=6 -o BatchMode=yes $Target "printf 'CENTRALDARK_SSH_PASS\n'; hostname" 2>$null
    if ($LASTEXITCODE -eq 0) {
        $Selected = $Target
        Write-Host "[PASS] ROTA=$Selected"
        break
    }
    Write-Host "[WAIT] Rota indisponível: $Target"
}

if (-not $Selected) {
    throw "CENTRALDARK_SSH_GATE=BLOCKED — nenhuma rota SSH canônica respondeu"
}

$Remote = @'
set -euo pipefail

REPO="/root/CentralDark"
cd "$REPO"

echo "=== CENTRALDARK T0 ==="
echo "HOST=$(hostname)"
echo "HEAD_BEFORE=$(git rev-parse HEAD 2>/dev/null || echo UNKNOWN)"
echo "BRANCH_BEFORE=$(git symbolic-ref --short -q HEAD || echo DETACHED)"

if [ ! -x scripts/vps/deploy-guards-dispatcher.sh ]; then
  echo "CENTRALDARK_DEPLOY_DISPATCHER=MISSING"
  exit 20
fi

echo "=== TLC23 / UNIVERSAL DRY RUN ==="
./scripts/vps/deploy-guards-dispatcher.sh

echo "=== APPLY VIA CANONICAL DISPATCHER ==="
./scripts/vps/deploy-guards-dispatcher.sh --apply

if [ -f scripts/remote-bridge/canonical/INSTALL-VPS.sh ]; then
  chmod +x scripts/remote-bridge/canonical/INSTALL-VPS.sh
  ./scripts/remote-bridge/canonical/INSTALL-VPS.sh
else
  echo "REMOTE_TRAY_INSTALLER=UNKNOWN"
fi

echo "=== CENTRALDARK T1 ==="
echo "HOST=$(hostname)"
echo "HEAD_AFTER=$(git rev-parse HEAD 2>/dev/null || echo UNKNOWN)"
echo "BRANCH_AFTER=$(git symbolic-ref --short -q HEAD || echo DETACHED)"

test -f /root/CentralDark/runtime/remote-tray/REMOTE-TRAY-STATUS-CANONICO.md && echo "REMOTE_TRAY_CONTRACT=PROVED" || echo "REMOTE_TRAY_CONTRACT=UNKNOWN"
test -f /root/CentralDark/runtime/remote-tray/receipts/latest.json && echo "REMOTE_TRAY_RECEIPT=PROVED" || echo "REMOTE_TRAY_RECEIPT=UNKNOWN"

echo "CENTRALDARK_VPS_UPDATE=COMPLETE"
'@

Write-Host "[EXEC] Atualização canônica via $Selected"
& ssh $Selected "bash -lc '$($Remote.Replace("'", "'\"'\"'"))'"
if ($LASTEXITCODE -ne 0) {
    throw "CENTRALDARK_VPS_UPDATE=FAILED exit=$LASTEXITCODE route=$Selected"
}

Write-Host ""
Write-Host "[PASS] CENTRALDARK_CANONICAL_HYBRID_SSH_GATE"
Write-Host "[PASS] ROUTE=$Selected"
Write-Host "[PASS] atualização passou pelo owner scripts/vps/deploy-guards-dispatcher.sh"
Write-Host "[PASS] TLC23/HORN/UNIVERSAL PRE-FLIGHT obrigatório antes do deploy"
Write-Host "REALIDADE = JUIZ"

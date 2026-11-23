param(
  [string[]]$Targets = @("segredo-vpss"),
  [switch]$ProbeOnly
)

$ErrorActionPreference = "Stop"

Write-Host "╔══════════════════════════════════════════════╗"
Write-Host "║ CENTRALDARK · CANONICAL HYBRID SSH GATE    ║"
Write-Host "╚══════════════════════════════════════════════╝"
Write-Host ""

# SSH same identity, Tailscale preferred, public fallback, host key pinned.
$Candidates = @(
    @{ Label = "TAILSCALE"; Options = @("-o", "HostName=100.90.199.124", "-o", "HostKeyAlias=89.117.78.124", "-o", "StrictHostKeyChecking=yes") },
    @{ Label = "PUBLIC_FALLBACK"; Options = @("-o", "StrictHostKeyChecking=yes") }
)
$Selected = $null
$SelectedArgs = @()
foreach ($Candidate in $Candidates) {
    foreach ($Target in $Targets) {
        $Opts = @("-o", "ConnectTimeout=6", "-o", "BatchMode=yes") + @($Candidate.Options)
        Write-Host "[TEST] $($Candidate.Label) via $Target"
        & ssh @Opts $Target "printf 'CENTRALDARK_SSH_PASS\n'; hostname" 2>$null
        if ($LASTEXITCODE -eq 0) {
            $Selected = $Candidate.Label
            $SelectedArgs = @($Opts) + @($Target)
            Write-Host "[PASS] ROTA=$Selected host_alias=$Target"
            break
        }
        Write-Host "[WAIT] Rota indisponivel: $($Candidate.Label) via $Target"
    }
    if ($Selected) { break }
}
if (-not $Selected) {
    throw "CENTRALDARK_SSH_GATE=BLOCKED - nenhuma rota SSH canonica respondeu"
}
if ($ProbeOnly) {
    Write-Host "[PASS] CENTRALDARK_SSH_PROBE_ONLY=true ROUTE=$Selected DEPLOY=false"
    return
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
# Remote payload base64 preserves UTF-8 and avoids nested quoting.
$Payload = $Remote.Replace("`r`n", "`n")
$Encoded = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($Payload))
& ssh @SelectedArgs "printf %s $Encoded | base64 --decode | bash"
if ($LASTEXITCODE -ne 0) {
    throw "CENTRALDARK_VPS_UPDATE=FAILED exit=$LASTEXITCODE route=$Selected"
}

Write-Host ""
Write-Host "[PASS] CENTRALDARK_CANONICAL_HYBRID_SSH_GATE"
Write-Host "[PASS] ROUTE=$Selected"
Write-Host "[PASS] atualização passou pelo owner scripts/vps/deploy-guards-dispatcher.sh"
Write-Host "[PASS] TLC23/HORN/UNIVERSAL PRE-FLIGHT obrigatório antes do deploy"
Write-Host "REALIDADE = JUIZ"

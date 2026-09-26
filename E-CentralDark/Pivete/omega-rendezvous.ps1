# omega-rendezvous.ps1 — CROSS_WINDOW_RENDEZVOUS
# normalize -> dedupe -> contradicao -> reconciled snapshot -> ONE WRITER -> fixed point
# Owner: HERMES-CORE/core/continuity-guard.mjs (semantica de reconciled snapshot) + scripts/enxame-3ias.sh (consolida)
# Regras: ONE_WRITER_PER_SCOPE, UNKNOWN_IS_NOT_PASS, NO_PARALLEL_ORCHESTRATOR.

param(
  [string]$Registry = "E:/CentralDark/Pivete/OMEGA_RENDEZVOUS.json",
  [string]$SnapshotId = "SNAP-$(Get-Date -Format 'yyyy-MM-ddTHH-mm-ssZ')"
)

$reg = Get-Content $Registry -Raw | ConvertFrom-Json
$now = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

# 1. coletar todos os receipts de todos os bracos
$allReceipts = @()
foreach ($w in $reg.WORKERS) {
  if ($w.RECEIPTS) { foreach ($r in $w.RECEIPTS) { $allReceipts += [PSCustomObject]@{ TERMINAL_ID=$w.TERMINAL_ID; Receipt=$r } } }
}

# 2. normalize + dedupe por (TERMINAL_ID + FACTS + AT)
$seen = @{}
$normalized = @()
foreach ($item in $allReceipts) {
  $key = "$($item.TERMINAL_ID)|$($item.Receipt.FACTS)|$($item.Receipt.AT)"
  if (-not $seen.ContainsKey($key)) { $seen[$key]=1; $normalized += $item }
}

# 3. detectar contradicoes: mesmo TERMINAL_ID com VERDICT oposto ou FACTS conflitantes
$contradictions = @()
$groups = $normalized | Group-Object { $_.TERMINAL_ID }
foreach ($g in $groups) {
  $verdicts = $g.Group.Receipt.VERDICT | Sort-Object -Unique
  if ($verdicts.Count -gt 1) {
    $contradictions += "CONTRADICAO $($g.Name): verditos=$($verdicts -join ',')"
  }
}

# 4. contar unknown material
$unknownMaterial = ($normalized | Where-Object { $_.Receipt.UNKNOWN -and $_.Receipt.UNKNOWN.Trim().Length -gt 0 }).Count

# 5. fixed point gates
$sameMission = ($reg.MISSION_ID -eq 'CENTRALDARK_MULTIWINDOW_OMEGA_RECONCILIATION')
$requiredBearings = @('T0')
$covered = $requiredBearings | Where-Object { $reg.WORKERS.TERMINAL_ID -contains $_ -or $reg.T0_SOL_ORCHESTRATOR.TERMINAL_ID -eq $_ }
$bearingsCovered = ($covered.Count -eq $requiredBearings.Count)
$tStable = ($reg.WORKERS | Where-Object { $_.STATE -eq 'STALLED' }).Count -eq 0
$noContradiction = $contradictions.Count -eq 0
$counterproofSurvives = ($normalized | Where-Object { $_.Receipt.COUNTERPROOF -and $_.Receipt.COUNTERPROOF.Trim().Length -gt 0 }).Count -gt 0

$fixedPoint = $sameMission -and $bearingsCovered -and ($unknownMaterial -eq 0) -and $noContradiction -and $counterproofSurvives -and $tStable

# 6. reconciled snapshot
$snapshot = [PSCustomObject]@{
  SNAPSHOT_ID = $SnapshotId
  GENERATED_AT = $now
  MISSION_ID = $reg.MISSION_ID
  NORMALIZED_RECEIPTS = $normalized.Count
  CONTRADICTIONS = $contradictions
  UNKNOWN_MATERIAL = $unknownMaterial
  FIXED_POINT = $fixedPoint
  WORKERS = $reg.WORKERS.TERMINAL_ID
}

$reg.RECONCILED_SNAPSHOT = $snapshot
$reg.FIXED_POINT = $fixedPoint
$reg | ConvertTo-Json -Depth 8 | Set-Content $Registry -Encoding UTF8

# 7. saida
Write-Output "=== OMEGA RENDEZVOUS ==="
Write-Output "Receipts normalizados: $($normalized.Count) | Duplicados removidos: $($allReceipts.Count - $normalized.Count)"
Write-Output "Contradicoes: $($contradictions.Count)"
foreach ($c in $contradictions) { Write-Output "  ! $c" }
Write-Output "Unknown material: $unknownMaterial"
Write-Output "Bearings cobertos: $bearingsCovered | T0 presente: $(($reg.T0_SOL_ORCHESTRATOR.TERMINAL_ID -eq 'T0'))"
Write-Output "FIXED_POINT_PASS: $fixedPoint"
Write-Output "Snapshot: $SnapshotId"

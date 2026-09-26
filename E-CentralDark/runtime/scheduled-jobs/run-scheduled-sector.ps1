[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [ValidateSet('REMOTE_BRIDGE','SCREENPIPE_CRYSTAL','PDF_GATE','SYSTEM_SENTINEL','UNIFIED_BUILD')]
  [string]$Sector
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$Repo = 'E:\CentralDark\CentralDark\CentralDark'
$Unified = 'E:\CentralDark\CentralDark-Unified-OneShot'
$Runtime = Join-Path $env:LOCALAPPDATA 'CentralDark\ScheduledJobs'
$ReceiptDir = Join-Path $Runtime 'receipts'
$LogDir = Join-Path $Runtime 'logs'
New-Item -ItemType Directory -Force -Path $ReceiptDir,$LogDir | Out-Null

$started = Get-Date
$stamp = $started.ToString('yyyyMMdd-HHmmss')
$log = Join-Path $LogDir (('{0}-{1}.log' -f $Sector,$stamp))
$receiptPath = Join-Path $ReceiptDir (('{0}-latest.json' -f $Sector))

function Invoke-Captured {
  param([scriptblock]$Block)
  $global:LASTEXITCODE = 0
  try {
    $output = @(& $Block *>&1)
    $code = if ($null -eq $LASTEXITCODE) { 0 } else { [int]$LASTEXITCODE }
    $output | Out-File -LiteralPath $log -Encoding utf8
    return [int]$code
  } catch {
    ($_ | Out-String) | Out-File -LiteralPath $log -Encoding utf8 -Append
    return 90
  }
}

$commandDesc = ''
$exitCode = 99

switch ($Sector) {
  'REMOTE_BRIDGE' {
    $commandDesc = 'discover-operational-channels.ps1 -Json'
    $script = Join-Path $Repo 'scripts\casa\discover-operational-channels.ps1'
    if (!(Test-Path -LiteralPath $script)) { $exitCode = 91; break }
    $exitCode = Invoke-Captured { powershell.exe -NoProfile -ExecutionPolicy Bypass -File $script -Json }
  }

  'SCREENPIPE_CRYSTAL' {
    $commandDesc = 'process screenpipe-app + validar-cristal-casa-remote-screenpipe'
    $validator = Join-Path $Repo 'scripts\lupa\validar-cristal-casa-remote-screenpipe.mjs'
    if (!(Test-Path -LiteralPath $validator)) { $exitCode = 91; break }
    $exitCode = Invoke-Captured {
      Push-Location $Repo
      try {
        $p = Get-Process -Name 'screenpipe-app' -ErrorAction SilentlyContinue
        [pscustomobject]@{
          observed_at=(Get-Date).ToString('o')
          screenpipe_process_count=@($p).Count
          process_alive_is_not_full_integration_proof=$true
        } | ConvertTo-Json -Compress
        node $validator
      } finally {
        Pop-Location
      }
    }
  }

  'PDF_GATE' {
    $commandDesc = 'pdf-conformance-cc2003 full gate: identity + policy + self-test + node:test + tamper counterproof'
    $probe = Join-Path $Repo 'scripts\lupa\pdf-conformance-cc2003.mjs'
    $test = Join-Path $Repo 'scripts\lupa\pdf-conformance-cc2003.test.mjs'
    $canonical = Join-Path $Repo 'docs\CONSCIENCIA\04-MCP-E-CONECTORES\tlc23.pdf'
    if (!(Test-Path -LiteralPath $probe)) { $exitCode = 91; break }
    if (!(Test-Path -LiteralPath $test)) { $exitCode = 92; break }
    if (!(Test-Path -LiteralPath $canonical)) { $exitCode = 93; break }

    $exitCode = Invoke-Captured {
      Push-Location $Repo
      $tamperDir = $null
      try {
        node $probe
        if ($LASTEXITCODE -ne 0) {
          Write-Output ('PDF_GATE_STAGE_identity=FAIL code=' + $LASTEXITCODE)
          throw 'PDF_GATE_IDENTITY_FAIL'
        }
        Write-Output 'PDF_GATE_STAGE_identity=PASS'

        $policyText = (node $probe --info | Out-String)
        if ($LASTEXITCODE -ne 0) {
          Write-Output ('PDF_GATE_STAGE_policy=FAIL code=' + $LASTEXITCODE)
          throw 'PDF_GATE_POLICY_EXEC_FAIL'
        }
        if ($policyText -notmatch '"UNKNOWN_IS_NOT_PASS"\s*:\s*true' -or
            $policyText -notmatch '"ARTIFACT_NAME_IS_NOT_IDENTITY"\s*:\s*true' -or
            $policyText -notmatch '"EMPTY_PATH_IS_NOT_ARTIFACT_MISSING"\s*:\s*true') {
          Write-Output 'PDF_GATE_STAGE_policy=FAIL reason=POLICY_INVARIANT_MISSING'
          throw 'PDF_GATE_POLICY_FAIL'
        }
        Write-Output $policyText.Trim()
        Write-Output 'PDF_GATE_STAGE_policy=PASS'

        node $probe --self-test
        if ($LASTEXITCODE -ne 0) {
          Write-Output ('PDF_GATE_STAGE_self_test=FAIL code=' + $LASTEXITCODE)
          throw 'PDF_GATE_SELF_TEST_FAIL'
        }
        Write-Output 'PDF_GATE_STAGE_self_test=PASS'

        node --test $test
        if ($LASTEXITCODE -ne 0) {
          Write-Output ('PDF_GATE_STAGE_node_test=FAIL code=' + $LASTEXITCODE)
          throw 'PDF_GATE_NODE_TEST_FAIL'
        }
        Write-Output 'PDF_GATE_STAGE_node_test=PASS'

        $tamperDir = Join-Path $env:TEMP ('centraldark-pdf-gate-' + [guid]::NewGuid().ToString('N'))
        New-Item -ItemType Directory -Force -Path $tamperDir | Out-Null
        $tampered = Join-Path $tamperDir 'tlc23.pdf'
        Copy-Item -LiteralPath $canonical -Destination $tampered -Force
        $bytes = [System.IO.File]::ReadAllBytes($tampered)
        $bytes[0] = $bytes[0] -bxor 255
        [System.IO.File]::WriteAllBytes($tampered, $bytes)

        $tamperOutput = (node $probe --pdf $tampered 2>&1 | Out-String)
        $tamperCode = [int]$LASTEXITCODE
        Write-Output $tamperOutput.Trim()
        if ($tamperCode -ne 1 -or $tamperOutput -notmatch 'BYTE_IDENTITY_MISMATCH') {
          Write-Output ('PDF_GATE_STAGE_tamper=FAIL code=' + $tamperCode)
          throw 'PDF_GATE_TAMPER_COUNTERPROOF_FAIL'
        }
        Write-Output 'PDF_GATE_STAGE_tamper=PASS'
        Write-Output 'PDF_GATE_PROMOTED=true'
        Write-Output 'REQUIRED_CHAIN=TLC23/HORN->PDF_GATE->COUNTERPROOF->PASS'
        $global:LASTEXITCODE = 0
      } finally {
        if ($tamperDir -and (Test-Path -LiteralPath $tamperDir)) {
          Remove-Item -LiteralPath $tamperDir -Recurse -Force -ErrorAction SilentlyContinue
        }
        Pop-Location
      }
    }
  }

  'SYSTEM_SENTINEL' {
    $commandDesc = 'system_sentinel.py --scan-notes'
    $sentinel = Join-Path $Repo 'scripts\trigger-fabric\system_sentinel.py'
    if (!(Test-Path -LiteralPath $sentinel)) { $exitCode = 91; break }
    $exitCode = Invoke-Captured {
      Push-Location $Repo
      try { python $sentinel --scan-notes }
      finally { Pop-Location }
    }
  }

  'UNIFIED_BUILD' {
    $commandDesc = 'CentralDark-Unified-OneShot BUILD.ps1'
    $build = Join-Path $Unified 'BUILD.ps1'
    if (!(Test-Path -LiteralPath $build)) { $exitCode = 91; break }
    $exitCode = Invoke-Captured { powershell.exe -NoProfile -ExecutionPolicy Bypass -File $build }
  }
}

$ended = Get-Date
$receipt = [ordered]@{
  schema='centraldark.scheduled-sector-receipt.v1'
  sector=$Sector
  surface='CASA'
  started_at=$started.ToString('o')
  ended_at=$ended.ToString('o')
  duration_seconds=[math]::Round(($ended-$started).TotalSeconds,3)
  command=$commandDesc
  exit_code=[int]$exitCode
  probe_result=$(if($exitCode -eq 0){'PROBE_PASS'}else{'PROBE_FAIL_OR_UNKNOWN'})
  final_pass_claimed=$(if($Sector -eq 'PDF_GATE' -and $exitCode -eq 0){$true}else{$false})
  pdf_gate_promoted=$(if($Sector -eq 'PDF_GATE' -and $exitCode -eq 0){$true}else{$false})
  current_gt_historical=$true
  unknown_is_not_pass=$true
  action_is_not_proof=$true
  reality_is_judge=$true
  log=$log
}
$receipt | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $receiptPath -Encoding UTF8
Write-Output ('RECEIPT='+$receiptPath)
Write-Output ('SECTOR_RESULT='+$receipt.probe_result)
exit $exitCode

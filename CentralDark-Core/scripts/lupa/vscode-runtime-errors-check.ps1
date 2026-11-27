#requires -Version 7.0
$ErrorActionPreference = 'SilentlyContinue'

$results = [System.Collections.Generic.List[object]]::new()
function Add-Result($id,$target,$status,$detail) {
  $results.Add([pscustomobject]@{ id=$id; target=$target; status=$status; detail=$detail; timestamp=(Get-Date).ToString('o') })
}

function Test-Listener($port) {
  try { return [bool](Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction Stop) } catch { return $false }
}

function Test-Http($url) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    return "HTTP_$($r.StatusCode)"
  } catch {
    return "FAIL:$($_.Exception.Message)"
  }
}

$pwsh = $PSVersionTable.PSVersion.ToString()
Add-Result 'BASE' 'PowerShell7' ($(if ($PSVersionTable.PSVersion.Major -ge 7) {'PASS'} else {'FAIL'})) $pwsh

$winrm = Get-Service WinRM -ErrorAction SilentlyContinue
if ($winrm) { Add-Result 'E-WINRM' 'WinRM' ($(if ($winrm.Status -eq 'Running') {'PASS'} else {'FAIL'})) "$($winrm.Status)/$($winrm.StartType)" }
else { Add-Result 'E-WINRM' 'WinRM' 'UNKNOWN' 'service not found' }

foreach ($p in 35645,5985,8099,9222) {
  Add-Result "PORT-$p" "TCP:$p" ($(if (Test-Listener $p) {'PASS'} else {'FAIL'})) 'listener probe'
}

Add-Result 'E08' 'HermesRouter8099' ($(if ((Test-Http 'http://127.0.0.1:8099/health') -match '^HTTP_2') {'PASS'} else {'FAIL'})) (Test-Http 'http://127.0.0.1:8099/health')
Add-Result 'E09' 'ChromeDevTools9222' ($(if ((Test-Http 'http://127.0.0.1:9222/json/version') -match '^HTTP_2') {'PASS'} else {'FAIL'})) (Test-Http 'http://127.0.0.1:9222/json/version')

$code = Get-Command code -ErrorAction SilentlyContinue
if ($code) {
  $version = (& code --version 2>$null | Select-Object -First 1)
  Add-Result 'VS-CODE' 'code' 'PASS' $version
  $ext = (& code --list-extensions --show-versions 2>$null) -join '; '
  Add-Result 'VS-EXTENSIONS' 'extensions' 'OBSERVED' $ext
} else {
  Add-Result 'VS-CODE' 'code' 'UNKNOWN' 'code command not found'
}

$logRoot = Join-Path $env:APPDATA 'Code\logs'
$patterns = @(
  @{ id='E01'; regex='IpcClient.*Initialize failed.*timeout|Initialize failed: timeout' },
  @{ id='E02'; regex='0\.8\.0.*0\.9\.0|protocol.*0\.9\.0' },
  @{ id='E03'; regex='PowerShell Extension Terminal.*died|IntelliSense.*unavailable' },
  @{ id='E04'; regex='GitHub.*429|HTTP 429|status.?429' },
  @{ id='E05'; regex='wt-pr-1454' },
  @{ id='E06'; regex='C:\\root\\scripts\\vigia\\package\.json' },
  @{ id='E07'; regex='CentralDark-Remote-Tray.*not.*git|not a git repository' }
)

if (Test-Path $logRoot) {
  $latestDirs = Get-ChildItem $logRoot -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 3
  $logFiles = $latestDirs | ForEach-Object { Get-ChildItem $_.FullName -File -Recurse -ErrorAction SilentlyContinue }
  foreach ($p in $patterns) {
    $matches = $logFiles | Select-String -Pattern $p.regex -ErrorAction SilentlyContinue | Select-Object -First 5
    if ($matches) {
      Add-Result $p.id 'VSCodeLogs' 'CURRENT_FAIL_CANDIDATE' (($matches | ForEach-Object { "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" }) -join ' || ')
    } else {
      Add-Result $p.id 'VSCodeLogs' 'NOT_REPRODUCED_CURRENTLY' 'pattern absent in latest 3 log sessions'
    }
  }
} else {
  foreach ($p in $patterns) { Add-Result $p.id 'VSCodeLogs' 'UNKNOWN' 'VS Code log root not found' }
}

$results | ConvertTo-Json -Depth 4

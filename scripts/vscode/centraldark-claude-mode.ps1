param([ValidateSet('ON','OFF','STATUS')][string]$Mode='STATUS')
$stateDir=Join-Path $env:USERPROFILE '.centraldark'
$stateFile=Join-Path $stateDir 'claude-route.mode'
New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
if($Mode -eq 'STATUS') {
  $current='OFF'
  if(Test-Path $stateFile){$current=(Get-Content $stateFile -Raw).Trim().ToUpper()}
  Write-Output "CENTRALDARK_CLAUDE_MODE=$current"
  exit 0
}
Set-Content -Path $stateFile -Value $Mode -NoNewline -Encoding ascii
Write-Output "CENTRALDARK_CLAUDE_MODE=$Mode"
Write-Output 'NEXT_CLAUDE_PROCESS=USES_THIS_ROUTE'
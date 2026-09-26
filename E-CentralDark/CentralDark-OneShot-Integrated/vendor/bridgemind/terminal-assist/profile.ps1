# BridgeMind — OSC 133 prompt marks + OSC 9;9 cwd
$global:BMONE_SHELL_INTEGRATION = 1
$global:__bmone_running = $false
$global:__bmone_esc = [char]27
function global:__bmone_emit([string]$payload) {
  Write-Host -NoNewline ("{0}]{1}{0}\" -f $global:__bmone_esc, $payload)
}
function global:__bmone_cwd() {
  try { __bmone_emit ("9;9;{0}" -f (Get-Location).Path) } catch { }
}
if (Get-Command Set-PSReadLineKeyHandler -ErrorAction SilentlyContinue) {
  try {
    Set-PSReadLineKeyHandler -Key Enter -ScriptBlock {
      $global:__bmone_running = $true
      __bmone_emit '133;B'
      __bmone_emit '133;C'
      [Microsoft.PowerShell.PSConsoleReadLine]::AcceptLine()
    }
  } catch { }
}
function global:prompt {
  $exitCode = if ($null -ne $global:LASTEXITCODE) { [int]$global:LASTEXITCODE } elseif ($?) { 0 } else { 1 }
  if ($global:__bmone_running) {
    __bmone_emit ("133;D;{0}" -f $exitCode)
    $global:__bmone_running = $false
  }
  __bmone_cwd
  __bmone_emit '133;A'
  "PS $(Get-Location)> "
}
__bmone_cwd
__bmone_emit '133;A'

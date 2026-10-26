# CentralDark-Remote / SOL: benchmark UIAutomation somente no contexto autorizado.
# Conta transicoes de abas, foco, escrita e limpeza; NAO envia mensagens.
param(
  [ValidateRange(3, 10)][int]$MaxRounds = 8,
  [ValidateRange(5, 10)][int]$MinRounds = 5,
  [ValidateRange(0.05, 0.5)][double]$Tolerance = 0.15
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient
$rootDir = Join-Path $env:LOCALAPPDATA 'CentralDark\telemetry'
[System.IO.Directory]::CreateDirectory($rootDir) | Out-Null
$logPath = Join-Path $rootDir 'focus-events.jsonl'
$runId = [guid]::NewGuid().ToString('N')
$schema = 'centraldark.focus-telemetry.v2'
$sw = [System.Diagnostics.Stopwatch]
function Record-Action([string]$kind,[double]$duration,[bool]$verified,[string]$route,[int]$round) {
  $entry = [ordered]@{
    schema = $schema; at = [DateTimeOffset]::UtcNow.ToString('o')
    run_id = $runId; skill = 'centraldark-operational-method'
    kind = $kind; latency_ms = [Math]::Round($duration,3)
    verified = $verified; route = $route; round = $round
    source = 'CentralDark-Remote/DesktopCommander/UIAutomation'
  }
  Add-Content -LiteralPath $logPath -Value ($entry | ConvertTo-Json -Compress) -Encoding utf8
}
function Find-Items($r,$controlType) {
  $cond = [System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::ControlTypeProperty,$controlType)
  return $r.FindAll([System.Windows.Automation.TreeScope]::Descendants,$cond)
}
function Choose-Tab($tab,[string]$route,[int]$round) {
  if (-not $tab) { throw 'TAB_NOT_FOUND' }
  $watch = [System.Diagnostics.Stopwatch]::StartNew()
  $p = $tab.GetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern)
  if ($p.Current.IsSelected) { return } # sem seleção redundante
  $p.Select()
  $watch.Stop()
  $ok = [bool]$p.Current.IsSelected
  Record-Action 'tab_switch' $watch.Elapsed.TotalMilliseconds $ok $route $round
  if (-not $ok) { throw 'TAB_SWITCH_READBACK_FAILED' }
}
$edge = @(Get-Process msedge -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowHandle -ne 0})
$browser = $null
$claudeTab = $null
$chatTab = $null
foreach ($p in $edge) {
  $candidate = [System.Windows.Automation.AutomationElement]::FromHandle($p.MainWindowHandle)
  $tabs = Find-Items $candidate ([System.Windows.Automation.ControlType]::TabItem)
  $c = @($tabs | Where-Object {$_.Current.Name -like 'Painel unificado CentralDark - Claude*'}) | Select-Object -First 1
  $g = @($tabs | Where-Object {$_.Current.Name -like 'Automação e delegação*' -or $_.Current.Name -like 'Automa*e delega*'}) | Select-Object -First 1
  if ($c -and $g) { $browser = $candidate; $claudeTab = $c; $chatTab = $g; break }
}
if (-not $browser) { throw 'EDGE_TABS_NOT_FOUND_OR_WRONG_SESSION' }
$original = @(Find-Items $browser ([System.Windows.Automation.ControlType]::TabItem) |
  Where-Object {($_.GetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern)).Current.IsSelected}) |
  Select-Object -First 1
$editorPattern = $null
$editorElement = $null
$durationList = [System.Collections.Generic.List[double]]::new()
$fixedPoint = $false
try {
  for ($round = 1; $round -le $MaxRounds; $round++) {
    $roundSw = [System.Diagnostics.Stopwatch]::StartNew()
    Choose-Tab $chatTab 'claude_to_chatgpt' $round
    Choose-Tab $claudeTab 'chatgpt_to_claude' $round
    $validCachedEditor = $false
    if ($editorElement) {
      try { $validCachedEditor = ($editorElement.Current.Name -like 'Escreva as instru*para o Claude*') } catch {}
    }
    if (-not $validCachedEditor) {
      $editors = Find-Items $browser ([System.Windows.Automation.ControlType]::Edit)
      $editorElement = @($editors | Where-Object {$_.Current.Name -like 'Escreva as instru*para o Claude*'}) | Select-Object -First 1
      if (-not $editorElement) { throw 'CLAUDE_EDITOR_NOT_FOUND' }
      $editorPattern = $editorElement.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
    }
    $editor = $editorElement
    if ($editorPattern.Current.Value.Trim().Length -ne 0) { throw 'NONEMPTY_DRAFT_STOP_NO_OVERWRITE' }
    $w = [System.Diagnostics.Stopwatch]::StartNew()
    $editor.SetFocus()
    for ($tries = 0; $tries -lt 20 -and -not $editor.Current.HasKeyboardFocus; $tries++) {
      Start-Sleep -Milliseconds 25
    }
    $w.Stop()
    $focusOk = [bool]$editor.Current.HasKeyboardFocus
    Record-Action 'focus' $w.Elapsed.TotalMilliseconds $focusOk 'claude_composer' $round
    if (-not $focusOk) { throw 'FOCUS_READBACK_FAILED' }
    $w.Restart()
    $editorPattern.SetValue('oi')
    for ($tries = 0; $tries -lt 20 -and $editorPattern.Current.Value.Trim() -cne 'oi'; $tries++) {
      Start-Sleep -Milliseconds 25
    }
    $w.Stop()
    $typeOk = ($editorPattern.Current.Value.Trim() -ceq 'oi')
    Record-Action 'type' $w.Elapsed.TotalMilliseconds $typeOk 'dry_run_no_send' $round
    if (-not $typeOk) { throw 'TYPE_READBACK_FAILED' }
    $w.Restart()
    $editorPattern.SetValue('')
    for ($tries = 0; $tries -lt 20 -and $editorPattern.Current.Value.Trim().Length -ne 0; $tries++) {
      Start-Sleep -Milliseconds 25
    }
    $w.Stop()
    $clearOk = ($editorPattern.Current.Value.Trim().Length -eq 0)
    Record-Action 'clear' $w.Elapsed.TotalMilliseconds $clearOk 'dry_run_no_send' $round
    if (-not $clearOk) { throw 'CLEAR_READBACK_FAILED' }
    Choose-Tab $chatTab 'claude_to_chatgpt' $round
    $roundSw.Stop()
    Record-Action 'round_trip' $roundSw.Elapsed.TotalMilliseconds $true 'chatgpt_claude_chatgpt' $round
    $durationList.Add($roundSw.Elapsed.TotalMilliseconds)
    if ($round -ge $MinRounds) {
      $last = @($durationList | Select-Object -Last 3)
      $mean = ($last | Measure-Object -Average).Average
      $spread = (($last | Measure-Object -Maximum).Maximum - ($last | Measure-Object -Minimum).Minimum)
      if ($mean -gt 0 -and $spread / $mean -le $Tolerance) { $fixedPoint = $true; break }
    }
  }
} finally {
  if ($editorPattern) {
    Start-Sleep -Milliseconds 120
    if ($editorPattern.Current.Value.Trim() -ceq 'oi') {
      $editorPattern.SetValue('')
      Start-Sleep -Milliseconds 150
    }
  }
  if ($original) {
    try {$original.GetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern).Select()} catch {}
  }
}
$measure = $durationList | Measure-Object -Average -Minimum -Maximum
[pscustomobject]@{
  schema = $schema; run_id = $runId; cycles = $durationList.Count
  fixed_point = $fixedPoint; mean_round_trip_ms = [Math]::Round($measure.Average,2)
  min_round_trip_ms = [Math]::Round($measure.Minimum,2)
  max_round_trip_ms = [Math]::Round($measure.Maximum,2)
  input_sent = $false; physical_mouse_clicks_measured = $false
  log = $logPath
} | ConvertTo-Json -Compress

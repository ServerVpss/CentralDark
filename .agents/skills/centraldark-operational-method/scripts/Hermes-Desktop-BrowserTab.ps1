#requires -Version 5.1
<#
  CentralDark Skill-Mother | Hermes Desktop's existing browser tabs.
  Power Automate Desktop source: UIAutomation.Click.Click on
  appmask['Window \'Hermes\'']['Edit \'Address\''].
  We reuse the UIA "Address" selector and the Hermes "New tab" InvokePattern;
  never Ctrl+T, never screen coordinates, never "New session tab".
  Inspect makes NO UI changes. OpenNewTab requires an explicit source + target URL.
#>
[CmdletBinding()]
param(
  [ValidateSet('Inspect', 'OpenNewTab')][string]$Mode = 'Inspect',
  [string]$FromUrl,
  [string]$ToUrl
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class CDHermesForeground {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr handle);
}
'@

function Find-Controls($root, $type) {
  $condition = New-Object System.Windows.Automation.PropertyCondition(
    [System.Windows.Automation.AutomationElement]::ControlTypeProperty, $type)
  return $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $condition)
}
function Try-Pattern($element, $pattern) {
  $found = $null
  if ($element.TryGetCurrentPattern($pattern, [ref]$found)) { return $found }
  return $null
}
function Read-Address($edit) {
  $value = Try-Pattern $edit ([System.Windows.Automation.ValuePattern]::Pattern)
  if (-not $value) { throw 'HERMES_ADDRESS_VALUE_PATTERN_MISSING' }
  return [string]$value.Current.Value
}
function Read-Panes($window) {
  $addresses = @(Find-Controls $window ([System.Windows.Automation.ControlType]::Edit) |
    Where-Object { $_.Current.Name -eq 'Address' })
  $newTabButtons = @(Find-Controls $window ([System.Windows.Automation.ControlType]::Button) |
    Where-Object { $_.Current.Name -eq 'New tab' })
  $walker = [System.Windows.Automation.TreeWalker]::ControlViewWalker
  $panes = @()
  foreach ($address in $addresses) {
    $bounds = $address.Current.BoundingRectangle
    $matches = @()
    foreach ($button in $newTabButtons) {
      $bar = $walker.GetParent($button)
      if (-not $bar -or $bar.Current.ControlType -ne [System.Windows.Automation.ControlType]::Tab) {
        continue
      }
      $barBounds = $bar.Current.BoundingRectangle
      # Bounds are used ONLY to associate controls in the same Hermes browser pane,
      # never for coordinate-based clicking. Fail closed if association is ambiguous.
      if ($bounds.X -ge $barBounds.X -and $bounds.X -le $barBounds.Right) {
        $matches += [pscustomobject]@{ Button=$button; Bar=$bar }
      }
    }
    if ($matches.Count -ne 1) { throw ('ADDRESS_NEW_TAB_PAIR_AMBIGUOUS_' + $matches.Count) }
    $newTab = $matches[0]
    $invoke = Try-Pattern $newTab.Button ([System.Windows.Automation.InvokePattern]::Pattern)
    if (-not $invoke) { throw 'HERMES_NEW_TAB_INVOKE_UNAVAILABLE' }
    $tabs = @(Find-Controls $newTab.Bar ([System.Windows.Automation.ControlType]::TabItem))
    $panes += [pscustomobject]@{
      Address=$address
      AddressValue=(Read-Address $address)
      Bar=$newTab.Bar
      NewTabButton=$newTab.Button
      Invoke=$invoke
      TabLabels=@($tabs | ForEach-Object { $_.Current.Name })
      TabCount=$tabs.Count
      BarX=[double]$newTab.Bar.Current.BoundingRectangle.X
    }
  }
  return $panes
}
function Match-Url([string]$observed, [string]$expected) {
  $u1=$null; $u2=$null
  if (-not [Uri]::TryCreate($observed, [UriKind]::Absolute, [ref]$u1) -or
      -not [Uri]::TryCreate($expected, [UriKind]::Absolute, [ref]$u2)) { return $false }
  return $u1.AbsoluteUri.TrimEnd('/') -ceq $u2.AbsoluteUri.TrimEnd('/')
}
function Escape-Keys([string]$inputText) {
  $buffer=New-Object System.Text.StringBuilder
  foreach ($c in $inputText.ToCharArray()) {
    $token=switch ([string]$c) {
      '+' {'{+}'; break}
      '^' {'{^}'; break}
      '%' {'{%}'; break}
      '~' {'{~}'; break}
      '(' {'{(}'; break}
      ')' {'{)}'; break}
      '{' {'{{}'; break}
      '}' {'{}}'; break}
      default {[string]$c}
    }
    [void]$buffer.Append($token)
  }
  return $buffer.ToString()
}
function Read-Document-Url($window, [string]$wanted) {
  foreach ($doc in (Find-Controls $window ([System.Windows.Automation.ControlType]::Document))) {
    $pattern = Try-Pattern $doc ([System.Windows.Automation.ValuePattern]::Pattern)
    if ($pattern -and (Match-Url ([string]$pattern.Current.Value) $wanted)) {
      return $true
    }
  }
  return $false
}
function Emit([string]$status,[string]$detail,[int]$before=0,[int]$after=0) {
  [pscustomobject]@{
    schema='centraldark.hermes-browser-tab.uia.v1'
    status=$status
    detail=$detail
    action=$Mode
    browser='ORIGINAL_HERMES_DESKTOP'
    tabs_before=$before
    tabs_after=$after
    no_ctrl_t=$true
    no_coordinates_clicked=$true
    next_cursor='HERMES_EXISTING_BROWSER_TABS'
  } | ConvertTo-Json -Compress
}
try {
  $processes = @(Get-Process Hermes -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero })
  if ($processes.Count -ne 1) { throw ('EXPECTED_ONE_HERMES_WINDOW_FOUND_' + $processes.Count) }
  $process=$processes[0]
  $window=[System.Windows.Automation.AutomationElement]::FromHandle(
    [IntPtr]$process.MainWindowHandle)
  if ($window.Current.Name -ne 'Hermes') { throw 'WINDOW_IS_NOT_HERMES' }
  $panes=@(Read-Panes $window)
  if ($panes.Count -eq 0) { throw 'HERMES_BROWSER_ADDRESS_NOT_FOUND' }
  $matches=$panes
  if ($FromUrl) {
    $matches=@($panes | Where-Object { Match-Url $_.AddressValue $FromUrl })
    if ($matches.Count -ne 1) { throw ('SOURCE_URL_MATCH_COUNT_' + $matches.Count) }
  }
  if ($Mode -eq 'Inspect') {
    Emit 'UIA_CONTROLS_FOUND_NO_ACTION' (
      'Hermes.exe; PANES=' + $panes.Count +
      '; MATCHED_PANES=' + $matches.Count +
      '; ADDRESS_VALUE_PATTERN=true; NEW_TAB_INVOKE_PATTERN=true')
    return
  }
  if (-not $FromUrl) { throw 'FROM_URL_REQUIRED_TO_SELECT_ONE_BROWSER_PANE' }
  if (-not $ToUrl) { throw 'TO_URL_REQUIRED' }
  $toUri=$null
  if (-not [Uri]::TryCreate($ToUrl,[UriKind]::Absolute,[ref]$toUri) -or
      $toUri.Scheme -notin @('http','https') -or
      -not $toUri.Host -or $toUri.UserInfo) {
    throw 'TARGET_URL_MUST_BE_HTTP_OR_HTTPS'
  }
  if ($ToUrl.Length -gt 1800) { throw 'TARGET_URL_TOO_LONG' }

  $selected=$matches[0]
  $before=@($selected.TabLabels)
  $beforeCount=[int]$selected.TabCount
  [void][CDHermesForeground]::SetForegroundWindow([IntPtr]$process.MainWindowHandle)
  Start-Sleep -Milliseconds 150
  if ([CDHermesForeground]::GetForegroundWindow() -ne [IntPtr]$process.MainWindowHandle) {
    throw 'HERMES_NOT_FOREGROUND_NO_ACTION'
  }
  # UIA InvokePattern on the native "New tab" element, NOT a Ctrl+T shortcut.
  $selected.Invoke.Invoke()
  Start-Sleep -Milliseconds 270
  $afterPanes=@(Read-Panes $window)
  $same=@($afterPanes | Where-Object { [Math]::Abs($_.BarX - $selected.BarX) -le 2 })
  if ($same.Count -ne 1) { throw 'AFTER_NEW_TAB_PANE_NOT_UNIQUE' }
  $current=$same[0]
  if ($current.TabCount -ne ($beforeCount + 1)) {
    throw ('NEW_TAB_COUNT_NOT_INCREASED_' + $beforeCount + '_TO_' + $current.TabCount)
  }
  foreach ($name in $before) {
    if ($current.TabLabels -notcontains $name) { throw 'EXISTING_TAB_NOT_PRESERVED' }
  }
  if (Match-Url $current.AddressValue $FromUrl) {
    throw 'NEW_TAB_NOT_ACTIVE_NAVIGATION_ABORTED'
  }
  $address=$current.Address
  $address.SetFocus()
  Start-Sleep -Milliseconds 100
  $focused=[System.Windows.Automation.AutomationElement]::FocusedElement
  if ($focused.Current.Name -ne 'Address' -or
      $focused.Current.ControlType -ne [System.Windows.Automation.ControlType]::Edit -or
      [CDHermesForeground]::GetForegroundWindow() -ne [IntPtr]$process.MainWindowHandle) {
    throw 'ADDRESS_FOCUS_NOT_PROVEN_NO_URL_TYPED'
  }
  [System.Windows.Forms.SendKeys]::SendWait('^a')
  [System.Windows.Forms.SendKeys]::SendWait((Escape-Keys $ToUrl))
  Start-Sleep -Milliseconds 150
  if (-not (Match-Url (Read-Address $address) $ToUrl)) {
    throw 'ADDRESS_INPUT_READBACK_MISMATCH_NO_ENTER'
  }
  [System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
  $documentOk=$false
  for ($attempt=0;$attempt -lt 12;$attempt++) {
    Start-Sleep -Milliseconds 220
    if (Read-Document-Url $window $ToUrl) { $documentOk=$true; break }
  }
  $afterFinal=@(Read-Panes $window | Where-Object { [Math]::Abs($_.BarX - $selected.BarX) -le 2 })
  if ($afterFinal.Count -ne 1 -or $afterFinal[0].TabCount -lt $beforeCount+1) {
    throw 'AFTER_NAVIGATION_TAB_PRESERVATION_UNKNOWN'
  }
  if ($documentOk) {
    Emit 'NEW_TAB_NAVIGATION_PROVEN' 'EXISTING_TABS_PRESERVED; TARGET_DOCUMENT_URL_READBACK' $beforeCount $afterFinal[0].TabCount
  } else {
    Emit 'TAB_CREATED_ADDRESS_ENTERED_LOAD_NOT_PROVEN' 'ADDRESS_TYPED_AND_ENTER; DOCUMENT_URL_NOT_CONFIRMED' $beforeCount $afterFinal[0].TabCount
  }
} catch {
  Emit 'BLOCKED_OR_PARTIAL' ([string]$_.Exception.Message)
  exit 2
}

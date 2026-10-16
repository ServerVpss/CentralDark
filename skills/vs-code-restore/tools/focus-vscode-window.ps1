param(
  [ValidateSet("Inventory","FocusTerminal","SendText")]
  [string]$Mode = "Inventory",
  [long]$WindowHandle = 0,
  [string]$TerminalName = "",
  [string]$Text = "",
  [switch]$AllowMutation,
  [switch]$AllowSendKeysEscapes
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class CentralDarkUser32 {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
}
"@

function Get-Sha256([string]$Value) {
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
    return ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace("-","").ToLowerInvariant()
  } finally {
    $sha.Dispose()
  }
}

function Get-CodeWindowRecords {
  $rows = @()
  foreach ($process in Get-Process -Name Code -ErrorAction SilentlyContinue) {
    if ($process.MainWindowHandle -eq 0) { continue }
    try {
      $root = [System.Windows.Automation.AutomationElement]::FromHandle([IntPtr]$process.MainWindowHandle)
      $all = $root.FindAll(
        [System.Windows.Automation.TreeScope]::Descendants,
        [System.Windows.Automation.Condition]::TrueCondition
      )
      $terminals = @()
      foreach ($el in $all) {
        try {
          if ($el.Current.ClassName -eq "xterm-helper-textarea" -and $el.Current.Name -match "^Terminal\s+") {
            $terminals += [pscustomobject]@{
              name = $el.Current.Name
              enabled = $el.Current.IsEnabled
              offscreen = $el.Current.IsOffscreen
              element = $el
            }
          }
        } catch {}
      }
      $rows += [pscustomobject]@{
        pid = $process.Id
        handle = [long]$process.MainWindowHandle
        title = $process.MainWindowTitle
        foreground = ([CentralDarkUser32]::GetForegroundWindow() -eq [IntPtr]$process.MainWindowHandle)
        terminals = $terminals
        root = $root
      }
    } catch {}
  }
  return $rows
}

function Select-TargetWindow($rows) {
  if ($WindowHandle -ne 0) {
    $match = $rows | Where-Object { $_.handle -eq $WindowHandle } | Select-Object -First 1
    if (-not $match) { throw "WINDOW_HANDLE_NOT_FOUND" }
    return $match
  }
  $withTerminal = @($rows | Where-Object { $_.terminals.Count -gt 0 })
  $foreground = $withTerminal | Where-Object { $_.foreground } | Select-Object -First 1
  if ($foreground) { return $foreground }
  $first = $withTerminal | Select-Object -First 1
  if (-not $first) { throw "NO_VSCODE_TERMINAL_FOUND" }
  return $first
}

function Select-TargetTerminal($window) {
  if ($TerminalName) {
    $match = $window.terminals | Where-Object { $_.name -eq $TerminalName } | Select-Object -First 1
    if (-not $match) { throw "TERMINAL_NAME_NOT_FOUND" }
    return $match
  }
  $visible = $window.terminals | Where-Object { -not $_.offscreen -and $_.enabled } | Select-Object -First 1
  if ($visible) { return $visible }
  $first = $window.terminals | Select-Object -First 1
  if (-not $first) { throw "NO_TERMINAL_IN_WINDOW" }
  return $first
}

function Focus-And-Prove($window, $terminal) {
  [void][CentralDarkUser32]::SetForegroundWindow([IntPtr]$window.handle)
  Start-Sleep -Milliseconds 120
  $terminal.element.SetFocus()
  Start-Sleep -Milliseconds 120
  $focused = [System.Windows.Automation.AutomationElement]::FocusedElement
  if (-not $focused) { throw "FOCUS_READBACK_EMPTY" }
  $class = $focused.Current.ClassName
  $name = $focused.Current.Name
  if ($class -ne "xterm-helper-textarea" -or $name -notmatch "^Terminal\s+") {
    throw ("FOCUS_READBACK_MISMATCH class=" + $class + " name=" + $name)
  }
  return [pscustomobject]@{ class = $class; name = $name }
}

$windows = @(Get-CodeWindowRecords)

if ($Mode -eq "Inventory") {
  [pscustomobject]@{
    schema = "centraldark.vscode-terminal-inventory.v1"
    status = "OBSERVED"
    count = $windows.Count
    foreground_handle = [long][CentralDarkUser32]::GetForegroundWindow()
    windows = @($windows | ForEach-Object {
      [pscustomobject]@{
        pid = $_.pid
        handle = $_.handle
        title = $_.title
        foreground = $_.foreground
        terminals = @($_.terminals | ForEach-Object {
          [pscustomobject]@{ name=$_.name; enabled=$_.enabled; offscreen=$_.offscreen }
        })
      }
    })
  } | ConvertTo-Json -Depth 8
  exit 0
}

$targetWindow = Select-TargetWindow $windows
$targetTerminal = Select-TargetTerminal $targetWindow
$focus = Focus-And-Prove $targetWindow $targetTerminal

if ($Mode -eq "FocusTerminal") {
  [pscustomobject]@{
    schema = "centraldark.vscode-terminal-focus.v1"
    status = "FOCUS_PROVEN"
    pid = $targetWindow.pid
    handle = $targetWindow.handle
    terminal = $focus.name
    class = $focus.class
  } | ConvertTo-Json -Depth 5
  exit 0
}

if ([string]::IsNullOrWhiteSpace($Text)) { throw "TEXT_REQUIRED" }
if ($Text.Contains([char]13) -or $Text.Contains([char]10)) { throw "MULTILINE_TEXT_FORBIDDEN" }
if ($Text.Length -gt 512) { throw "TEXT_TOO_LONG" }

$mutationPattern = "(?i)(^|\s)(git\s+(add|commit|push|pull|merge|rebase|reset|clean)|rm\b|del\b|remove-item\b|shutdown\b|restart-computer\b|stop-process\b|kill\b|taskkill\b)"
if ($Text -match $mutationPattern -and -not $AllowMutation) {
  throw "MUTATION_FLAG_REQUIRED"
}

if (-not $AllowSendKeysEscapes -and $Text -match '[+^%~(){}\[\]]') {
  throw "SENDKEYS_SPECIAL_CHARACTER_REQUIRES_EXPLICIT_ESCAPE_MODE"
}

$ws = New-Object -ComObject WScript.Shell
$ws.SendKeys($Text)
$ws.SendKeys("{ENTER}")
Start-Sleep -Milliseconds 120

$post = [System.Windows.Automation.AutomationElement]::FocusedElement
$postClass = if ($post) { $post.Current.ClassName } else { "UNKNOWN" }
$postName = if ($post) { $post.Current.Name } else { "UNKNOWN" }

[pscustomobject]@{
  schema = "centraldark.vscode-terminal-send.v1"
  status = "SEND_OK_NOT_EXECUTION_PROOF"
  pid = $targetWindow.pid
  handle = $targetWindow.handle
  terminal_before = $focus.name
  focused_class_after = $postClass
  focused_name_after = $postName
  text_sha256 = Get-Sha256 $Text
  text_length = $Text.Length
  mutation_flag = [bool]$AllowMutation
  readback_required = $true
} | ConvertTo-Json -Depth 5

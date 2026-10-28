#requires -Version 5.1
<#
  CentralDark | Hermes -> CHAT_GLOBAL / Oracle
  Existing-surface adapter, NOT a second executor or background service.
  Inspect is read-only. Draft never sends. Send requires a terminal Hermes envelope.
  The target conversation URL is provided at runtime, never stored in the skill.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$ConversationUrl,
  [ValidateSet('Inspect', 'Draft', 'Send')][string]$Mode = 'Inspect',
  [string]$PayloadPath,
  [string]$TabTitle,
  [switch]$ActivateExistingTab
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Windows.Forms

function Get-Pattern($element, $pattern) {
  $found = $null
  if ($element.TryGetCurrentPattern($pattern, [ref]$found)) { return $found }
  return $null
}
function Find-Type($root, $type) {
  $condition = New-Object System.Windows.Automation.PropertyCondition(
    [System.Windows.Automation.AutomationElement]::ControlTypeProperty, $type)
  return $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $condition)
}
function Get-BrowserAddress($root) {
  foreach ($item in (Find-Type $root ([System.Windows.Automation.ControlType]::Edit))) {
    if ($item.Current.Name -notmatch 'Barra de pesquisa|endere.os|address bar|search and address') { continue }
    $value = Get-Pattern $item ([System.Windows.Automation.ValuePattern]::Pattern)
    if ($value) { return $value.Current.Value }
  }
  return $null
}
function Match-Conversation([string]$observed, [string]$expected) {
  $uri = $null
  if (-not [Uri]::TryCreate($observed, [UriKind]::Absolute, [ref]$uri)) { return $false }
  return $uri.Scheme -eq 'https' -and $uri.Host -eq 'chatgpt.com' -and
    $uri.AbsolutePath.TrimEnd('/') -ceq $expected
}
function Editor-Empty([string]$text) {
  $trimmed = $text.Trim()
  return $trimmed -eq '' -or $trimmed -in @('Pergunte ao ChatGPT', 'Ask anything', 'Ask ChatGPT')
}
function Escape-SendKeys([string]$plain) {
  $buffer = New-Object System.Text.StringBuilder
  foreach ($character in $plain.ToCharArray()) {
    $token = switch ([string]$character) {
      '+' { '{+}'; break }
      '^' { '{^}'; break }
      '%' { '{%}'; break }
      '~' { '{~}'; break }
      '(' { '{(}'; break }
      ')' { '{)}'; break }
      '{' { '{{}'; break }
      '}' { '{}}'; break }
      default { [string]$character }
    }
    [void]$buffer.Append($token)
  }
  return $buffer.ToString()
}
function Has-ReceiptVisible($root, [string]$marker) {
  foreach ($item in (Find-Type $root ([System.Windows.Automation.ControlType]::Text))) {
    if ($item.Current.Name.Contains($marker)) { return $true }
  }
  return $false
}
function Result([string]$status, [string]$detail, [string]$receipt = '') {
  [pscustomobject]@{
    schema = 'centraldark.hermes-oracle-return.v1'
    status = $status
    detail = $detail
    receipt_id = $receipt
    target = 'CHAT_GLOBAL_CURRENT_CONVERSATION'
    mode = $Mode
    at = [DateTimeOffset]::UtcNow.ToString('o')
  } | ConvertTo-Json -Compress
}

try {
  $expectedUri = $null
  if (-not [Uri]::TryCreate($ConversationUrl, [UriKind]::Absolute, [ref]$expectedUri) -or
      $expectedUri.Scheme -ne 'https' -or $expectedUri.Host -ne 'chatgpt.com' -or
      $expectedUri.AbsolutePath -notmatch '^/c/[0-9a-fA-F-]{20,80}/?$' -or
      $expectedUri.Query -or $expectedUri.Fragment) {
    throw 'TARGET_MUST_BE_EXACT_CHATGPT_CONVERSATION_URL'
  }
  $expectedPath = $expectedUri.AbsolutePath.TrimEnd('/')

  $envelope = $null
  $draft = $null
  $receiptId = ''
  if ($Mode -ne 'Inspect') {
    if (-not $PayloadPath -or -not [IO.Path]::IsPathRooted($PayloadPath) -or
        -not (Test-Path -LiteralPath $PayloadPath -PathType Leaf)) {
      throw 'HERMES_ENVELOPE_FILE_REQUIRED'
    }
    $file = Get-Item -LiteralPath $PayloadPath
    if ($file.Length -gt 20000) { throw 'ENVELOPE_TOO_LARGE' }
    $envelope = Get-Content -LiteralPath $PayloadPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $required = @('actor','loop_id','turn_id','receipt_id','parent_id','intent_id',
      'event_id','causation_id','surface_id','attempt_id','next_cursor','status','message')
    foreach ($key in $required) {
      $property = $envelope.PSObject.Properties[$key]
      if (-not $property -or [string]::IsNullOrWhiteSpace([string]$property.Value)) {
        throw ('HERMES_ENVELOPE_MISSING_' + $key.ToUpperInvariant())
      }
    }
    if ($envelope.actor -cne 'HERMES') { throw 'SOURCE_NOT_ORIGINAL_HERMES' }
    $terminal = @('DONE','COMPLETED','FAILED','BLOCKED')
    if ($terminal -cnotcontains ([string]$envelope.status).ToUpperInvariant()) {
      throw 'HERMES_EVENT_NOT_TERMINAL'
    }
    $receiptId = [string]$envelope.receipt_id
    if ($receiptId.Length -gt 160 -or $receiptId -notmatch '^[a-zA-Z0-9_.:-]+$') {
      throw 'INVALID_RECEIPT_ID'
    }
    $msg = ([string]$envelope.message -replace '\s+', ' ').Trim()
    if ($msg.Length -gt 2400) { throw 'MESSAGE_TOO_LONG_REQUEST_HERMES_SUMMARY' }
    if ($msg -match '(?i)(github_pat_|gho_[A-Za-z0-9_]{12,}|sk-[A-Za-z0-9_-]{20,}|bearer\s+[A-Za-z0-9._-]{20,}|password\s*[=:]|senha\s*[=:])') {
      throw 'POSSIBLE_SECRET_IN_MESSAGE'
    }
    $draft = 'HERMES -> ORACULO | ACTOR=HERMES | LOOP_ID=' + $envelope.loop_id +
      ' | TURN_ID=' + $envelope.turn_id + ' | RECEIPT_ID=' + $receiptId +
      ' | INTENT_ID=' + $envelope.intent_id + ' | STATUS=' + $envelope.status +
      ' | NEXT_CURSOR=' + $envelope.next_cursor +
      ' | RESULTADO_CANDIDATO=' + $msg
    if ($draft.Length -gt 3600) { throw 'ENVELOPE_TOO_LONG' }
  }

  $matchedRoot = $null
  $matchingPid = 0
  $switchedTab = $false
  $browsers = @(Get-Process msedge, chrome -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowHandle -ne 0 })
  foreach ($process in $browsers) {
    $root = [System.Windows.Automation.AutomationElement]::FromHandle([IntPtr]$process.MainWindowHandle)
    $address = Get-BrowserAddress $root
    if (Match-Conversation $address $expectedPath) {
      if ($matchedRoot) { throw 'MULTIPLE_MATCHING_BROWSER_WINDOWS' }
      $matchedRoot = $root
      $matchingPid = $process.Id
    }
  }
  if (-not $matchedRoot -and $ActivateExistingTab -and $TabTitle) {
    foreach ($process in $browsers) {
      $root = [System.Windows.Automation.AutomationElement]::FromHandle([IntPtr]$process.MainWindowHandle)
      $tabs = @(Find-Type $root ([System.Windows.Automation.ControlType]::TabItem) |
        Where-Object { $_.Current.Name.StartsWith($TabTitle, [StringComparison]::OrdinalIgnoreCase) })
      if ($tabs.Count -ne 1) { continue }
      $selection = Get-Pattern $tabs[0] ([System.Windows.Automation.SelectionItemPattern]::Pattern)
      if (-not $selection) { continue }
      $selection.Select()
      Start-Sleep -Milliseconds 300
      if (Match-Conversation (Get-BrowserAddress $root) $expectedPath) {
        if ($matchedRoot) { throw 'MULTIPLE_MATCHING_BROWSER_WINDOWS' }
        $matchedRoot = $root
        $matchingPid = $process.Id
        $switchedTab = $true
      }
    }
  }
  if (-not $matchedRoot) { throw 'EXACT_CHATGPT_CONVERSATION_NOT_ACTIVE' }
  $editors = @(Find-Type $matchedRoot ([System.Windows.Automation.ControlType]::Edit) |
    Where-Object { $_.Current.Name -in @('Pergunte ao ChatGPT','Ask anything','Ask ChatGPT') })
  if ($editors.Count -ne 1) { throw ('CHATGPT_COMPOSER_COUNT_' + $editors.Count) }
  $editor = $editors[0]
  $valuePattern = Get-Pattern $editor ([System.Windows.Automation.ValuePattern]::Pattern)
  if (-not $valuePattern -or $valuePattern.Current.IsReadOnly -or $editor.Current.IsOffscreen) {
    throw 'CHATGPT_COMPOSER_NOT_EDITABLE'
  }
  $clean = Editor-Empty ([string]$valuePattern.Current.Value)
  $busy = @(Find-Type $matchedRoot ([System.Windows.Automation.ControlType]::Button) |
    Where-Object { $_.Current.Name -in @('Parar','Stop generating','Stop') -and $_.Current.IsEnabled }).Count -gt 0
  if ($Mode -eq 'Inspect') {
    Result 'SURFACE_PROVEN_READONLY' ('EXACT_URL_MATCH; COMPOSER_FOUND; EMPTY=' + $clean +
      '; CHAT_BUSY=' + $busy + '; BROWSER_PID=' + $matchingPid +
      '; SWITCHED_EXISTING_TAB=' + $switchedTab + '; NO_INPUT_NO_SEND')
    return
  }
  if ($busy) { throw 'CHATGPT_GENERATION_IN_PROGRESS' }
  if (-not $clean) { throw 'EXISTING_USER_DRAFT_PRESERVED' }
  if (Has-ReceiptVisible $matchedRoot ('RECEIPT_ID=' + $receiptId)) {
    Result 'SKIPPED_DUPLICATE_VISIBLE' 'Same receipt already appears in target chat' $receiptId
    return
  }

  $editor.SetFocus()
  Start-Sleep -Milliseconds 120
  $focused = [System.Windows.Automation.AutomationElement]::FocusedElement
  if ($focused.Current.ControlType -ne [System.Windows.Automation.ControlType]::Edit -or
      $focused.Current.Name -ne $editor.Current.Name -or
      -not (Match-Conversation (Get-BrowserAddress $matchedRoot) $expectedPath)) {
    throw 'FOCUS_OR_TARGET_CHANGED_BEFORE_TYPING'
  }
  [System.Windows.Forms.SendKeys]::SendWait((Escape-SendKeys $draft))
  Start-Sleep -Milliseconds 280
  $written = [string]$valuePattern.Current.Value
  if ($written -cne $draft) {
    throw 'DRAFT_READBACK_MISMATCH_NOT_SENT'
  }
  if ($Mode -eq 'Draft') {
    Result 'DRAFT_PROVEN_NO_SEND' ('EXACT_URL; EDITOR_READBACK; LENGTH=' + $written.Length) $receiptId
    return
  }
  if (-not (Match-Conversation (Get-BrowserAddress $matchedRoot) $expectedPath)) {
    throw 'TARGET_CHANGED_ABORT_SEND'
  }
  [System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
  Start-Sleep -Milliseconds 550
  $delivered = $false
  for ($attempt=0; $attempt -lt 6; $attempt++) {
    if (Has-ReceiptVisible $matchedRoot ('RECEIPT_ID=' + $receiptId)) {
      $delivered = $true
      break
    }
    Start-Sleep -Milliseconds 350
  }
  if ($delivered) {
    Result 'SENT_WITH_UI_READBACK' 'EXACT_TARGET; RECEIPT_VISIBLE; HUMAN_GOAL_STATUS_UNCHANGED' $receiptId
  } else {
    Result 'SEND_UNCONFIRMED_DO_NOT_RETRY_BLINDLY' 'Enter issued; receipt was not visible in readback' $receiptId
  }
} catch {
  Result 'BLOCKED' ([string]$_.Exception.Message) $receiptId
  exit 2
}

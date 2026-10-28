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
  [switch]$ActivateExistingTab,
  [ValidateSet('Auto', 'HermesEmbedded', 'ExternalBrowser')][string]$TargetSurface = 'Auto'
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes

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
function Find-HermesEmbeddedTarget([string]$expectedPath) {
  $processes = @(Get-Process Hermes -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero })
  if ($processes.Count -eq 0) { return $null }
  if ($processes.Count -ne 1) { throw 'MULTIPLE_HERMES_DESKTOP_WINDOWS' }
  $process = $processes[0]
  $window = [System.Windows.Automation.AutomationElement]::FromHandle(
    [IntPtr]$process.MainWindowHandle)
  if ($window.Current.Name -ne 'Hermes') { throw 'HERMES_WINDOW_IDENTITY_MISMATCH' }
  $walker = [System.Windows.Automation.TreeWalker]::ControlViewWalker
  $addresses = @(Find-Type $window ([System.Windows.Automation.ControlType]::Edit) |
    Where-Object { $_.Current.Name -eq 'Address' -and -not $_.Current.IsOffscreen })
  $matches = @()
  foreach ($doc in (Find-Type $window ([System.Windows.Automation.ControlType]::Document))) {
    if ($doc.Current.Name -eq 'Hermes' -or $doc.Current.IsOffscreen) { continue }
    $url = Get-Pattern $doc ([System.Windows.Automation.ValuePattern]::Pattern)
    if (-not $url -or -not (Match-Conversation ([string]$url.Current.Value) $expectedPath)) {
      continue
    }
    $docParent = $walker.GetParent($doc)
    if (-not $docParent) { continue }
    $area = $docParent.Current.BoundingRectangle
    foreach ($address in $addresses) {
      $value = Get-Pattern $address ([System.Windows.Automation.ValuePattern]::Pattern)
      if (-not $value -or -not (Match-Conversation ([string]$value.Current.Value) $expectedPath)) {
        continue
      }
      $addressParent = $walker.GetParent($address)
      if (-not $addressParent) { continue }
      $addressArea = $addressParent.Current.BoundingRectangle
      if ([Math]::Abs($area.X - $addressArea.X) -gt 2 -or
          [Math]::Abs($area.Width - $addressArea.Width) -gt 2) { continue }
      $matches += [pscustomobject]@{
        Root = $doc
        Window = $window
        ProcessId = $process.Id
        Address = $address
      }
    }
  }
  if ($matches.Count -gt 1) { throw 'MULTIPLE_MATCHING_HERMES_CHATGPT_PANES' }
  if ($matches.Count -eq 0) { return $null }
  return $matches[0]
}
function Target-Still-Matches($root, [string]$expectedPath) {
  if ($script:resolvedSurface -eq 'HermesEmbedded') {
    $value = Get-Pattern $root ([System.Windows.Automation.ValuePattern]::Pattern)
    if (-not $value) { return $false }
    return (Match-Conversation ([string]$value.Current.Value) $expectedPath)
  }
  return (Match-Conversation (Get-BrowserAddress $root) $expectedPath)
}
function Editor-Empty([string]$text) {
  $trimmed = $text.Trim()
  return $trimmed -eq '' -or $trimmed -in @('Pergunte ao ChatGPT', 'Ask anything', 'Ask ChatGPT')
}
function Has-ReceiptVisible($root, [string]$marker) {
  # ChatGPT may expose the submitted message as Text or as a message Button.
  # The compositor is excluded by the explicit Text/Button type filters.
  foreach ($type in @([System.Windows.Automation.ControlType]::Text,
                      [System.Windows.Automation.ControlType]::Button)) {
    foreach ($item in (Find-Type $root $type)) {
      if ($item.Current.Name.Contains($marker)) { return $true }
    }
  }
  return $false
}
function Find-SendInvoke($root) {
  $actions = @(Find-Type $root ([System.Windows.Automation.ControlType]::Button) |
    Where-Object { $_.Current.Name -in @('Enviar','Send','Send message','Enviar mensagem') -and
                   $_.Current.IsEnabled -and -not $_.Current.IsOffscreen })
  if ($actions.Count -ne 1) { throw ('SEND_BUTTON_COUNT_' + $actions.Count) }
  $invoke = Get-Pattern $actions[0] ([System.Windows.Automation.InvokePattern]::Pattern)
  if (-not $invoke) { throw 'SEND_BUTTON_INVOKE_PATTERN_MISSING' }
  return $invoke
}
function Result([string]$status, [string]$detail, [string]$receipt = '') {
  [pscustomobject]@{
    schema = 'centraldark.hermes-oracle-return.v1'
    status = $status
    detail = $detail
    receipt_id = $receipt
    target = 'CHAT_GLOBAL_CURRENT_CONVERSATION'
    mode = $Mode
    surface = $script:resolvedSurface
    requested_surface = $TargetSurface
    at = [DateTimeOffset]::UtcNow.ToString('o')
  } | ConvertTo-Json -Compress
}

$script:resolvedSurface = 'UNKNOWN'
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
    $terminal = @('DONE','COMPLETED','TURN_DONE','STEP_DONE','FAILED','BLOCKED')
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
  if ($TargetSurface -in @('Auto','HermesEmbedded')) {
    $embedded = Find-HermesEmbeddedTarget $expectedPath
    if ($embedded) {
      $matchedRoot = $embedded.Root
      $matchingPid = $embedded.ProcessId
      $script:resolvedSurface = 'HermesEmbedded'
    }
    if (-not $matchedRoot -and $TargetSurface -eq 'HermesEmbedded') {
      throw 'EXACT_CHATGPT_CONVERSATION_NOT_FOUND_INSIDE_HERMES'
    }
  }
  if (-not $matchedRoot -and $TargetSurface -in @('Auto','ExternalBrowser')) {
    $browsers = @(Get-Process msedge, chrome -ErrorAction SilentlyContinue |
      Where-Object { $_.MainWindowHandle -ne 0 })
    foreach ($process in $browsers) {
      $root = [System.Windows.Automation.AutomationElement]::FromHandle([IntPtr]$process.MainWindowHandle)
      $address = Get-BrowserAddress $root
      if (Match-Conversation $address $expectedPath) {
        if ($matchedRoot) { throw 'MULTIPLE_MATCHING_BROWSER_WINDOWS' }
        $matchedRoot = $root
        $matchingPid = $process.Id
        $script:resolvedSurface = 'ExternalBrowser'
      }
    }
    if (-not $matchedRoot -and $ActivateExistingTab -and $TabTitle) {
      $candidates = @()
      foreach ($process in $browsers) {
        $root = [System.Windows.Automation.AutomationElement]::FromHandle([IntPtr]$process.MainWindowHandle)
        $tabs = @(Find-Type $root ([System.Windows.Automation.ControlType]::TabItem) |
          Where-Object { $_.Current.Name.StartsWith($TabTitle, [StringComparison]::OrdinalIgnoreCase) })
        foreach ($tab in $tabs) {
          $candidates += [pscustomobject]@{ Root=$root; ProcessId=$process.Id; Tab=$tab }
        }
      }
      if ($candidates.Count -ne 1) { throw ('EXISTING_TAB_NOT_UNIQUE_OR_NOT_FOUND_' + $candidates.Count) }
      $candidate = $candidates[0]
      $selection = Get-Pattern $candidate.Tab ([System.Windows.Automation.SelectionItemPattern]::Pattern)
      if (-not $selection) { throw 'EXISTING_TAB_CANNOT_SELECT' }
      $selection.Select()
      Start-Sleep -Milliseconds 300
      if (-not (Match-Conversation (Get-BrowserAddress $candidate.Root) $expectedPath)) {
        throw 'EXISTING_TAB_SELECTED_BUT_URL_MISMATCH'
      }
      $matchedRoot = $candidate.Root
      $matchingPid = $candidate.ProcessId
      $switchedTab = $true
      $script:resolvedSurface = 'ExternalBrowser'
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

  # Direct UIA does NOT need SetFocus, SendKeys, Enter or clipboard.
  # The HermesEmbedded surface was independently proven via ValuePattern.SetValue
  # followed by a real button InvokePattern (TEST_ID CD_UISEND_2810_2335).
  if (-not (Target-Still-Matches $matchedRoot $expectedPath)) {
    throw 'TARGET_CHANGED_BEFORE_VALUE_SET'
  }
  $valuePattern.SetValue($draft)
  $written = ''
  for ($attempt=0; $attempt -lt 12; $attempt++) {
    Start-Sleep -Milliseconds 180
    $written = ([string]$valuePattern.Current.Value).TrimEnd([char]13, [char]10)
    if ($written -ceq $draft) { break }
  }
  if ($written -cne $draft) {
    throw 'DIRECT_UIA_DRAFT_READBACK_MISMATCH_NOT_SENT'
  }
  if ($Mode -eq 'Draft') {
    Result 'DRAFT_PROVEN_NO_SEND' ('EXACT_URL; VALUEPATTERN_SETVALUE; EDITOR_READBACK; LENGTH=' + $written.Length) $receiptId
    return
  }
  if (-not (Target-Still-Matches $matchedRoot $expectedPath) -or
      ([string]$valuePattern.Current.Value).TrimEnd([char]13, [char]10) -cne $draft) {
    throw 'TARGET_OR_DRAFT_CHANGED_ABORT_SEND'
  }
  $sendBusy = @(Find-Type $matchedRoot ([System.Windows.Automation.ControlType]::Button) |
    Where-Object { $_.Current.Name -in @('Parar','Stop generating','Stop') -and $_.Current.IsEnabled }).Count -gt 0
  if ($sendBusy) { throw 'CHATGPT_GENERATION_STARTED_BEFORE_SEND' }
  # Reacquire the actual "Enviar" control after the compositor changes.
  # A "Parar" button is NOT an acceptable substitute for "Enviar".
  $send = Find-SendInvoke $matchedRoot
  if (-not (Target-Still-Matches $matchedRoot $expectedPath) -or
      ([string]$valuePattern.Current.Value).TrimEnd([char]13, [char]10) -cne $draft) {
    throw 'TARGET_OR_DRAFT_CHANGED_BEFORE_INVOKE'
  }
  $send.Invoke()  # exactly one real UIA click; do not blindly retry
  $delivered = $false
  $composerCleared = $false
  for ($attempt=0; $attempt -lt 36; $attempt++) {
    Start-Sleep -Milliseconds 350
    if (-not (Target-Still-Matches $matchedRoot $expectedPath)) {
      throw 'TARGET_CHANGED_AFTER_SEND_RESULT_UNKNOWN_DO_NOT_RETRY'
    }
    $composerCleared = Editor-Empty ([string]$valuePattern.Current.Value)
    if ($composerCleared -and (Has-ReceiptVisible $matchedRoot ('RECEIPT_ID=' + $receiptId))) {
      $delivered = $true
      break
    }
  }
  if ($delivered) {
    Result 'SENT_WITH_UI_READBACK' 'EXACT_TARGET; VALUEPATTERN_SETVALUE; SEND_INVOKEPATTERN; RECEIPT_VISIBLE; EDITOR_CLEARED' $receiptId
  } else {
    Result 'SEND_UNCONFIRMED_DO_NOT_RETRY_BLINDLY' ('ONE_SEND_INVOKED; EDITOR_CLEARED=' + $composerCleared +
      '; RECEIPT_NOT_VISIBLE_YET; NO_RETRY; SEARCH_SAME_CHAT_BEFORE_ANY_NEW_ACTION') $receiptId
  }
} catch {
  Result 'BLOCKED' ([string]$_.Exception.Message) $receiptId
  exit 2
}

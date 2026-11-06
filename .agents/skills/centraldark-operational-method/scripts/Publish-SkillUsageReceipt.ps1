#requires -Version 5.1
<#
  CentralDark · skill invocation receipt -> existing Supabase agent-log owner.
  Does not read private chat, guess skill usage, or open new telemetry stores.
  Invoke ONLY after the original Hermes owner emits a real verified receipt.
  Requires AGENT_LOG_SECRET in the trusted executor process environment.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$ReceiptPath
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
function Fail([string]$reason) {
  [pscustomobject]@{
    status = 'BLOCKED'; reason = $reason; emitted = $false
  } | ConvertTo-Json -Compress
  exit 2
}
if (-not (Test-Path -LiteralPath $ReceiptPath -PathType Leaf)) {
  Fail 'VERIFIED_RECEIPT_FILE_NOT_FOUND'
}
try {
  $receipt = Get-Content -LiteralPath $ReceiptPath -Raw | ConvertFrom-Json
} catch {
  Fail 'RECEIPT_JSON_INVALID'
}
if ($receipt.verified -cne $true -or
    $receipt.event_type -cne 'skill_invocation') {
  Fail 'NOT_A_VERIFIED_SKILL_INVOCATION'
}
$skill = [string]$receipt.skill_id
$receiptId = [string]$receipt.receipt_id
$source = [string]$receipt.source
$outcome = [string]$receipt.outcome
if ($skill -notmatch '^[A-Za-z0-9_.:/-]{1,160}$' -or
    $receiptId -notmatch '^[A-Za-z0-9_.:/-]{1,180}$' -or
    $source -notmatch '^[A-Za-z0-9_.:/-]{1,80}$' -or
    $outcome -notin @('PASS','FAIL','BLOCKED','UNKNOWN')) {
  Fail 'CAUSAL_SKILL_RECEIPT_FIELDS_INVALID'
}
$secret = [string]$env:AGENT_LOG_SECRET
if ([string]::IsNullOrWhiteSpace($secret)) {
  Fail 'AGENT_LOG_SECRET_NOT_CONFIGURED_IN_TRUSTED_EXECUTOR'
}
$endpoint = 'https://lyoigsqluyktoclwdaft.supabase.co/functions/v1/agent-log'
$level = switch ($outcome) {
  'PASS' { 'sucesso' }
  'FAIL' { 'erro' }
  'BLOCKED' { 'aviso' }
  default { 'info' }
}
$metadata = @{
  verified = $true
  skill_id = $skill
  receipt_id = $receiptId
  outcome = $outcome
  source = $source
}
if ($receipt.PSObject.Properties['run_id'] -and
    $receipt.run_id -match '^[A-Za-z0-9_.:/-]{1,180}$') {
  $metadata['run_id'] = [string]$receipt.run_id
}
if ($receipt.PSObject.Properties['proof_sha'] -and
    $receipt.proof_sha -match '^[a-fA-F0-9]{40,64}$') {
  $metadata['proof_sha'] = [string]$receipt.proof_sha
}
$body = @{
  agent = 'HERMES'
  area = 'skill-usage'
  acao = 'skill_invocation'
  alvo = $skill
  status = $level
  metadata = $metadata
} | ConvertTo-Json -Depth 5 -Compress
try {
  $answer = Invoke-RestMethod -Method Post -Uri $endpoint -Headers @{
    'X-Agent-Secret' = $secret
    'Content-Type' = 'application/json'
  } -Body $body -TimeoutSec 12
  if ($answer.ok -ne $true -or -not $answer.id) {
    Fail 'INGEST_ACK_INVALID'
  }
  [pscustomobject]@{
    status = 'ACK'
    emitted = $true
    event_id = $answer.id
    receipt_id = $receiptId
    skill_id = $skill
    owner = 'public.agent_events'
    realtime = 'PUBLICATION_ENABLED_SUBSCRIBER_ACK_NOT_PROVEN'
  } | ConvertTo-Json -Compress
} catch {
  Fail ('AGENT_LOG_INGEST_FAILED_' + $_.Exception.GetType().Name)
}

[CmdletBinding()]
param(
    [string]$InputCsv,
    [switch]$SendToSol
)

$ErrorActionPreference = "Stop"
$Casa = "E:\CentralDark"
$Root = Join-Path $Casa "workspace\security\autoruns\20260830"
$Package = Join-Path $Root "package"
$Tool = Join-Path $Package "autorunsc64.exe"
$SourceZip = "C:\Users\danda\Downloads\Autoruns.zip"
$HermesInbox = Join-Path $Casa "profiles\hermes\security\autoruns"
$RunId = Get-Date -Format "yyyyMMdd-HHmmss"
$ReportDir = Join-Path $Root "reports\autoruns-$RunId"

New-Item -ItemType Directory -Path $ReportDir,$HermesInbox -Force | Out-Null

if (-not (Test-Path -LiteralPath $Tool)) {
    throw "Autoruns tool is missing: $Tool"
}

$signature = Get-AuthenticodeSignature -LiteralPath $Tool
if ($signature.Status -ne "Valid" -or -not $signature.SignerCertificate.Subject.Contains("Microsoft Corporation")) {
    throw "Autoruns tool trust check failed: status=$($signature.Status)"
}

$toolHash = (Get-FileHash -LiteralPath $Tool -Algorithm SHA256).Hash
$zipHash = if (Test-Path -LiteralPath $SourceZip) {
    (Get-FileHash -LiteralPath $SourceZip -Algorithm SHA256).Hash
} else {
    $null
}

$csvPath = if ($InputCsv) {
    (Resolve-Path -LiteralPath $InputCsv).Path
} else {
    Join-Path $ReportDir "autoruns.csv"
}
$stderrPath = Join-Path $ReportDir "autoruns.stderr.txt"

if (-not $InputCsv) {
    # Read-only collection. Do not use -m: Microsoft entries remain visible.
    & $Tool "-accepteula" "-a" "*" "-c" "-h" "-s" 1> $csvPath 2> $stderrPath
    if ($LASTEXITCODE -ne 0) {
        throw "Autoruns collection failed with exit code $LASTEXITCODE"
    }
} elseif (-not (Test-Path -LiteralPath $csvPath)) {
    throw "Input CSV is missing: $csvPath"
}

$rows = Get-Content -LiteralPath $csvPath | Select-Object -Skip 5 | ConvertFrom-Csv
$findings = foreach ($row in $rows) {
    $image = [string]$row.'Image Path'
    $entry = [string]$row.Entry
    if (-not $entry -and -not $image) { continue }

    $classification = "OBSERVE"
    $reason = "verified_or_system_entry"
    if ($image -match "(?i)^File not found:") {
        $classification = "REVIEW_MISSING_TARGET"
        $reason = "startup_reference_without_target"
    } elseif ($image -match "(?i)\.(vbs|vbe|js|jse|ps1|bat|cmd)$") {
        $classification = "REVIEW_SCRIPT"
        $reason = "script_autostart_requires_content_review"
    } elseif ($row.Signer -notmatch "^\(Verified\)") {
        $classification = "REVIEW_UNVERIFIED"
        $reason = "signature_not_verified"
    } elseif ($image -match "(?i)\\Users\\[^\\]+\\(AppData|Downloads|Desktop)\\") {
        $classification = "REVIEW_USER_WRITABLE"
        $reason = "autostart_from_user_writable_location"
    }

    [ordered]@{
        time = [string]$row.Time
        entry_location = [string]$row.'Entry Location'
        entry = $entry
        enabled = [string]$row.Enabled
        signer = [string]$row.Signer
        company = [string]$row.Company
        image_path = $image
        launch_string = [string]$row.'Launch String'
        sha256 = [string]$row.'SHA-256'
        classification = $classification
        reason = $reason
    }
}

$health = [ordered]@{
    checked = Get-Date -Format o
    url = "http://127.0.0.1:8787/health"
    reachable = $false
    status = 0
}
try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $health.url -TimeoutSec 4
    $health.reachable = $response.StatusCode -ge 200 -and $response.StatusCode -lt 300
    $health.status = [int]$response.StatusCode
} catch {
    $health.error = "local_runtime_unreachable"
}

$summary = @{}
foreach ($item in $findings) {
    $summary[$item.classification] = 1 + [int]($summary[$item.classification] ?? 0)
}

$report = [ordered]@{
    schema = "centraldark.autoruns.security.v1"
    mission_id = "security/autoruns-casa-$RunId"
    generated_at = Get-Date -Format o
    source = [ordered]@{
        zip = $SourceZip
        zip_sha256 = $zipHash
        csv = $csvPath
        row_count = $findings.Count
    }
    tool = [ordered]@{
        path = $Tool
        sha256 = $toolHash
        signature_status = [string]$signature.Status
        signer = [string]$signature.SignerCertificate.Subject
        collection_mode = if ($InputCsv) { "analyze_existing" } else { "read_only" }
    }
    control = [ordered]@{
        owner = "Hermes"
        role = "classify_correlate_propose"
        human_approval_required = $true
        allowed_actions = @("classify", "correlate", "summarize", "propose")
        forbidden_actions = @("delete", "restore_quarantine", "disable_defender", "modify_registry", "execute_untrusted")
        unknown_is_pass = $false
    }
    local_runtime = $health
    summary = $summary
    findings = @($findings)
}

$reportPath = Join-Path $ReportDir "autoruns-security-report.json"
$handoffPath = Join-Path $HermesInbox "handoff-$RunId.json"
$json = $report | ConvertTo-Json -Depth 8
$json | Set-Content -LiteralPath $reportPath -Encoding utf8NoBOM
$json | Set-Content -LiteralPath $handoffPath -Encoding utf8NoBOM

if ($SendToSol -and $health.reachable) {
    throw "SendToSol is intentionally disabled until a scoped local SOL contract is proven"
}

[ordered]@{
    status = "PASS"
    mode = $report.tool.collection_mode
    report = $reportPath
    hermes_handoff = $handoffPath
    rows = $findings.Count
    summary = $summary
    local_runtime_reachable = $health.reachable
    mutations = 0
} | ConvertTo-Json -Depth 6

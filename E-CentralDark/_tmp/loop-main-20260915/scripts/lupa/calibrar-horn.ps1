#requires -Version 7.0
[CmdletBinding()]
param(
    [string]$Capability = "UNKNOWN",
    [string]$Scope = "UNKNOWN",
    [ValidateSet("PRESENT", "GAP", "UNKNOWN")]
    [string]$OwnerState = "UNKNOWN",
    [ValidateSet("PRESENT", "GAP", "UNKNOWN")]
    [string]$CapabilityState = "UNKNOWN",
    [ValidateSet("TRUE", "FALSE", "UNKNOWN")]
    [string]$SameScopeState = "UNKNOWN",
    [ValidateSet("PRESENT", "GAP", "UNKNOWN")]
    [string]$EvidenceState = "UNKNOWN",
    [ValidateSet("ABSENT", "PRESENT", "UNKNOWN")]
    [string]$RegressionState = "UNKNOWN",
    [switch]$ErrorObserved,
    [ValidateSet("PRESENT", "GAP", "NA")]
    [string]$LearningState = "NA",
    [ValidateSet("PRESENT", "GAP", "NA")]
    [string]$ReceiptState = "NA",
    [switch]$Simulate,
    [ValidateRange(1, 1000)]
    [int]$Cases = 64,
    [int]$Seed = 2309,
    [switch]$SelfTest,
    [switch]$Json
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$AdapterSchema = "centraldark.calibrar-horn.pwsh"
$Method = "HORN_FORWARD_CHAINING_TO_FIXED_POINT"
$SimulationMethod = "DETERMINISTIC_SEEDED_SIMULATION"

function Get-CentralDarkRepoRoot {
    if ($env:CENTRALDARK_ROOT -and (Test-Path -LiteralPath $env:CENTRALDARK_ROOT)) {
        return (Resolve-Path -LiteralPath $env:CENTRALDARK_ROOT).Path
    }

    if ($PSScriptRoot) {
        $candidate = Join-Path $PSScriptRoot "..\.."
        if (Test-Path -LiteralPath $candidate) {
            return (Resolve-Path -LiteralPath $candidate).Path
        }
    }

    $git = Get-Command git -ErrorAction SilentlyContinue
    if ($git) {
        $root = (& $git.Source rev-parse --show-toplevel 2>$null)
        if ($LASTEXITCODE -eq 0 -and $root) {
            return (Resolve-Path -LiteralPath $root.Trim()).Path
        }
    }

    throw "CENTRALDARK_REPO_ROOT_NOT_FOUND"
}

function Get-DependencySnapshot {
    param([string]$RepoRoot)

    $node = Get-Command node -ErrorAction SilentlyContinue
    $git = Get-Command git -ErrorAction SilentlyContinue
    $engine = Join-Path $RepoRoot "apps/modulos/mcp/src/tools/aprendizado/reuse-horn-core.js"

    [ordered]@{
        powershell_version = $PSVersionTable.PSVersion.ToString()
        node_present = [bool]$node
        node_path = if ($node) { $node.Source } else { $null }
        node_version = if ($node) { (& $node.Source --version 2>$null) } else { $null }
        git_present = [bool]$git
        engine_present = Test-Path -LiteralPath $engine
        engine_path = $engine
        external_provider_required = $false
        network_required = $false
    }
}

function Invoke-HornEngine {
    param(
        [Parameter(Mandatory)]$Payload,
        [Parameter(Mandatory)][string]$EnginePath
    )

    $node = Get-Command node -ErrorAction SilentlyContinue
    if (-not $node) { throw "NODE_NOT_FOUND" }
    if (-not (Test-Path -LiteralPath $EnginePath)) { throw "HORN_ENGINE_NOT_FOUND:$EnginePath" }

    $runner = Join-Path ([System.IO.Path]::GetTempPath()) ("centraldark-horn-runner-{0}.mjs" -f [guid]::NewGuid().ToString("N"))
    $runnerSource = @'
import { pathToFileURL } from "node:url";
const [enginePath, payloadJson] = process.argv.slice(2);
const mod = await import(pathToFileURL(enginePath).href);
const payload = JSON.parse(payloadJson);
const run = (input) => mod.decideReuseBeforeCreate(input);
const output = Array.isArray(payload) ? payload.map(run) : run(payload);
process.stdout.write(JSON.stringify(output));
'@

    Set-Content -LiteralPath $runner -Value $runnerSource -Encoding utf8NoBOM
    try {
        $payloadJson = $Payload | ConvertTo-Json -Compress -Depth 16
        $psi = [System.Diagnostics.ProcessStartInfo]::new()
        $psi.FileName = $node.Source
        $psi.UseShellExecute = $false
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true
        $null = $psi.ArgumentList.Add($runner)
        $null = $psi.ArgumentList.Add($EnginePath)
        $null = $psi.ArgumentList.Add($payloadJson)

        $proc = [System.Diagnostics.Process]::new()
        $proc.StartInfo = $psi
        $null = $proc.Start()
        $stdout = $proc.StandardOutput.ReadToEnd()
        $stderr = $proc.StandardError.ReadToEnd()
        $proc.WaitForExit()

        if ($proc.ExitCode -ne 0) {
            throw "HORN_ENGINE_FAILED(exit=$($proc.ExitCode)):$stderr"
        }
        if ([string]::IsNullOrWhiteSpace($stdout)) {
            throw "HORN_ENGINE_EMPTY_OUTPUT"
        }
        return ($stdout | ConvertFrom-Json -Depth 64)
    }
    finally {
        Remove-Item -LiteralPath $runner -Force -ErrorAction SilentlyContinue
    }
}

function Get-UnknownFields {
    param(
        [string]$Owner,
        [string]$CapabilityStatus,
        [string]$SameScope,
        [string]$Evidence,
        [string]$Regression
    )

    $unknown = [System.Collections.Generic.List[string]]::new()
    if ($Owner -eq "UNKNOWN") { $unknown.Add("owner") }
    if ($CapabilityStatus -eq "UNKNOWN") { $unknown.Add("capability") }
    if ($SameScope -eq "UNKNOWN") { $unknown.Add("same_scope") }
    if ($Evidence -eq "UNKNOWN") { $unknown.Add("evidence") }
    if ($Regression -eq "UNKNOWN") { $unknown.Add("regression") }
    return @($unknown)
}

function New-BlockedResult {
    param(
        [string]$Decision,
        [string]$Reason,
        [array]$UnknownFields = @(),
        [hashtable]$Dependencies
    )

    [ordered]@{
        schema = $AdapterSchema
        method = $Method
        adapter = "POWERSHELL_7"
        decision = $Decision
        pass = $false
        reason = $Reason
        unknown_fields = @($UnknownFields)
        dependencies = $Dependencies
        simulation_is_proof = $false
        unknown_is_not_pass = $true
        next_cursor = "MEASURE_FIRST_UNKNOWN_OR_REMOVE_BLOCKER"
    }
}

function Invoke-SingleCalibration {
    param([string]$RepoRoot)

    $dependencies = Get-DependencySnapshot -RepoRoot $RepoRoot
    if (-not $dependencies.node_present) {
        return New-BlockedResult -Decision "BLOCKED_DEPENDENCY" -Reason "NODE_NOT_FOUND" -Dependencies $dependencies
    }
    if (-not $dependencies.engine_present) {
        return New-BlockedResult -Decision "BLOCKED_DEPENDENCY" -Reason "HORN_ENGINE_NOT_FOUND" -Dependencies $dependencies
    }

    $unknown = Get-UnknownFields -Owner $OwnerState -CapabilityStatus $CapabilityState -SameScope $SameScopeState -Evidence $EvidenceState -Regression $RegressionState
    if ($unknown.Count -gt 0) {
        return New-BlockedResult -Decision "BLOCKED_UNKNOWN" -Reason "UNKNOWN_INPUT_FACTS" -UnknownFields $unknown -Dependencies $dependencies
    }
    if ($RegressionState -eq "PRESENT") {
        return New-BlockedResult -Decision "BLOCKED_REGRESSION" -Reason "REGRESSION_PRESENT" -Dependencies $dependencies
    }

    $input = [ordered]@{
        capability = $Capability
        scope = $Scope
        owner_present = ($OwnerState -eq "PRESENT")
        capability_present = ($CapabilityState -eq "PRESENT")
        same_scope = ($SameScopeState -eq "TRUE")
        evidence_present = ($EvidenceState -eq "PRESENT")
        regression_absent = ($RegressionState -eq "ABSENT")
        error_observed = [bool]$ErrorObserved
        learning_present = ($LearningState -eq "PRESENT")
        receipt_present = ($ReceiptState -eq "PRESENT")
    }

    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $engineResult = Invoke-HornEngine -Payload $input -EnginePath $dependencies.engine_path
    }
    catch {
        $sw.Stop()
        $blocked = New-BlockedResult -Decision "BLOCKED_DEPENDENCY" -Reason $_.Exception.Message -Dependencies $dependencies
        $blocked.duration_ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 3)
        return $blocked
    }
    $sw.Stop()

    [ordered]@{
        schema = $AdapterSchema
        method = $Method
        adapter = "POWERSHELL_7"
        source = $engineResult.source
        source_sha256 = $engineResult.source_sha256
        capability = $Capability
        scope = $Scope
        decision = $engineResult.decision
        pass = [bool]$engineResult.pass
        fixed_point_rounds = $engineResult.fixed_point.rounds
        fixed_point_stable = [bool]$engineResult.fixed_point.stable
        facts_count = @($engineResult.fixed_point.facts).Count
        fired_rules = @($engineResult.fixed_point.fired)
        measurable = $engineResult.measurable
        duration_ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 3)
        dependencies = $dependencies
        simulation_is_proof = $false
        unknown_is_not_pass = $true
        next_cursor = $engineResult.next_cursor
    }
}

function Invoke-DeterministicSimulation {
    param(
        [string]$RepoRoot,
        [int]$Count,
        [int]$SimulationSeed
    )

    $dependencies = Get-DependencySnapshot -RepoRoot $RepoRoot
    if (-not $dependencies.node_present -or -not $dependencies.engine_present) {
        return New-BlockedResult -Decision "BLOCKED_DEPENDENCY" -Reason "SIMULATION_ENGINE_DEPENDENCY_MISSING" -Dependencies $dependencies
    }

    $rng = [System.Random]::new($SimulationSeed)
    $measuredInputs = [System.Collections.Generic.List[object]]::new()
    $measuredMeta = [System.Collections.Generic.List[object]]::new()
    $blockedUnknown = 0

    for ($i = 0; $i -lt $Count; $i++) {
        if ($rng.Next(0, 5) -eq 0) {
            $blockedUnknown++
            continue
        }

        $input = [ordered]@{
            capability = "SIM_CAP_$i"
            scope = "SIM_SCOPE_$($rng.Next(0, 8))"
            owner_present = [bool]$rng.Next(0, 2)
            capability_present = [bool]$rng.Next(0, 2)
            same_scope = [bool]$rng.Next(0, 2)
            evidence_present = [bool]$rng.Next(0, 2)
            regression_absent = [bool]$rng.Next(0, 2)
            error_observed = [bool]($rng.Next(0, 4) -eq 0)
            learning_present = [bool]$rng.Next(0, 2)
            receipt_present = [bool]$rng.Next(0, 2)
        }
        $measuredInputs.Add($input)
        $measuredMeta.Add($input)
    }

    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $results = if ($measuredInputs.Count -gt 0) {
            @(Invoke-HornEngine -Payload @($measuredInputs) -EnginePath $dependencies.engine_path)
        }
        else { @() }
    }
    catch {
        $sw.Stop()
        $blocked = New-BlockedResult -Decision "BLOCKED_DEPENDENCY" -Reason $_.Exception.Message -Dependencies $dependencies
        $blocked.duration_ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 3)
        return $blocked
    }
    $sw.Stop()

    $failures = [System.Collections.Generic.List[object]]::new()
    $passCount = 0
    $blockedCount = $blockedUnknown
    $decisionCounts = @{}

    for ($i = 0; $i -lt $results.Count; $i++) {
        $r = $results[$i]
        $input = $measuredMeta[$i]
        $decision = [string]$r.decision
        if (-not $decisionCounts.ContainsKey($decision)) { $decisionCounts[$decision] = 0 }
        $decisionCounts[$decision]++

        if ($r.pass) { $passCount++ } else { $blockedCount++ }

        if (-not $r.fixed_point.stable) {
            $failures.Add([ordered]@{ case = $i; invariant = "FIXED_POINT_STABLE"; decision = $decision })
        }
        if ($r.pass -and $decision -notin @("EXTEND_EXISTING", "CREATE_MINIMAL", "REUSE_EXISTING")) {
            $failures.Add([ordered]@{ case = $i; invariant = "PASS_DECISION_ALLOWED"; decision = $decision })
        }
        if ($r.pass -and $decision -eq "CREATE_MINIMAL" -and ($input.owner_present -or $input.capability_present -or -not $input.evidence_present -or -not $input.regression_absent)) {
            $failures.Add([ordered]@{ case = $i; invariant = "CREATE_ONLY_ON_MEASURED_GAP"; decision = $decision })
        }
        if ($r.pass -and $decision -eq "EXTEND_EXISTING" -and (-not $input.owner_present -or -not $input.capability_present -or -not $input.same_scope -or -not $input.evidence_present -or -not $input.regression_absent)) {
            $failures.Add([ordered]@{ case = $i; invariant = "EXTEND_REQUIRES_EXISTING_OWNER"; decision = $decision })
        }
        if ($input.error_observed -and (-not $input.learning_present -or -not $input.receipt_present) -and $r.pass) {
            $failures.Add([ordered]@{ case = $i; invariant = "ERROR_REQUIRES_LEARNING_AND_RECEIPT"; decision = $decision })
        }
        if ($r.decision -eq "BLOCKED_UNKNOWN" -and $r.pass) {
            $failures.Add([ordered]@{ case = $i; invariant = "UNKNOWN_NEVER_PASS"; decision = $decision })
        }
    }

    [ordered]@{
        schema = $AdapterSchema
        method = $SimulationMethod
        adapter = "POWERSHELL_7"
        source = if ($results.Count -gt 0) { $results[0].source } else { "Lógica Computacional 23 — Nelma Moreira" }
        source_sha256 = if ($results.Count -gt 0) { $results[0].source_sha256 } else { $null }
        seed = $SimulationSeed
        cases = $Count
        measured_cases = $results.Count
        blocked_unknown_cases = $blockedUnknown
        pass_cases = $passCount
        blocked_cases = $blockedCount
        decision_counts = $decisionCounts
        invariant_failures = @($failures)
        invariant_failure_count = $failures.Count
        pass = ($failures.Count -eq 0)
        duration_ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 3)
        dependencies = $dependencies
        simulation_is_proof = $false
        simulation_role = "COUNTERPROOF_ASSISTANT_NOT_TRUTH_ORACLE"
        unknown_is_not_pass = $true
        next_cursor = if ($failures.Count -eq 0) { "USE_MEASURED_FACTS_FOR_REAL_CALIBRATION" } else { "FIX_INVARIANT_FAILURE_BEFORE_USE" }
    }
}

function Invoke-SelfTest {
    param([string]$RepoRoot)

    $dependencies = Get-DependencySnapshot -RepoRoot $RepoRoot
    if (-not $dependencies.node_present -or -not $dependencies.engine_present) {
        return New-BlockedResult -Decision "BLOCKED_DEPENDENCY" -Reason "SELFTEST_ENGINE_DEPENDENCY_MISSING" -Dependencies $dependencies
    }

    $cases = @(
        [ordered]@{ capability="existing"; scope="same"; owner_present=$true; capability_present=$true; same_scope=$true; evidence_present=$true; regression_absent=$true; error_observed=$false; learning_present=$false; receipt_present=$false },
        [ordered]@{ capability="new"; scope="gap"; owner_present=$false; capability_present=$false; same_scope=$false; evidence_present=$true; regression_absent=$true; error_observed=$false; learning_present=$false; receipt_present=$false },
        [ordered]@{ capability="unknown"; scope="same"; owner_present=$true; capability_present=$true; same_scope=$true; evidence_present=$false; regression_absent=$false; error_observed=$false; learning_present=$false; receipt_present=$false },
        [ordered]@{ capability="error"; scope="same"; owner_present=$true; capability_present=$true; same_scope=$true; evidence_present=$true; regression_absent=$true; error_observed=$true; learning_present=$false; receipt_present=$false }
    )
    $expected = @("EXTEND_EXISTING", "CREATE_MINIMAL", "BLOCKED_UNKNOWN", "BLOCKED_UNKNOWN")

    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $results = @(Invoke-HornEngine -Payload $cases -EnginePath $dependencies.engine_path)
    }
    catch {
        $sw.Stop()
        $blocked = New-BlockedResult -Decision "BLOCKED_DEPENDENCY" -Reason $_.Exception.Message -Dependencies $dependencies
        $blocked.duration_ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 3)
        return $blocked
    }
    $sw.Stop()

    $checks = [System.Collections.Generic.List[object]]::new()
    $allPass = $true
    for ($i = 0; $i -lt $expected.Count; $i++) {
        $ok = ([string]$results[$i].decision -eq $expected[$i])
        if (-not $ok) { $allPass = $false }
        $checks.Add([ordered]@{ case=$i; expected=$expected[$i]; observed=$results[$i].decision; pass=$ok })
    }

    $sim = Invoke-DeterministicSimulation -RepoRoot $RepoRoot -Count 64 -SimulationSeed 2309
    if (-not $sim.pass) { $allPass = $false }

    [ordered]@{
        schema = $AdapterSchema
        method = "SELF_TEST"
        adapter = "POWERSHELL_7"
        checks = @($checks)
        simulation = $sim
        pass = $allPass
        duration_ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 3)
        dependencies = $dependencies
        unknown_is_not_pass = $true
        simulation_is_proof = $false
        next_cursor = if ($allPass) { "CALIBRAR_HORN_ADAPTER_READY_FOR_TARGET_MEASUREMENT" } else { "FIX_SELFTEST_BEFORE_USE" }
    }
}

function Write-CalibrationResult {
    param($Result)

    if ($Json) {
        $Result | ConvertTo-Json -Depth 32
        return
    }

    $decision = if ($Result.decision) { $Result.decision } elseif ($Result.method -eq "SELF_TEST") { "SELF_TEST" } else { $Result.method }
    $passText = if ($Result.pass) { "PASS" } else { "BLOCKED" }
    $duration = if ($null -ne $Result.duration_ms) { " ms=$($Result.duration_ms)" } else { "" }
    Write-Output ("🧿 CALIBRAR/HORN | {0} | {1}{2}" -f $decision, $passText, $duration)
    if ($Result.next_cursor) { Write-Output ("→ {0}" -f $Result.next_cursor) }
}

$repoRoot = Get-CentralDarkRepoRoot
$result = if ($SelfTest) {
    Invoke-SelfTest -RepoRoot $repoRoot
}
elseif ($Simulate) {
    Invoke-DeterministicSimulation -RepoRoot $repoRoot -Count $Cases -SimulationSeed $Seed
}
else {
    Invoke-SingleCalibration -RepoRoot $repoRoot
}

Write-CalibrationResult -Result $result
if (-not $result.pass) { exit 20 }
exit 0

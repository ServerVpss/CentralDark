$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$mjs = 'E:\CentralDark\CentralDark\scripts\lupa\pdf-conformance-cc2003.mjs'
$runner = 'E:\CentralDark\runtime\scheduled-jobs\run-scheduled-sector.ps1'

$m = Get-Content -Raw -LiteralPath $mjs
$r = Get-Content -Raw -LiteralPath $runner

if ($m -notmatch "mkdtempSync") {
  $m = $m.Replace("  statSync,`n} from 'node:fs';", "  statSync,`n  mkdtempSync,`n  rmSync,`n  writeFileSync,`n} from 'node:fs';")
}
if ($m -notmatch "import os from 'node:os';") {
  $m = $m.Replace("import path from 'node:path';", "import path from 'node:path';`nimport os from 'node:os';")
}

if ($m -notmatch "export function counterproofTamperedIdentity") {
$insert = @'
export function counterproofTamperedIdentity() {
  const identity = resolvePdfReference();
  if (identity.status !== 'PROVED_IN_SCOPE' || !identity.path) {
    return { status: 'COUNTERPROOF_FAIL_CLOSED', passed: false, reason: 'IDENTITY_NOT_PROVED' };
  }

  const dir = mkdtempSync(path.join(os.tmpdir(), 'centraldark-pdf-gate-'));
  try {
    const bytes = Buffer.from(readFileSync(identity.path));
    if (bytes.length === 0) {
      return { status: 'COUNTERPROOF_FAIL_CLOSED', passed: false, reason: 'EMPTY_SOURCE_BYTES' };
    }
    bytes[0] = bytes[0] ^ 0xff;
    const tamperedPath = path.join(dir, path.basename(identity.path));
    writeFileSync(tamperedPath, bytes);
    const tampered = inspectArtifact(tamperedPath);
    const passed = tampered.status === 'REFUTED_IN_SCOPE' && tampered.reason === 'BYTE_IDENTITY_MISMATCH';
    return { status: passed ? 'COUNTERPROOF_PASS' : 'COUNTERPROOF_FAIL_CLOSED', passed, reason: tampered.reason, tamperedStatus: tampered.status };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function policyCheck(identity) {
  const checks = {
    identity_proved: identity?.status === 'PROVED_IN_SCOPE',
    byte_identity_match: identity?.identityMatch === true,
    unknown_is_not_pass: identity?.status !== 'UNKNOWN',
    source_hash_current: identity?.sha256 === CC2003_SOURCE.expectedSha256,
  };
  return { status: Object.values(checks).every(Boolean) ? 'POLICY_PASS' : 'POLICY_FAIL_CLOSED', checks };
}

export function runPdfGate() {
  const identity = resolvePdfReference();
  const policy = policyCheck(identity);
  const self = selfTest();
  const counterproof = counterproofTamperedIdentity();
  const passed = identity.status === 'PROVED_IN_SCOPE'
    && policy.status === 'POLICY_PASS'
    && self.status === 'PASS'
    && counterproof.passed === true;
  return {
    schema: 'centraldark.pdf_gate.v1',
    status: passed ? 'PDF_GATE_PASS' : 'PDF_GATE_FAIL_CLOSED',
    final_pass_claimed: passed,
    pdf_gate_promoted: passed,
    required_chain: ['identity', 'policy', 'self-test', 'node:test', 'counterproof_tamper'],
    checks: { identity: identity.status, policy: policy.status, self_test: self.status, node_test: 'RUN_BY_RUNNER', counterproof_tamper: counterproof.status },
    identity, policy, self, counterproof,
  };
}

'@
  $m = $m.Replace("export function selfTest() {", $insert + "export function selfTest() {")
}
if ($m -notmatch "process\.argv\.includes\('--gate'\)") {
  $needle = "function main() {`n  if (process.argv.includes('--self-test')) {"
  $replacement = "function main() {`n  if (process.argv.includes('--gate')) {`n    const gate = runPdfGate();`n    console.log(JSON.stringify(gate, null, 2));`n    process.exit(gate.status === 'PDF_GATE_PASS' ? 0 : 1);`n  }`n`n  if (process.argv.includes('--self-test')) {"
  if (-not $m.Contains($needle)) { throw 'MJS_MAIN_ANCHOR_NOT_FOUND' }
  $m = $m.Replace($needle, $replacement)
}

Set-Content -LiteralPath $mjs -Value $m -Encoding UTF8

if ($r -notmatch '\$PdfGatePromoted') {
  $r = $r.Replace("`$commandDesc = ''`n`$exitCode = 99", "`$commandDesc = ''`n`$exitCode = 99`n`$PdfGatePromoted = `$false")
}
$old = @'
  'PDF_GATE' {
    $commandDesc = 'pdf-conformance-cc2003 identity probe; final PDF_GATE remains fail-closed'
    $probe = Join-Path $Repo 'scripts\lupa\pdf-conformance-cc2003.mjs'
    if (!(Test-Path -LiteralPath $probe)) { $exitCode = 91; break }
    $exitCode = Invoke-Captured {
      Push-Location $Repo
      try {
        node $probe
        Write-Output 'PDF_GATE_PROMOTED=false'
        Write-Output 'REQUIRED_CHAIN=TLC23/HORN->PDF_GATE->COUNTERPROOF->PASS'
      } finally {
        Pop-Location
      }
    }
  }
'@
$new = @'
  'PDF_GATE' {
    $commandDesc = 'pdf-conformance-cc2003 --gate + node:test + counterproof'
    $probe = Join-Path $Repo 'scripts\lupa\pdf-conformance-cc2003.mjs'
    $testFile = Join-Path $Repo 'scripts\lupa\pdf-conformance-cc2003.test.mjs'
    if (!(Test-Path -LiteralPath $probe)) { $exitCode = 91; break }
    if (!(Test-Path -LiteralPath $testFile)) { $exitCode = 92; break }
    $exitCode = Invoke-Captured {
      Push-Location $Repo
      try {
        node $probe --gate
        $gateCode = if ($null -eq $LASTEXITCODE) { 99 } else { [int]$LASTEXITCODE }
        node --test $testFile
        $testCode = if ($null -eq $LASTEXITCODE) { 99 } else { [int]$LASTEXITCODE }
        if ($gateCode -eq 0 -and $testCode -eq 0) {
          Write-Output 'PDF_GATE_PROMOTED=true'
          Write-Output 'REQUIRED_CHAIN=identity->policy->self-test->node:test->counterproof_tamper->PASS'
          $script:PdfGatePromoted = $true
          $global:LASTEXITCODE = 0
        } else {
          Write-Output ('PDF_GATE_PROMOTED=false gateCode=' + $gateCode + ' testCode=' + $testCode)
          $script:PdfGatePromoted = $false
          $global:LASTEXITCODE = 1
        }
      } finally {
        Pop-Location
      }
    }
  }
'@
if ($r.Contains($old)) {
  $r = $r.Replace($old, $new)
} elseif ($r -notmatch "node:test \+ counterproof") {
  throw 'RUNNER_PDF_GATE_BLOCK_NOT_FOUND'
}

$r = $r.Replace("  final_pass_claimed=`$false`n  pdf_gate_promoted=`$false", "  final_pass_claimed=`$(if(`$Sector -eq 'PDF_GATE' -and `$exitCode -eq 0 -and `$PdfGatePromoted){`$true}else{`$false})`n  pdf_gate_promoted=`$(if(`$Sector -eq 'PDF_GATE' -and `$exitCode -eq 0 -and `$PdfGatePromoted){`$true}else{`$false})")
Set-Content -LiteralPath $runner -Value $r -Encoding UTF8

Write-Output 'PATCH_OK'

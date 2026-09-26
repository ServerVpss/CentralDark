$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$mjs = 'E:\CentralDark\CentralDark\scripts\lupa\pdf-conformance-cc2003.mjs'
$runner = 'E:\CentralDark\runtime\scheduled-jobs\run-scheduled-sector.ps1'
$m = Get-Content -Raw -LiteralPath $mjs
$r = Get-Content -Raw -LiteralPath $runner

if ($m -notmatch "mkdtempSync") {
  $m = $m -replace "(?s)import \{\s*existsSync,\s*readFileSync,\s*readdirSync,\s*statSync,\s*\} from 'node:fs';", "import {`n  existsSync,`n  readFileSync,`n  readdirSync,`n  statSync,`n  mkdtempSync,`n  rmSync,`n  writeFileSync,`n} from 'node:fs';"
}
if ($m -notmatch "import os from 'node:os';") {
  $m = $m -replace "import path from 'node:path';", "import path from 'node:path';`nimport os from 'node:os';"
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
    if (bytes.length === 0) return { status: 'COUNTERPROOF_FAIL_CLOSED', passed: false, reason: 'EMPTY_SOURCE_BYTES' };
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
  if ($m -notmatch "export function selfTest\(\)") { throw 'MJS_SELFTEST_ANCHOR_NOT_FOUND' }
  $m = $m -replace "export function selfTest\(\) \{", ($insert + "export function selfTest() {")
}

if ($m -notmatch "process\.argv\.includes\('--gate'\)") {
$gateMain = @'
function main() {
  if (process.argv.includes('--gate')) {
    const gate = runPdfGate();
    console.log(JSON.stringify(gate, null, 2));
    process.exit(gate.status === 'PDF_GATE_PASS' ? 0 : 1);
  }

'@
  $m2 = [regex]::Replace($m, "function main\(\) \{\s*", $gateMain, 1)
  if ($m2 -eq $m) { throw 'MJS_MAIN_REGEX_NOT_REPLACED' }
  $m = $m2
}

Set-Content -LiteralPath $mjs -Value $m -Encoding UTF8

if ($r -notmatch '\$PdfGatePromoted') {
  $r = $r -replace "\$commandDesc = ''\s*\$exitCode = 99", "`$commandDesc = ''`n`$exitCode = 99`n`$PdfGatePromoted = `$false"
}

$newPdf = @'
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
      } finally { Pop-Location }
    }
  }
'@
if ($r -notmatch "node:test \+ counterproof") {
  $r2 = [regex]::Replace($r, "(?s)  'PDF_GATE' \{.*?\n  \}\r?\n\r?\n  'SYSTEM_SENTINEL'", ($newPdf + "`n`n  'SYSTEM_SENTINEL'"), 1)
  if ($r2 -eq $r) { throw 'RUNNER_PDF_GATE_REGEX_NOT_REPLACED' }
  $r = $r2
}

$r = $r -replace "final_pass_claimed=\$false\s*pdf_gate_promoted=\$false", "final_pass_claimed=`$(if(`$Sector -eq 'PDF_GATE' -and `$exitCode -eq 0 -and `$PdfGatePromoted){`$true}else{`$false})`n  pdf_gate_promoted=`$(if(`$Sector -eq 'PDF_GATE' -and `$exitCode -eq 0 -and `$PdfGatePromoted){`$true}else{`$false})"
Set-Content -LiteralPath $runner -Value $r -Encoding UTF8
Write-Output 'PATCH_OK'

$ErrorActionPreference = 'Stop'
$repo = 'E:\CentralDark\CentralDark'
$mjs = Join-Path $repo 'scripts\lupa\pdf-conformance-cc2003.mjs'
$runner = 'E:\CentralDark\runtime\scheduled-jobs\run-scheduled-sector.ps1'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
Copy-Item -LiteralPath $mjs -Destination ($mjs + '.bak-' + $stamp) -Force
Copy-Item -LiteralPath $runner -Destination ($runner + '.bak-' + $stamp) -Force
$src = Get-Content -Raw -LiteralPath $mjs
$src = $src -replace "import \{\r?\n  existsSync,\r?\n  readFileSync,\r?\n  readdirSync,\r?\n  statSync,\r?\n\} from 'node:fs';", "import {`r`n  existsSync,`r`n  readFileSync,`r`n  readdirSync,`r`n  statSync,`r`n  mkdtempSync,`r`n  rmSync,`r`n  writeFileSync,`r`n} from 'node:fs';"
$src = $src -replace "import path from 'node:path';", "import path from 'node:path';`r`nimport os from 'node:os';"
$marker = "export function selfTest() {"
$insert = @'
export function counterproofTamperedIdentity() {
  const identity = resolvePdfReference();
  if (identity.status !== 'PROVED_IN_SCOPE' || !identity.path) {
    return {
      passed: false,
      reason: 'CANONICAL_IDENTITY_NOT_PROVED_BEFORE_COUNTERPROOF',
      identity,
    };
  }

  const dir = mkdtempSync(path.join(os.tmpdir(), 'centraldark-pdf-gate-'));
  try {
    const bytes = Buffer.from(readFileSync(identity.path));
    bytes[0] = bytes[0] ^ 0xff;
    const tamperedPath = path.join(dir, path.basename(identity.path));
    writeFileSync(tamperedPath, bytes);
    const tampered = inspectArtifact(tamperedPath);
    return {
      passed: tampered.status === 'REFUTED_IN_SCOPE' && tampered.reason === 'BYTE_IDENTITY_MISMATCH',
      reason: tampered.reason,
      tamperedStatus: tampered.status,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

'@
if ($src -notlike '*counterproofTamperedIdentity*') {
  $src = $src.Replace($marker, $insert + $marker)
}
$gate = @'
export function runPdfGate() {
  const self = selfTest();
  const identity = resolvePdfReference();
  const counterproof = counterproofTamperedIdentity();
  const passed = self.status === 'PASS' &&
    identity.status === 'PROVED_IN_SCOPE' &&
    counterproof.passed === true;

  return {
    schema: 'centraldark.pdf_gate.v1',
    status: passed ? 'PDF_GATE_PASS' : 'PDF_GATE_FAIL_CLOSED',
    final_pass_claimed: passed,
    pdf_gate_promoted: passed,
    required_chain: ['TLC23_SOURCE_IDENTITY', 'SELF_TEST', 'COUNTERPROOF_TAMPER_REJECTED', 'PASS'],
    checks: {
      tlc23_identity: identity.status,
      byte_identity_match: identity.identityMatch === true,
      self_test: self.status,
      counterproof_tamper_rejected: counterproof.passed === true,
    },
    source: CC2003_SOURCE,
    identity,
    counterproof,
  };
}

'@
if ($src -notlike '*export function runPdfGate()*') {
  $src = $src.Replace("function main() {", $gate + "function main() {")
}
$mainNeedle = "function main() {`r`n  if (process.argv.includes('--self-test')) {"
$mainPatch = "function main() {`r`n  if (process.argv.includes('--gate')) {`r`n    const gate = runPdfGate();`r`n    console.log(JSON.stringify(gate, null, 2));`r`n    process.exit(gate.status === 'PDF_GATE_PASS' ? 0 : 1);`r`n  }`r`n`r`n  if (process.argv.includes('--self-test')) {"
if ($src -notlike "*process.argv.includes('--gate')*") {
  $src = $src.Replace($mainNeedle, $mainPatch)
}
Set-Content -LiteralPath $mjs -Value $src -Encoding UTF8

$run = Get-Content -Raw -LiteralPath $runner
$run = $run.Replace("$commandDesc = ''`r`n$exitCode = 99", "$commandDesc = ''`r`n$exitCode = 99`r`n$PdfGatePromoted = $false")
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
    $commandDesc = 'pdf-conformance-cc2003 --gate + node:test counterproof'
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
          Write-Output 'REQUIRED_CHAIN=TLC23_SOURCE_IDENTITY->SELF_TEST->COUNTERPROOF->NODE_TEST->PASS'
          $script:PdfGatePromoted = $true
          $global:LASTEXITCODE = 0
        } else {
          Write-Output ('PDF_GATE_PROMOTED=false gateCode=' + $gateCode + ' testCode=' + $testCode)
          $global:LASTEXITCODE = 1
        }
      } finally {
        Pop-Location
      }
    }
  }
'@
if ($run -notlike '*node:test counterproof*') {
  $run = $run.Replace($old, $new)
}
$run = $run.Replace("final_pass_claimed=$false`r`n  pdf_gate_promoted=$false", "final_pass_claimed=$(if($Sector -eq 'PDF_GATE' -and $exitCode -eq 0 -and $PdfGatePromoted){$true}else{$false})`r`n  pdf_gate_promoted=$(if($Sector -eq 'PDF_GATE' -and $exitCode -eq 0 -and $PdfGatePromoted){$true}else{$false})")
Set-Content -LiteralPath $runner -Value $run -Encoding UTF8
Write-Output 'PATCHED_PDF_GATE_FINAL_PASS=true'

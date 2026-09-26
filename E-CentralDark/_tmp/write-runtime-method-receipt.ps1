$ErrorActionPreference='Stop'
$repo='E:\CentralDark\CentralDark'
$receiptDir='E:\CentralDark\runtime\receipts'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$receiptPath=Join-Path $receiptDir ('RUNTIME-METHOD-CRYSTAL-' + $stamp + '.json')
$targets=@(
  'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/UNIVERSAL-ENGINE-METHOD.yml',
  'apps/modulos/HERMES-CORE/core/universal-method-contract.mjs',
  'apps/modulos/HERMES-CORE/prompts/hermes-core.md'
)
$testOutput=& node (Join-Path $repo 'apps\modulos\HERMES-CORE\core\universal-method-contract.mjs') --self-test 2>&1
$testExit=$LASTEXITCODE
$files=foreach($rel in $targets){
  $abs=Join-Path $repo $rel
  [pscustomobject]@{ path=$rel; sha256=(Get-FileHash -Algorithm SHA256 -LiteralPath $abs).Hash.ToLowerInvariant() }
}
$receipt=[ordered]@{
  schema='centraldark.runtime-method-crystal.receipt.v1'
  observed_at=(Get-Date).ToString('o')
  branch=(& git -C $repo branch --show-current)
  head=(& git -C $repo rev-parse HEAD)
  delta='FAILURE_AUTO_RESEARCH_AND_NO_PROOF_NO_PASS'
  rules=@('NO_PROOF_NO_PASS','FAILURE_OPENS_INVESTIGATION','UNRESOLVED_FAILURE_AUTO_RESEARCH','OFFICIAL_SOURCE_FIRST','CORRECTION_TARGETS_SMALLEST_EXISTING_OWNER','RETEST_AFTER_CORRECTION_REQUIRED','CORRECTION_RECEIPT_REQUIRED')
  failure_found='ENGINE_REGISTRY_SECTION_MISSING'
  root_cause='validator parser was CRLF-sensitive'
  correction='normalize CRLF before parsing ENGINE_BINDING registry'
  test='node apps/modulos/HERMES-CORE/core/universal-method-contract.mjs --self-test'
  test_exit_code=$testExit
  test_pass=($testExit -eq 0 -and (($testOutput -join [Environment]::NewLine) -match 'UNIVERSAL_ENGINE_METHOD_SELF_TEST=PASS'))
  files=$files
  pdf_gate_promoted=$false
  reality_is_judge=$true
  unknown_is_not_pass=$true
}
$receipt | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $receiptPath -Encoding UTF8
Write-Output ('RECEIPT=' + $receiptPath)
Write-Output ('TEST_EXIT=' + $testExit)
Write-Output ($testOutput | Select-Object -Last 1)
exit $testExit
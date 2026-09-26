$ErrorActionPreference='Stop'
$tar='E:\CentralDark\_tmp\centraldark-main-auth.tar.gz'
$root='E:\CentralDark\_tmp\centraldark-main-auth'
if(Test-Path -LiteralPath $root){Remove-Item -LiteralPath $root -Recurse -Force}
New-Item -ItemType Directory -Force -Path $root | Out-Null
& tar -xzf $tar -C $root
if($LASTEXITCODE -ne 0){throw "TAR_EXTRACT_FAILED:$LASTEXITCODE"}
$repo=(Get-ChildItem -LiteralPath $root -Directory | Select-Object -First 1).FullName
if(-not $repo){throw 'REPO_NOT_FOUND'}
Push-Location $repo
try {
  Write-Output ('VERIFY_ROOT='+$repo)
  & node scripts/lupa/validar-interligados-pr-padroes.mjs
  $inter=$LASTEXITCODE
  Write-Output ('INTERLIGADOS_EXIT='+$inter)

  & node --test scripts/lupa/validar-identidade-operacional.test.mjs
  $idtest=$LASTEXITCODE
  Write-Output ('IDENTITY_TEST_EXIT='+$idtest)

  & python scripts/trigger-fabric/verify_repo_contract.py .
  $contract=$LASTEXITCODE
  Write-Output ('REPO_CONTRACT_EXIT='+$contract)

  if($inter -eq 0 -and $idtest -eq 0 -and $contract -eq 0){
    Write-Output 'CURRENT_MAIN_VALIDATION=PASS'
    exit 0
  }
  Write-Output 'CURRENT_MAIN_VALIDATION=FAIL'
  exit 1
} finally {
  Pop-Location
}

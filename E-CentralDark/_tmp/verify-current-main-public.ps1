$ErrorActionPreference='Stop'
$zip='E:\CentralDark\_tmp\centraldark-main-current.zip'
$root='E:\CentralDark\_tmp\centraldark-main-current'
if(Test-Path -LiteralPath $zip){Remove-Item -LiteralPath $zip -Force}
if(Test-Path -LiteralPath $root){Remove-Item -LiteralPath $root -Recurse -Force}
Invoke-WebRequest -Uri 'https://codeload.github.com/ServerVpss/CentralDark/zip/refs/heads/main' -OutFile $zip
Expand-Archive -LiteralPath $zip -DestinationPath $root -Force
$repo=(Get-ChildItem -LiteralPath $root -Directory | Select-Object -First 1).FullName
if(-not $repo){throw 'EXTRACTED_REPO_NOT_FOUND'}
Push-Location $repo
try {
  Write-Output ('VERIFY_ROOT='+$repo)
  & node scripts/lupa/validar-interligados-pr-padroes.mjs
  $a=$LASTEXITCODE
  Write-Output ('INTERLIGADOS_EXIT='+$a)
  & node --test scripts/lupa/validar-identidade-operacional.test.mjs
  $b=$LASTEXITCODE
  Write-Output ('IDENTITY_TEST_EXIT='+$b)
  & python scripts/trigger-fabric/verify_repo_contract.py .
  $c=$LASTEXITCODE
  Write-Output ('REPO_CONTRACT_EXIT='+$c)
  if($a -or $b -or $c){exit 1}
  Write-Output 'CURRENT_MAIN_VALIDATION=PASS'
} finally { Pop-Location }

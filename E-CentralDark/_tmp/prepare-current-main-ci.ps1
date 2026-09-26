$ErrorActionPreference='Stop'
$dst='E:\CentralDark\_tmp\centraldark-ci-main-20260919'
if(Test-Path -LiteralPath $dst){ Remove-Item -LiteralPath $dst -Recurse -Force }
& gh repo clone ServerVpss/CentralDark $dst -- --depth 1 --branch main
if($LASTEXITCODE -ne 0){ throw "CLONE_FAILED:$LASTEXITCODE" }
Push-Location $dst
try {
  Write-Output ('HEAD=' + (git rev-parse HEAD))
  node scripts/lupa/validar-interligados-pr-padroes.mjs
  Write-Output ('INTERLIGADOS_EXIT=' + $LASTEXITCODE)
  python scripts/trigger-fabric/verify_repo_contract.py .
  Write-Output ('REPO_CONTRACT_EXIT=' + $LASTEXITCODE)
} finally { Pop-Location }

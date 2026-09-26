$ErrorActionPreference='Stop'
$root='E:\CentralDark\_tmp\verify-main-49b7d07'
$tar='E:\CentralDark\_tmp\verify-main-49b7d07.tar.gz'
if(Test-Path -LiteralPath $root){ Remove-Item -LiteralPath $root -Recurse -Force }
if(Test-Path -LiteralPath $tar){ Remove-Item -LiteralPath $tar -Force }
New-Item -ItemType Directory -Force -Path $root | Out-Null

$token = (& gh auth token).Trim()
if(-not $token){ throw 'GH_TOKEN_UNAVAILABLE' }
$headers=@{
  Authorization="Bearer $token"
  Accept="application/vnd.github+json"
  'X-GitHub-Api-Version'='2022-11-28'
}
Invoke-WebRequest -Uri 'https://api.github.com/repos/ServerVpss/CentralDark/tarball/main' -Headers $headers -OutFile $tar -MaximumRedirection 5

& tar -xzf $tar -C $root
if($LASTEXITCODE -ne 0){ throw "TAR_EXTRACT_FAILED:$LASTEXITCODE" }

$repo=(Get-ChildItem -LiteralPath $root -Directory | Select-Object -First 1).FullName
if(-not $repo){ throw "EXTRACTED_REPO_NOT_FOUND" }

Push-Location $repo
try {
  Write-Output ('VERIFY_ROOT=' + $repo)
  Write-Output ('EXPECTED_HEAD=49b7d075a5c47deb1c0b4f977df4a60b6a78fa6f')

  & node scripts/lupa/validar-interligados-pr-padroes.mjs
  $inter=$LASTEXITCODE
  Write-Output ('INTERLIGADOS_EXIT=' + $inter)

  & node --test scripts/lupa/validar-identidade-operacional.test.mjs
  $identityTest=$LASTEXITCODE
  Write-Output ('IDENTITY_TEST_EXIT=' + $identityTest)

  & node scripts/lupa/validar-identidade-operacional.mjs --repo-root .
  $identity=$LASTEXITCODE
  Write-Output ('IDENTITY_GATE_EXIT=' + $identity)

  & python scripts/trigger-fabric/verify_repo_contract.py .
  $repoContract=$LASTEXITCODE
  Write-Output ('REPO_CONTRACT_EXIT=' + $repoContract)

  if($inter -ne 0 -or $identityTest -ne 0 -or $identity -ne 0 -or $repoContract -ne 0){
    exit 1
  }
  Write-Output 'CURRENT_MAIN_VALIDATION=PASS'
  exit 0
} finally {
  Pop-Location
}

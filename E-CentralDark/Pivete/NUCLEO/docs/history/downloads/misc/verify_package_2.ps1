$ErrorActionPreference="Stop"
$Root=Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$M=Join-Path $Root "PACKAGE_MANIFEST.sha256"
$fail=$false
Get-Content $M | ForEach-Object {
 if($_ -match '^([0-9a-f]{64})  (.+)$'){
  $e=$Matches[1]; $r=$Matches[2]; $p=Join-Path $Root $r
  if(!(Test-Path $p) -or ((Get-FileHash -Algorithm SHA256 $p).Hash.ToLower() -ne $e)){$fail=$true;Write-Host "FAIL $r"}
 }
}
if($fail){Write-Host "PACKAGE_VERIFY=FAIL";exit 1}
Write-Host "PACKAGE_VERIFY=PASS"

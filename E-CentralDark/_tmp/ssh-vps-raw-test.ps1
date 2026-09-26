$ErrorActionPreference = 'Continue'
$out='E:\CentralDark\_tmp\ssh-vps-raw-test.out.txt'
$err='E:\CentralDark\_tmp\ssh-vps-raw-test.err.txt'
Remove-Item -LiteralPath $out,$err -Force -ErrorAction SilentlyContinue
& C:\Windows\System32\OpenSSH\ssh.exe -F "$env:USERPROFILE\.ssh\config" -o BatchMode=yes -o ConnectTimeout=10 -vvv segredo-vpss 'echo SSH_OK; hostname; date -Is' 1>$out 2>$err
$code=$LASTEXITCODE
Write-Host "SSH_EXIT=$code"
Write-Host '--- OUT ---'
if(Test-Path $out){Get-Content -LiteralPath $out -Raw}
Write-Host '--- ERR HEAD ---'
if(Test-Path $err){Get-Content -LiteralPath $err | Select-Object -First 120}
exit $code

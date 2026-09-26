$ErrorActionPreference='Stop'
$payload = Get-Content -Raw -LiteralPath 'E:\CentralDark\_tmp\probe-cloudflare-fixedpoint.sh'
$payload | & ssh.exe segredo-vpss 'bash -s'
exit $LASTEXITCODE

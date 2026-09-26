$ErrorActionPreference='Stop'
$payload = Get-Content -LiteralPath 'E:\CentralDark\_tmp\probe-vps-reconciliation.sh' -Raw
$payload | & ssh segredo-vpss bash -s
exit $LASTEXITCODE

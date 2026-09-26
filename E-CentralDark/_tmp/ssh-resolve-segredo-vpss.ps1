$ErrorActionPreference='Continue'
$out = & ssh -G segredo-vpss 2>&1
$out | Where-Object { $_ -match '^(hostname|user|port)\s' }
exit $LASTEXITCODE

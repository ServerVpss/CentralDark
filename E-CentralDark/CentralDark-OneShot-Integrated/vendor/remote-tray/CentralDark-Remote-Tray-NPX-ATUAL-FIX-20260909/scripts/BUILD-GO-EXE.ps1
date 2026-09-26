$ErrorActionPreference='Stop'
$Root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Go=Get-Command go.exe -ErrorAction SilentlyContinue
if(-not $Go){$Go=Get-Command go -ErrorAction SilentlyContinue}
if(-not $Go){throw 'Go nao encontrado. Use o EXE ja buildado ou instale Go para rebuild.'}
Push-Location (Join-Path $Root 'launcher')
try{
    $env:GOOS='windows'
    $env:GOARCH='amd64'
    & $Go.Source build -ldflags '-H windowsgui -s -w' -o (Join-Path $Root 'CentralDark-Remote-Tray.exe') .
    if($LASTEXITCODE -ne 0){throw 'go build falhou'}
} finally { Pop-Location }
$exe=Join-Path $Root 'CentralDark-Remote-Tray.exe'
$hash=(Get-FileHash $exe -Algorithm SHA256).Hash
"EXE=$exe"
"SHA256=$hash"

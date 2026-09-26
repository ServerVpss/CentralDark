$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Src = Join-Path $Root 'src\CentralDarkBridge.cs'
$Dist = Join-Path $Root 'dist'
$Exe = Join-Path $Dist 'CentralDarkBridge.exe'

if (-not $IsWindows -and $PSVersionTable.PSEdition -eq 'Core') {
  throw 'Este builder gera o .EXE no Windows. Execute no SEGREDO/Windows.'
}

New-Item -ItemType Directory -Force -Path $Dist | Out-Null
if (Test-Path $Exe) { Remove-Item -LiteralPath $Exe -Force }

$code = Get-Content -LiteralPath $Src -Raw
Add-Type -TypeDefinition $code `
  -Language CSharp `
  -ReferencedAssemblies @('System.dll','System.Drawing.dll','System.Windows.Forms.dll') `
  -OutputAssembly $Exe `
  -OutputType WindowsApplication

if (-not (Test-Path $Exe)) { throw 'BUILD_FAIL: CentralDarkBridge.exe não foi produzido.' }
$hash = (Get-FileHash -LiteralPath $Exe -Algorithm SHA256).Hash
$size = (Get-Item -LiteralPath $Exe).Length

@{
  artifact = 'CentralDarkBridge.exe'
  sha256 = $hash
  size = $size
  built_at = (Get-Date).ToString('o')
  machine = $env:COMPUTERNAME
  unknown_is_not_pass = $true
} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $Dist 'BUILD-RECEIPT.json') -Encoding UTF8

Write-Host ""
Write-Host "BUILD=PASS"
Write-Host "EXE=$Exe"
Write-Host "SHA256=$hash"
Write-Host "SIZE=$size"

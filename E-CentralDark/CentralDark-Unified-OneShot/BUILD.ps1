$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Src = Join-Path $Root 'src\CentralDarkBridge.cs'
$Dist = Join-Path $Root 'dist'
$Exe = Join-Path $Dist 'CentralDarkBridge.exe'

$isWindowsHost = ($env:OS -eq 'Windows_NT') -or ([System.Environment]::OSVersion.Platform -eq [System.PlatformID]::Win32NT)
if (-not $isWindowsHost) {
  throw 'Este builder gera o .EXE no Windows. Execute no SEGREDO/Windows.'
}
if (-not (Test-Path -LiteralPath $Src)) {
  throw "SOURCE_ABSENT: $Src"
}

New-Item -ItemType Directory -Force -Path $Dist | Out-Null
if (Test-Path -LiteralPath $Exe) { Remove-Item -LiteralPath $Exe -Force }

$code = Get-Content -LiteralPath $Src -Raw
Add-Type -TypeDefinition $code `
  -Language CSharp `
  -ReferencedAssemblies @('System.dll','System.Drawing.dll','System.Windows.Forms.dll') `
  -OutputAssembly $Exe `
  -OutputType WindowsApplication

if (-not (Test-Path -LiteralPath $Exe)) {
  throw 'BUILD_FAIL: CentralDarkBridge.exe não foi produzido.'
}

$hash = (Get-FileHash -LiteralPath $Exe -Algorithm SHA256).Hash
$size = (Get-Item -LiteralPath $Exe).Length
$receipt = @{
  artifact = 'CentralDarkBridge.exe'
  sha256 = $hash
  size = $size
  built_at = (Get-Date).ToString('o')
  machine = $env:COMPUTERNAME
  powershell = $PSVersionTable.PSVersion.ToString()
  unknown_is_not_pass = $true
}
$receipt | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $Dist 'BUILD-RECEIPT.json') -Encoding UTF8

Write-Host ''
Write-Host 'BUILD=PASS'
Write-Host "EXE=$Exe"
Write-Host "SHA256=$hash"
Write-Host "SIZE=$size"
exit 0

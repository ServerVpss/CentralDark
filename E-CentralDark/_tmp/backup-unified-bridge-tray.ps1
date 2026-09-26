$ErrorActionPreference='Stop'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$files=@(
 'E:\CentralDark\CentralDark-Unified-OneShot\src\CentralDarkBridge.cs',
 'E:\CentralDark\CentralDark-Unified-OneShot\integration\RUN-ALL.ps1'
)
foreach($f in $files){
  Copy-Item -LiteralPath $f -Destination ($f+'.bak-'+$stamp) -Force
  Write-Host ('BACKUP='+$f+'.bak-'+$stamp)
}

$files=@(
 'E:\CentralDark\CentralDark-Unified-OneShot\dist\CentralDarkBridge.exe',
 'E:\CentralDark\CentralDark-Unified-OneShot\src\CentralDarkBridge.cs',
 'E:\CentralDark\CentralDark-Unified-OneShot\integration\RUN-ALL.ps1'
)
$out=foreach($f in $files){
 if(Test-Path -LiteralPath $f){
  $i=Get-Item -LiteralPath $f
  [pscustomobject]@{path=$f;sha256=(Get-FileHash -LiteralPath $f -Algorithm SHA256).Hash;size=$i.Length;last_write=$i.LastWriteTime.ToString('o')}
 }
}
$out|ConvertTo-Json -Depth 4
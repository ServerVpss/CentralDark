$ErrorActionPreference='SilentlyContinue'
$pkgs=Get-AppxPackage | Where-Object { $_.Name -match 'ChatGPT|OpenAI' -or $_.PackageFullName -match 'ChatGPT|OpenAI' } |
 Select-Object Name,PackageFullName,Version,InstallLocation,Publisher,Architecture,Status

$proc=Get-CimInstance Win32_Process | Where-Object { $_.Name -in @('ChatGPT.exe','codex.exe','codex-computer-use-swift.exe','codex-code-mode-host.exe','AppActions.exe') } |
 Select-Object ProcessId,ParentProcessId,Name,ExecutablePath

$roots=@(
 'C:\Users\Administrador\AppData\Local\Packages',
 'C:\Users\Administrador\AppData\Roaming',
 'C:\Users\Administrador\AppData\Local'
)
$candidates=@()
foreach($r in $roots){
 if(Test-Path $r){
  $candidates += Get-ChildItem -LiteralPath $r -Directory -ErrorAction SilentlyContinue |
   Where-Object { $_.Name -match 'ChatGPT|OpenAI' } |
   Select-Object FullName,Name,LastWriteTime
 }
}
[pscustomobject]@{
 packages=$pkgs
 processes=$proc
 appdata_candidates=$candidates
}|ConvertTo-Json -Depth 6
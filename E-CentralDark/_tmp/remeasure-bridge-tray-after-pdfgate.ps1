$ErrorActionPreference='SilentlyContinue'
$unified='E:\CentralDark\CentralDark-Unified-OneShot'
$bridge=Join-Path $unified 'dist\CentralDarkBridge.exe'
$runtime=Join-Path $env:LOCALAPPDATA 'CentralDark\UnifiedRuntime'
$remoteRuntime=Join-Path $env:LOCALAPPDATA 'CentralDark\Remote-Tray'
$device=Join-Path $env:USERPROFILE '.desktop-commander-device\device.json'
$procs=Get-Process -Name 'CentralDarkBridge','screenpipe-app','Hermes' -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,StartTime,Path
$trayReceipts=@()
if(Test-Path $remoteRuntime){
 $trayReceipts=Get-ChildItem -LiteralPath $remoteRuntime -Recurse -File -Filter '*.json' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 5 FullName,LastWriteTime,Length
}
[pscustomobject]@{
 observed_at=(Get-Date).ToString('o')
 unified_exists=(Test-Path $unified)
 bridge_exe_exists=(Test-Path $bridge)
 unified_runtime_exists=(Test-Path $runtime)
 remote_tray_runtime_exists=(Test-Path $remoteRuntime)
 persisted_device_config_exists=(Test-Path $device)
 processes=$procs
 recent_tray_receipts=$trayReceipts
}|ConvertTo-Json -Depth 6
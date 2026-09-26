$ErrorActionPreference='Continue'
Write-Output ('NOW=' + (Get-Date).ToString('o'))
Write-Output '===PROCESSES==='
Get-Process screenpipe-app,Hermes,CentralDarkBridge -ErrorAction SilentlyContinue | Select-Object ProcessName,Id,StartTime | Format-Table -AutoSize
Write-Output '===UNIFIED==='
Write-Output ('UNIFIED_EXISTS=' + (Test-Path 'E:\CentralDark\CentralDark-Unified-OneShot'))
Write-Output ('BRIDGE_EXE_EXISTS=' + (Test-Path 'E:\CentralDark\CentralDark-Unified-OneShot\dist\CentralDarkBridge.exe'))
Write-Output ('UNIFIED_RUNTIME_EXISTS=' + (Test-Path "$env:LOCALAPPDATA\CentralDark\UnifiedRuntime"))
Write-Output ('DEVICE_CONFIG_EXISTS=' + (Test-Path "$env:USERPROFILE\.desktop-commander-device\device.json"))

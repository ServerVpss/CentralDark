$ErrorActionPreference='Stop'
$exe='E:\CentralDark\CentralDark-Unified-OneShot\dist\CentralDarkBridge.exe'
$state='C:\Users\Administrador\AppData\Local\CentralDark\UnifiedRuntime\bridge-state.json'

Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class Win32BridgeProbe {
  [DllImport("user32.dll")]
  public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")]
  public static extern bool IsWindowVisible(IntPtr hWnd);
}
'@

Get-Process -Name CentralDarkBridge -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Milliseconds 300

$p1=Start-Process -FilePath $exe -WorkingDirectory (Split-Path -Parent $exe) -PassThru
try { $null=$p1.WaitForInputIdle(5000) } catch {}
Start-Sleep -Milliseconds 700
$p1.Refresh()
$pid1=$p1.Id
$h1=$p1.MainWindowHandle
$visibleBefore=if($h1 -ne [IntPtr]::Zero){[Win32BridgeProbe]::IsWindowVisible($h1)}else{$false}

if($h1 -eq [IntPtr]::Zero){ throw 'MAIN_WINDOW_HANDLE_NOT_FOUND' }
[Win32BridgeProbe]::ShowWindowAsync($h1,6) | Out-Null
Start-Sleep -Milliseconds 1000
$visibleAfterMin=[Win32BridgeProbe]::IsWindowVisible($h1)
$stateAfterMin=if(Test-Path $state){Get-Content -Raw $state | ConvertFrom-Json}else{$null}

$p2=Start-Process -FilePath $exe -WorkingDirectory (Split-Path -Parent $exe) -PassThru
try { $p2.WaitForExit(5000) | Out-Null } catch {}
Start-Sleep -Milliseconds 1200

$live=@(Get-Process -Name CentralDarkBridge -ErrorAction SilentlyContinue)
$originalStillAlive=(@($live | Where-Object Id -eq $pid1).Count -eq 1)
$p1=Get-Process -Id $pid1 -ErrorAction SilentlyContinue
$h2=if($p1){$p1.MainWindowHandle}else{[IntPtr]::Zero}
$visibleAfterRestore=if($h2 -ne [IntPtr]::Zero){[Win32BridgeProbe]::IsWindowVisible($h2)}else{$false}
$stateAfterRestore=if(Test-Path $state){Get-Content -Raw $state | ConvertFrom-Json}else{$null}

$result=[ordered]@{
 observed_at=(Get-Date).ToString('o')
 pid_original=$pid1
 window_handle_before=[int64]$h1
 visible_before=$visibleBefore
 visible_after_minimize=$visibleAfterMin
 state_after_minimize=if($stateAfterMin){$stateAfterMin.state}else{$null}
 second_launch_pid=$p2.Id
 second_launch_exited=$p2.HasExited
 process_count_after_second_launch=@($live).Count
 original_pid_still_alive=$originalStillAlive
 visible_after_restore=$visibleAfterRestore
 state_after_restore=if($stateAfterRestore){$stateAfterRestore.state}else{$null}
 same_process_proved=($visibleBefore -and (-not $visibleAfterMin) -and $originalStillAlive -and (@($live).Count -eq 1) -and $visibleAfterRestore -and $stateAfterMin.state -eq 'TRAY_MINIMIZED' -and $stateAfterRestore.state -eq 'RESTORED')
}
$receiptDir='C:\Users\Administrador\AppData\Local\CentralDark\UnifiedRuntime\receipts'
New-Item -ItemType Directory -Force -Path $receiptDir | Out-Null
$receiptPath=Join-Path $receiptDir 'bridge-tray-same-process-latest.json'
$result | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $receiptPath -Encoding UTF8
Write-Host ('RECEIPT='+$receiptPath)
$result | ConvertTo-Json -Depth 6
if(-not $result.same_process_proved){ exit 9 }

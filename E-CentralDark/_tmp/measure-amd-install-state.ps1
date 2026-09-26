$ErrorActionPreference='SilentlyContinue'
$installers=Get-CimInstance Win32_Process | Where-Object {
  $_.Name -match 'msiexec|setup|install|AMD.*Console|Manageability|AIMT|DASH'
} | Select-Object Name,ProcessId,ExecutablePath,CommandLine
$reboot=@{
 CBS=(Test-Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Component Based Servicing\RebootPending')
 WU=(Test-Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update\RebootRequired')
 PFRO=((Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager' -Name PendingFileRenameOperations -ErrorAction SilentlyContinue).PendingFileRenameOperations -ne $null)
}
[pscustomobject]@{installers=$installers;reboot=$reboot}|ConvertTo-Json -Depth 6
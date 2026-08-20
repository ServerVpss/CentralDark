$ErrorActionPreference='Continue'
Write-Output '=== CENTRALDARK CASA READ-ONLY SECURITY AUDIT ==='
try{Get-NetFirewallProfile|Select Name,Enabled,DefaultInboundAction,DefaultOutboundAction|Format-Table -AutoSize}catch{}
try{Get-MpComputerStatus|Select AMServiceEnabled,AntivirusEnabled,RealTimeProtectionEnabled,BehaviorMonitorEnabled,AntivirusSignatureLastUpdated|Format-List}catch{}
try{Get-NetTCPConnection -State Listen|Select LocalAddress,LocalPort,OwningProcess|Sort LocalPort|Format-Table -AutoSize}catch{}
try{Get-BitLockerVolume|Select MountPoint,VolumeStatus,ProtectionStatus,EncryptionPercentage|Format-Table -AutoSize}catch{}
try{Get-LocalGroupMember -Group 'Administrators'|Select Name,ObjectClass,PrincipalSource|Format-Table -AutoSize}catch{}
Write-Output '=== END ==='

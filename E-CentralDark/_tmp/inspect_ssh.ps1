$out='E:\CentralDark\_tmp\ssh_channels.txt'
Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'ssh.exe' } |
  Select-Object ProcessId,CommandLine |
  Format-List | Out-String | Set-Content -Path $out -Encoding UTF8
Get-NetTCPConnection -State Established -ErrorAction SilentlyContinue |
  Where-Object { $_.RemotePort -eq 22 } |
  Select-Object OwningProcess,LocalAddress,LocalPort,RemoteAddress,RemotePort,State |
  Format-Table -AutoSize | Out-String | Add-Content -Path $out

$keys=@(
 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
 'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*',
 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*'
)
$apps=foreach($k in $keys){
 Get-ItemProperty $k -ErrorAction SilentlyContinue |
  Where-Object { $_.DisplayName -match 'AMD.*Manage|DASH|AIM-T|Management Console' } |
  Select-Object DisplayName,DisplayVersion,Publisher,InstallDate,InstallLocation,UninstallString,PSPath
}
$apps|Sort-Object DisplayName,DisplayVersion -Unique|ConvertTo-Json -Depth 5
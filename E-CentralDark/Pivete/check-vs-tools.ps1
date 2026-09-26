$sh = New-Object -ComObject WScript.Shell
$lnk1 = $sh.CreateShortcut('C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Visual Studio\Visual Studio Tools\Developer Command Prompt for VS.lnk')
$lnk2 = $sh.CreateShortcut('C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Visual Studio\Visual Studio Tools\Developer PowerShell for VS.lnk')

Write-Host "=== Developer Command Prompt for VS ==="
Write-Host "Target: $($lnk1.TargetPath)"
Write-Host "Args: $($lnk1.Arguments)"
Write-Host "Working Dir: $($lnk1.WorkingDirectory)"
Write-Host ""
Write-Host "=== Developer PowerShell for VS ==="
Write-Host "Target: $($lnk2.TargetPath)"
Write-Host "Args: $($lnk2.Arguments)"
Write-Host "Working Dir: $($lnk2.WorkingDirectory)"
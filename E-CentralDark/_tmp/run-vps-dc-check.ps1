$ErrorActionPreference = 'Stop'
$bashPath = 'E:\CentralDark\_tmp\vps-dc-check.sh'
$outPath = 'E:\CentralDark\_tmp\vps-dc-check-output.txt'
$errPath = 'E:\CentralDark\_tmp\vps-dc-check-error.txt'

$bash = Get-Content -LiteralPath $bashPath -Raw
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = 'ssh'
$psi.ArgumentList.Add('segredo-vpss')
$psi.ArgumentList.Add('bash')
$psi.ArgumentList.Add('-s')
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$p = [System.Diagnostics.Process]::Start($psi)
$p.StandardInput.Write($bash)
$p.StandardInput.Close()
$stdout = $p.StandardOutput.ReadToEnd()
$stderr = $p.StandardError.ReadToEnd()
$p.WaitForExit()
$stdout | Set-Content -LiteralPath $outPath -Encoding UTF8
$stderr | Set-Content -LiteralPath $errPath -Encoding UTF8
Write-Host "EXIT=$($p.ExitCode)"
Write-Host "OUT=$outPath"
Write-Host "ERR=$errPath"
Write-Host $stdout
if ($stderr) { Write-Host '--- STDERR ---'; Write-Host $stderr }
exit $p.ExitCode

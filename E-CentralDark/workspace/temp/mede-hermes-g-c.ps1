Write-Host "=== HERMES no G: (o antigo) ==="
Get-ChildItem "G:\Users\danda\.hermes" -Force -ErrorAction SilentlyContinue | Select-Object Name, LastWriteTime | Format-Table -AutoSize
Write-Host ""
Write-Host "=== HERMES no C: (o atual) ==="
Get-ChildItem "C:\Users\danda\.hermes" -Force -ErrorAction SilentlyContinue | Select-Object Name, LastWriteTime | Format-Table -AutoSize
Write-Host ""
Write-Host "=== onde esta o .git da Casa ==="
foreach ($p in @("C:\CentralDark\.git","C:\CentralDark\Pivete\.git","C:\CentralDark\Pivete\CentralDark\.git","G:\CentralDark\.git")) {
  if (Test-Path $p) { Write-Host ("ACHOU: " + $p) } else { Write-Host ("nao: " + $p) }
}
Write-Host ""
Write-Host "=== tamanho da Casa (pra saber se cabe) ==="
$s = (Get-ChildItem "C:\CentralDark" -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
Write-Host ("C:\CentralDark = " + [math]::Round($s/1GB,2) + " GB")
Write-Host ("G: livre = " + [math]::Round((Get-Volume -DriveLetter G).SizeRemaining/1GB,1) + " GB")

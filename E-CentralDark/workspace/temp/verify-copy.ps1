$o = Get-ChildItem "C:\CentralDark" -Recurse -Force -ErrorAction SilentlyContinue
$c = $o.Count
$gb = [math]::Round(($o | Measure-Object Length -Sum).Sum/1GB,2)
Write-Host "Origem: $c itens, $gb GB"

$d = Get-ChildItem "G:\CentralDark" -Recurse -Force -ErrorAction SilentlyContinue
$c2 = $d.Count
$gb2 = [math]::Round(($d | Measure-Object Length -Sum).Sum/1GB,2)
Write-Host "Destino: $c2 itens, $gb2 GB"

if ($c -eq $c2) { Write-Host "OK: mesma contagem" -ForegroundColor Green }
else { Write-Host "DIVERGENCIA: origem=$c destino=$c2" -ForegroundColor Red }
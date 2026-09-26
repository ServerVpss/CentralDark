$d = Get-ChildItem 'G:\CentralDark' -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum
$count = $d.Count
$size = [math]::Round($d.Sum/1GB,2)
Write-Host "G:\CentralDark: $count itens, $size GB"

$o = Get-ChildItem 'C:\CentralDark\Pivete\CentralDark' -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object
$count2 = $o.Count
Write-Host "C:\CentralDark\Pivete\CentralDark: $count2 itens"
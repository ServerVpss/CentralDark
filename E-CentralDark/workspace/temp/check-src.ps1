$d = Get-ChildItem 'C:\CentralDark\Pivete\CentralDark' -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object
$count = $d.Count
$size = [math]::Round(($d | Measure-Object Length -Sum).Sum/1GB,2)
Write-Host ("C:\CentralDark\Pivete\CentralDark: $count itens, $size GB")
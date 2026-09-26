$d = Get-ChildItem 'G:\CentralDark' -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum
Write-Host ("G:\CentralDark = " + [math]::Round($d.Sum/1GB,2) + " GB")

$o = Get-ChildItem 'C:\CentralDark\Pivete\CentralDark' -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum
Write-Host ("C:\CentralDark\Pivete\CentralDark = " + [math]::Round($o.Sum/1GB,2) + " GB")
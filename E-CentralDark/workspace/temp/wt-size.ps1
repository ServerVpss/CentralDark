$path = 'C:\CentralDark\Pivete\worktrees'
$dirs = Get-ChildItem -Path $path -Directory -ErrorAction SilentlyContinue
foreach ($d in $dirs) {
    $files = Get-ChildItem -Path $d.FullName -Recurse -File -ErrorAction SilentlyContinue
    $sumBytes = ($files | Measure-Object -Property Length -Sum).Sum
    if (-not $sumBytes) { $sumBytes = 0 }
    $gb = [math]::Round($sumBytes / 1GB, 2)
    Write-Output ($d.Name + " = " + $gb + " GB")
}
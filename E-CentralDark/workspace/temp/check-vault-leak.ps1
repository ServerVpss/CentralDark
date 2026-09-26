$root = 'C:\CentralDark'
$mdFiles = Get-ChildItem -Path $root -Recurse -File -Include *.md,*.canvas -ErrorAction SilentlyContinue
$all = $mdFiles.Count
$nm = ($mdFiles | Where-Object { $_.FullName.Contains('node_modules') }).Count
Write-Output "Total=$all"
Write-Output "NodeModules=$nm"
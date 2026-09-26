Write-Host "=== ANTES: contagem e tamanho na origem ==="
$origem = Get-ChildItem "C:\CentralDark" -Recurse -Force -ErrorAction SilentlyContinue
$origemCount = $origem.Count
$origemGB = [math]::Round(($origem | Measure-Object Length -Sum).Sum/1GB,2)
Write-Host "Origem: $origemCount itens, $origemGB GB"

Write-Host "=== COPIANDO (robocopy, resumivel, preserva tudo) ==="
robocopy "C:\CentralDark" "G:\CentralDark" /E /COPY:DAT /DCOPY:DAT /R:2 /W:2 /MT:8 /NFL /NDL /XJ

Write-Host "=== DEPOIS: contagem e tamanho no destino ==="
$destino = Get-ChildItem "G:\CentralDark" -Recurse -Force -ErrorAction SilentlyContinue
$destinoCount = $destino.Count
$destinoGB = [math]::Round(($destino | Measure-Object Length -Sum).Sum/1GB,2)
Write-Host "Destino: $destinoCount itens, $destinoGB GB"

Write-Host "=== VEREDITO ==="
if ($origemCount -eq $destinoCount) { Write-Host "OK: mesma contagem de itens" -ForegroundColor Green }
else { Write-Host "DIVERGENCIA: origem=$origemCount destino=$destinoCount - NAO confiar ainda" -ForegroundColor Red }
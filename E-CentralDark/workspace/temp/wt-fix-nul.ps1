$target = '\\?\C:\CentralDark\Pivete\worktrees\bolt-vendor-restore'
try {
  Remove-Item -LiteralPath $target -Recurse -Force -ErrorAction Stop
  Write-Output "REMOVIDO_OK"
} catch {
  Write-Output ("ERRO: " + $_.Exception.Message)
}
$normal = 'C:\CentralDark\Pivete\worktrees\bolt-vendor-restore'
Write-Output ("AINDA_EXISTE=" + (Test-Path $normal))
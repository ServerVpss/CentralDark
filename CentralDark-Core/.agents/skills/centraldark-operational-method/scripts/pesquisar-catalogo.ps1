param([Parameter(Mandatory=$true)][string]$Termo)
$base=Split-Path -Parent $PSScriptRoot
$all=Get-ChildItem -LiteralPath $base -File -Recurse -Force | Where-Object {$_.Extension -in '.md','.py','.ps1','.json','.yaml','.yml','.sh','.ts','.js','.tsx','.cmd','.txt' -and $_.Name -ne 'ARQUIVOS.json'}
$all | Select-String -Pattern $Termo -SimpleMatch -List | ForEach-Object {[pscustomobject]@{Arquivo=$_.Path;Linha=$_.LineNumber;Texto=$_.Line.Trim()}} | Format-Table -Wrap

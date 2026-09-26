$repo='E:\CentralDark\CentralDark\docs\BRAIN'
$vault='E:\CentralDark\Pivete\CASA-VAULT\00-CANONICO\docs\BRAIN'
$files=@('00 - Mapa do Sistema\GRAFO-VIVO.md','01-CONCEITOS\02-BANDA\BANDA_COMPASSO_GLOBAL.md','02-ENTRADA\01-RAW\CONVERGENCIA_DUPLICACAO_20260819.md','07-APRENDIZADOS-MEMORIAS\01-OURO\dependabot-supreme-adaptacao-evolucao.md','07-APRENDIZADOS-MEMORIAS\01-OURO\dependabot-supreme-finalizacao.md','07-APRENDIZADOS-MEMORIAS\01-OURO\dependabot-supreme-flexibilidade.md','07-APRENDIZADOS-MEMORIAS\01-OURO\dependabot-supreme-hooks.md','07-APRENDIZADOS-MEMORIAS\2026-09-03-CRISTAL-SESSAO-CENTRALDARK.md','07-APRENDIZADOS-MEMORIAS\2026-09-03-REGISTER-BEFORE-REPORT-RECEIPT.md')
foreach($rel in $files){
 Write-Output ('===== '+$rel+' =====')
 $a=Join-Path $repo $rel
 $b=Join-Path $vault $rel
 & git diff --no-index --unified=3 -- $a $b 2>$null
 Write-Output ''
}

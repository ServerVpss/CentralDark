$ErrorActionPreference='Continue'
$repo='E:\CentralDark\_tmp\centraldark-ci-main-20260919\docs\BRAIN'
$vault='E:\CentralDark\Pivete\CASA-VAULT\00-CANONICO\docs\BRAIN'
$files=@(
'01-CONCEITOS\02-BANDA\BANDA_COMPASSO_GLOBAL.json',
'02-ENTRADA\01-RAW\CONVERGENCIA_DUPLICACAO_20260819.md',
'03-DOCUMENTACAO\01-AGENTS-LIBRARY\02-AGENTES\DAILY-REVIEWER.md',
'03-DOCUMENTACAO\02-BIBLIOTECA\HUB-PERSISTENT-SWEEP.md',
'07-APRENDIZADOS-MEMORIAS\01-OURO\dependabot-supreme-adaptacao-evolucao.md',
'07-APRENDIZADOS-MEMORIAS\01-OURO\dependabot-supreme-controle-total.md',
'07-APRENDIZADOS-MEMORIAS\01-OURO\dependabot-supreme-finalizacao.md',
'07-APRENDIZADOS-MEMORIAS\01-OURO\dependabot-supreme-flexibilidade.md',
'07-APRENDIZADOS-MEMORIAS\01-OURO\dependabot-supreme-hooks.md',
'07-APRENDIZADOS-MEMORIAS\01-OURO\dependabot-supreme-intuicao-refinada.md',
'07-APRENDIZADOS-MEMORIAS\2026-09-03-CRISTAL-SESSAO-CENTRALDARK.md',
'07-APRENDIZADOS-MEMORIAS\2026-09-03-REGISTER-BEFORE-REPORT-RECEIPT.md',
'07-APRENDIZADOS-MEMORIAS\HISTORIA-CHEFE.md',
'07-APRENDIZADOS-MEMORIAS\PONTOS-E-NIVEIS-CHEFE.md'
)
foreach($rel in $files){
  $a=Join-Path $repo $rel
  $b=Join-Path $vault $rel
  Write-Output ('===== '+$rel+' =====')
  if(!(Test-Path $a) -or !(Test-Path $b)){Write-Output 'MISSING_SIDE'; continue}
  Write-Output ('MAIN_LINES='+(Get-Content -LiteralPath $a).Count+' VAULT_LINES='+(Get-Content -LiteralPath $b).Count)
  & git diff --no-index --numstat -- $a $b 2>$null
  & git diff --no-index --unified=1 -- $a $b 2>$null | Select-Object -First 70
  Write-Output ''
}
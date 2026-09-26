param([Parameter(ValueFromRemainingArguments=$true)][string[]]$ArgsRest)
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
& node (Join-Path $ScriptRoot "bin/uai.mjs") @ArgsRest
exit $LASTEXITCODE

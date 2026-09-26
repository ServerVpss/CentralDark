$ErrorActionPreference='Stop'
$repo='E:\CentralDark\CentralDark'
$out='E:\CentralDark\runtime\receipts\RUNTIME-METHOD-CRYSTAL-20260918-175428.patch'
$targets=@(
 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/UNIVERSAL-ENGINE-METHOD.yml',
 'apps/modulos/HERMES-CORE/core/universal-method-contract.mjs',
 'apps/modulos/HERMES-CORE/prompts/hermes-core.md'
)
& git -C $repo diff -- $targets | Set-Content -LiteralPath $out -Encoding UTF8
Write-Output ('PATCH=' + $out)
Write-Output ('SHA256=' + (Get-FileHash -Algorithm SHA256 -LiteralPath $out).Hash.ToLowerInvariant())

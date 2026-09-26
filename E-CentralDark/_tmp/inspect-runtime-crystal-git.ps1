$ErrorActionPreference='Stop'
$repo='E:\CentralDark\CentralDark'
$targets=@(
 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/UNIVERSAL-ENGINE-METHOD.yml',
 'apps/modulos/HERMES-CORE/core/universal-method-contract.mjs',
 'apps/modulos/HERMES-CORE/prompts/hermes-core.md'
)
Write-Output ('BRANCH=' + (& git -C $repo branch --show-current))
Write-Output ('HEAD=' + (& git -C $repo rev-parse HEAD))
Write-Output '--- STATUS ---'
& git -C $repo status --short -- $targets
Write-Output '--- DIFF ---'
& git -C $repo diff -- $targets

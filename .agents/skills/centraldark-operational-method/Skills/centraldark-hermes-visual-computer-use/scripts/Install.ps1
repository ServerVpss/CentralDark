# #OBSERVACOES# @owner=centraldark-hermes-visual-computer-use @doc_ref=../references/technical.md
[CmdletBinding()]param([string]$HermesRoot=(Join-Path $env:LOCALAPPDATA 'hermes\hermes-agent'))
$ErrorActionPreference='Stop'
$source=Split-Path $PSScriptRoot
$python=Join-Path $HermesRoot '.venv\Scripts\python.exe'
if(-not(Test-Path $python)){throw 'HERMES_PYTHON_NOT_FOUND: pass -HermesRoot with the installed repository'}
Push-Location $HermesRoot
try{$homePath=(& $python -c 'from hermes_constants import get_hermes_home; print(get_hermes_home())' | Select-Object -Last 1).Trim()}finally{Pop-Location}
if(-not $homePath){throw 'HERMES_HOME_UNRESOLVED'}
$mother=Join-Path $homePath 'skills\centraldark-operational-method'
if(-not(Test-Path $mother)){throw 'SKILL_MAE_NOT_INSTALLED'}
$dest=Join-Path $mother 'Skills\centraldark-hermes-visual-computer-use'
[void](New-Item -ItemType Directory -Force -Path $dest)
function Copy-IfChanged([string]$from,[string]$to){
 if((Test-Path -LiteralPath $to) -and ([Convert]::ToBase64String([IO.File]::ReadAllBytes($from)) -ceq [Convert]::ToBase64String([IO.File]::ReadAllBytes($to)))){return}
 Copy-Item -LiteralPath $from -Destination $to -Force
}
foreach($file in @('SKILL.md')){Copy-IfChanged (Join-Path $source $file) (Join-Path $dest $file)}
foreach($folder in @('scripts','references','native')){
 [void](New-Item -ItemType Directory -Force -Path (Join-Path $dest $folder))
 Get-ChildItem (Join-Path $source $folder) -File | ForEach-Object {Copy-IfChanged $_.FullName (Join-Path (Join-Path $dest $folder) $_.Name)}
}
if(-not(Test-Path (Join-Path $dest 'default.json'))){Copy-Item (Join-Path $source 'default.json') $dest}
Push-Location (Join-Path $source 'native')
try{dotnet publish -c Release -o (Join-Path $dest 'runtime') --verbosity quiet;if($LASTEXITCODE -ne 0){throw 'DOTNET_BUILD_FAILED'}}finally{Pop-Location}
$plugin=Join-Path $homePath 'plugins\hermes-visual-computer-use'
[void](New-Item -ItemType Directory -Force -Path $plugin)
Copy-Item (Join-Path $source 'scripts\hermes_plugin.py') (Join-Path $plugin '__init__.py') -Force
@'
name: hermes-visual-computer-use
version: 1.0.0
description: Windows WGC monitor capture and emerald visual activity; preserves Cua input.
platforms: [windows]
provides_tools:
  - computer_list_monitors
  - computer_capture_monitor
  - computer_show_overlay
  - computer_hide_overlay
  - computer_get_active_monitor
  - computer_get_capture_status
provides_hooks:
  - pre_tool_call
  - post_tool_call
  - on_session_end
'@ | Set-Content -Encoding UTF8 (Join-Path $plugin 'plugin.yaml')
Push-Location $HermesRoot
try{& (Get-Command hermes).Source plugins enable hermes-visual-computer-use;if($LASTEXITCODE -ne 0){throw 'HERMES_PLUGIN_ENABLE_FAILED'}}finally{Pop-Location}
Write-Output "SKILL_INSTALLED=$dest"
Write-Output "PLUGIN_INSTALLED=$plugin"

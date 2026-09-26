param([string]$Mission="examples/mission.example.json")
$ErrorActionPreference="Stop"
$Root=Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Push-Location $Root
try { python -m runtime.cli $Mission } finally { Pop-Location }

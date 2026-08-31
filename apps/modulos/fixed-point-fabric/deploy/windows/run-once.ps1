$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path "$PSScriptRoot\..\..").Path
& "$Root\.venv\Scripts\centraldark-fp.exe" --config "$Root\config\centraldark.fixed-point.json" once

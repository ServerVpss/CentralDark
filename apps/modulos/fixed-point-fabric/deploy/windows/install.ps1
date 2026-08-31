$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path "$PSScriptRoot\..\..").Path
Set-Location $Root

python -m venv .venv
& "$Root\.venv\Scripts\python.exe" -m pip install --upgrade pip
& "$Root\.venv\Scripts\python.exe" -m pip install -e .

if (-not (Test-Path "$Root\config\centraldark.fixed-point.json")) {
  Copy-Item "$Root\config\centraldark.fixed-point.example.json" "$Root\config\centraldark.fixed-point.json"
}

$Action = New-ScheduledTaskAction -Execute "$Root\.venv\Scripts\centraldark-fp.exe" -Argument "--config `"$Root\config\centraldark.fixed-point.json`" watch" -WorkingDirectory $Root
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5)
$Settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
Register-ScheduledTask -TaskName 'CentralDark-FixedPoint' -Action $Action -Trigger $Trigger -Settings $Settings -Description '!CENTRALDARK #ACORDAR fixed-point reconciler' -Force | Out-Null

Write-Host "Instalado. Configure os segredos no ambiente da conta do agendador e execute:"
Write-Host "  $Root\.venv\Scripts\centraldark-fp.exe --config $Root\config\centraldark.fixed-point.json doctor"

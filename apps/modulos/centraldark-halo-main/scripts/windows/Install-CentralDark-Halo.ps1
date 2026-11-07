param([switch]$Silent)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InstallDir = Join-Path $env:LOCALAPPDATA "CentralDark Halo"
$HaloDir = Join-Path $env:USERPROFILE ".codex-halo"
$CodexDir = Join-Path $env:USERPROFILE ".codex"
$ConfigFile = Join-Path $CodexDir "config.toml"
$LegacyHooksFile = Join-Path $CodexDir "hooks.json"
$AppSource = Join-Path $ScriptDir "CentralDarkHalo.exe"
$AppDest = Join-Path $InstallDir "CentralDarkHalo.exe"
$ManagerSource = Join-Path $ScriptDir "support\Manage-CentralDark-HaloHooks.ps1"
$ManagerDest = Join-Path $HaloDir "Manage-CentralDark-HaloHooks.ps1"

Write-Host "CentralDark Halo - Windows installer"
if (-not $IsWindows -and $PSVersionTable.PSVersion.Major -ge 6) {
    throw "This installer only supports Windows."
}
if ([Environment]::OSVersion.Version.Major -lt 10) {
    throw "CentralDark Halo requires Windows 10 or Windows 11."
}
foreach ($Required in @($AppSource, $ManagerSource)) {
    if (-not (Test-Path $Required)) { throw "Release file is missing: $Required" }
}

# #OBSERVACOES# @owner: centraldark-halo-main @doc_ref: docs/ARCHITECTURE.md
# SOURCE_FIRST_GATE: a renamed executable alone is not a rebuilt CentralDark Halo.
$BuiltProduct = [Diagnostics.FileVersionInfo]::GetVersionInfo($AppSource).ProductName
if ($BuiltProduct -ne "CentralDark Halo") {
    throw "BLOCKED_UNBUILT_HALO: executable metadata mismatches current source; rebuild first."
}

New-Item -ItemType Directory -Force -Path $InstallDir, $HaloDir, $CodexDir | Out-Null
Copy-Item $ManagerSource $ManagerDest -Force

$ExistingCount = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $ManagerDest `
    -Operation Verify -HooksPath $ConfigFile
if ([int]$ExistingCount -ne 0 -and (Test-Path $ConfigFile)) {
    $Backup = "$ConfigFile.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $ConfigFile $Backup
    Write-Host "[PASS] Backed up config.toml to $(Split-Path -Leaf $Backup)" -ForegroundColor Green
}

if ([int]$ExistingCount -ne 0) {
    $Count = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $ManagerDest `
        -Operation Uninstall -HooksPath $ConfigFile
    if ([int]$Count -ne 0) { throw "Legacy Halo hook removal was incomplete." }
    Write-Host "[PASS] Removed obsolete Halo hooks; desktop lifecycle detection is built in" -ForegroundColor Green
}
Remove-Item (Join-Path $HaloDir "codex-halo-hook.ps1") -Force -ErrorAction SilentlyContinue

if (Test-Path $LegacyHooksFile) {
    $LegacyBackup = "$LegacyHooksFile.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $LegacyHooksFile $LegacyBackup
    $LegacyCount = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $ManagerDest `
        -Operation Uninstall -HooksPath $LegacyHooksFile
    if ([int]$LegacyCount -ne 0) { throw "Legacy Halo hook migration was incomplete." }
    Write-Host "[PASS] Removed legacy Halo hooks from hooks.json; other hooks were preserved" -ForegroundColor Green
}

Get-Process CentralDarkHalo, CodexHalo -ErrorAction SilentlyContinue | Stop-Process -Force
Copy-Item $AppSource $AppDest -Force
Write-Host "[PASS] Installed $AppDest" -ForegroundColor Green

$ShortcutPath = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\CentralDark Halo.lnk"
try {
    $Shell = New-Object -ComObject WScript.Shell
    $Shortcut = $Shell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = $AppDest
    $Shortcut.WorkingDirectory = $InstallDir
    $Shortcut.Save()
    Write-Host "[PASS] Created Start Menu shortcut" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Start Menu shortcut could not be created." -ForegroundColor Yellow
}

Start-Process $AppDest
Write-Host ""
Write-Host "Installation complete."
Write-Host "CentralDark Halo detects supported local activity events."
Write-Host "Use the tray icon > Demo Mode for the 8-second preview."

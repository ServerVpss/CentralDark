$ErrorActionPreference = "Stop"

Add-Type -AssemblyName UIAutomationClient

$chatWindows = @(Get-Process | Where-Object {
    $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -eq "ChatGPT"
})

$embedded = @()
if ($chatWindows.Count -eq 1) {
    $root = [System.Windows.Automation.AutomationElement]::FromHandle(
        $chatWindows[0].MainWindowHandle
    )
    $tabCondition = New-Object System.Windows.Automation.PropertyCondition(
        [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
        [System.Windows.Automation.ControlType]::TabItem
    )
    $tabs = $root.FindAll(
        [System.Windows.Automation.TreeScope]::Descendants,
        $tabCondition
    )

    $embedded = @(foreach ($tab in $tabs) {
        try {
            $name = $tab.Current.Name
            if ($name -match "(?i)^MINGW64:|^PowerShell:|^Command Prompt:|^Terminal:|^WSL:|^Git Bash:") {
                [pscustomobject]@{
                    Surface = "CodexTab"
                    Name = $name
                }
            }
        }
        catch {
            # An element can disappear while the UI tree is being read.
        }
    })
}

$external = @(Get-Process | Where-Object {
    $_.MainWindowHandle -ne 0 -and (
        $_.ProcessName -match "^(WindowsTerminal|wt|pwsh|powershell|cmd|mintty|bash)$" -or
        $_.MainWindowTitle -match "(?i)PowerShell|Command Prompt|Git Bash|MINGW64|Windows Terminal"
    )
} | ForEach-Object {
    [pscustomobject]@{
        Surface = "Window"
        Name = $_.MainWindowTitle
    }
})

$visible = @($embedded + $external | Sort-Object Surface, Name -Unique)
$numberedVisible = @()
for ($index = 0; $index -lt $visible.Count; $index++) {
    $numberedVisible += [pscustomobject]@{
        Id = "T$($index + 1)"
        Surface = $visible[$index].Surface
        Name = $visible[$index].Name
    }
}

$allProcesses = @(Get-CimInstance Win32_Process)
$chatPid = if ($chatWindows.Count -eq 1) { $chatWindows[0].Id } else { $null }
$rootSessions = @()
if ($null -ne $chatPid) {
    $rootSessions = @($allProcesses | Where-Object {
        $_.ParentProcessId -eq $chatPid -and
        $_.Name -match "^(bash|cmd|pwsh|powershell|wsl|mintty)\.exe$"
    } | Sort-Object CreationDate)
}

$numberedSessions = @()
for ($index = 0; $index -lt $rootSessions.Count; $index++) {
    $numberedSessions += [pscustomobject]@{
        Id = "S$($index + 1)"
        Pid = $rootSessions[$index].ProcessId
        Name = $rootSessions[$index].Name
        CreatedAt = $rootSessions[$index].CreationDate
    }
}

$shellRelated = @($allProcesses | Where-Object {
    $_.Name -match "^(bash|cmd|pwsh|powershell|wsl|wslhost|mintty|conhost)\.exe$"
})

[pscustomobject]@{
    MeasuredAt = (Get-Date).ToString("o")
    VisibleTerminalCount = $numberedVisible.Count
    RootTerminalSessionCount = $numberedSessions.Count
    ShellRelatedProcessCount = $shellRelated.Count
    ObservedLevel = $numberedSessions.Count
    ActionableLevel = $numberedVisible.Count
    VisibleTerminals = $numberedVisible
    RootSessions = $numberedSessions
} | ConvertTo-Json -Depth 5

#requires -Version 5.1
# Skill-Mae CentralDark | diagnostico pontual READ-ONLY, sem instalar/reiniciar/encerrar.
[CmdletBinding()]
param(
    [ValidateRange(2,60)][int]$DurationSeconds = 12,
    [ValidateRange(50,2000)][int]$SampleMs = 200
)
$ErrorActionPreference = 'Stop'
if ([Environment]::OSVersion.Platform -ne 'Win32NT') { throw 'WINDOWS_ONLY' }
$native = @'
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;
public sealed class CdWindowInfo {
    public long Handle;
    public uint Pid;
    public string ClassName;
    public string TitleKind;
}
public static class CdConsoleWindowTrace {
    public delegate bool Callback(IntPtr h, IntPtr param);
    [DllImport("user32.dll")] public static extern bool EnumWindows(Callback fn, IntPtr param);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetClassName(IntPtr h, StringBuilder s, int capacity);
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int capacity);
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
    public static CdWindowInfo[] Snapshot() {
        var results = new List<CdWindowInfo>();
        EnumWindows((h, param) => {
            if (!IsWindowVisible(h)) return true;
            var clsText = new StringBuilder(256);
            GetClassName(h, clsText, 256);
            var titleText = new StringBuilder(256);
            GetWindowText(h, titleText, 256);
            string cls = clsText.ToString();
            string title = titleText.ToString().Trim();
            if (cls == "ConsoleWindowClass" ||
                cls == "CASCADIA_HOSTING_WINDOW_CLASS" ||
                title == "[]") {
                uint pid;
                GetWindowThreadProcessId(h, out pid);
                results.Add(new CdWindowInfo {
                    Handle = h.ToInt64(),
                    Pid = pid,
                    ClassName = cls,
                    TitleKind = title == "[]" ? "BRACKETS" : (title.Length == 0 ? "EMPTY" : "PRESENT")
                });
            }
            return true;
        }, IntPtr.Zero);
        return results.ToArray();
    }
}
'@
Add-Type -TypeDefinition $native -ErrorAction Stop
$source = 'CentralDarkConsoleTrace_' + $PID
$own = Get-CimInstance Win32_Process -Filter ('ProcessId=' + $PID) -ErrorAction SilentlyContinue
$toolHostPid = if ($own) { [int]$own.ParentProcessId } else { -1 }
$started = Get-Date
$procEvents = New-Object 'System.Collections.Generic.List[object]'
$windows = New-Object 'System.Collections.Generic.List[object]'
$seen = @{}
$baseline = @{}
$registered = $false
try {
    Register-WmiEvent -Class Win32_ProcessStartTrace -SourceIdentifier $source -ErrorAction Stop | Out-Null
    $registered = $true
    foreach ($w in [CdConsoleWindowTrace]::Snapshot()) {
        $key = [string]$w.Handle
        $baseline[$key] = $true
        $seen[$key] = $true
    }
    $deadline = (Get-Date).AddSeconds($DurationSeconds)
    while ((Get-Date) -lt $deadline) {
        foreach ($event in @(Get-Event -SourceIdentifier $source -ErrorAction SilentlyContinue)) {
            $e = $event.SourceEventArgs.NewEvent
            $name = [string]$e.ProcessName
            if ($name -match '^(conhost|cmd|powershell|pwsh|WindowsTerminal|wt|python|pythonw|node|bash|ssh|wsl|git|hermes|hermes-agent)\.exe$') {
                $ppid = [int]$e.ParentProcessID
                $label = if ($ppid -eq $PID) { 'OBSERVER_CHILD' } elseif ($ppid -eq $toolHostPid) { 'SAME_REMOTE_TOOL_HOST' } else { 'UNATTRIBUTED' }
                $procEvents.Add([pscustomobject]@{
                    At=$event.TimeGenerated.ToString('HH:mm:ss.fff')
                    Name=$name
                    Pid=[int]$e.ProcessID
                    Parent=$ppid
                    Provenance=$label
                })
            }
            Remove-Event -EventIdentifier $event.EventIdentifier -ErrorAction SilentlyContinue
        }
        foreach ($w in [CdConsoleWindowTrace]::Snapshot()) {
            $key = [string]$w.Handle
            if (-not $seen.ContainsKey($key)) {
                $seen[$key] = $true
                $windows.Add([pscustomobject]@{
                    At=(Get-Date).ToString('HH:mm:ss.fff')
                    Handle=$w.Handle
                    Pid=$w.Pid
                    Class=$w.ClassName
                    Title=$w.TitleKind
                })
            }
        }
        Start-Sleep -Milliseconds $SampleMs
    }
}
finally {
    if ($registered) { Unregister-Event -SourceIdentifier $source -ErrorAction SilentlyContinue }
    Get-Event -SourceIdentifier $source -ErrorAction SilentlyContinue | Remove-Event -ErrorAction SilentlyContinue
}
'TRACE=TRANSIENT_CONSOLES_V1'
'HOST='+$env:COMPUTERNAME
'STARTED='+$started.ToString('o')
'OBSERVATION_DURATION_SECONDS='+$DurationSeconds
'SAMPLING_INTERVAL_MS='+$SampleMs
'OBSERVER_PID='+$PID
'REMOTE_TOOL_HOST_PID='+$toolHostPid
'PROCESS_EVENTS='+$procEvents.Count
'WINDOWS_PRESENT_AT_BASELINE='+$baseline.Count
'NEW_WINDOW_HITS='+$windows.Count
$procEvents | Select-Object -First 45 | ForEach-Object { 'PROC '+$_.At+' NAME='+$_.Name+' PID='+$_.Pid+' PPID='+$_.Parent+' '+$_.Provenance }
$windows | Select-Object -First 35 | ForEach-Object { 'NEW_WINDOW '+$_.At+' PID='+$_.Pid+' HWND='+$_.Handle+' CLASS='+$_.Class+' TITLE_KIND='+$_.Title }
$windows | Select-Object -ExpandProperty Pid -Unique | ForEach-Object {
    $p = Get-CimInstance Win32_Process -Filter ('ProcessId=' + [int]$_) -ErrorAction SilentlyContinue
    if ($p) { 'WINDOW_OWNER PID='+$p.ProcessId+' NAME='+$p.Name+' PARENT='+$p.ParentProcessId+' CREATED='+$p.CreationDate.ToString('o') }
    else { 'WINDOW_OWNER PID='+$_+' PROCESS_EXITED_OR_UNAVAILABLE' }
}
if ($windows.Count -eq 0) { 'WINDOW_VERDICT=NO_NEW_WINDOW_CAPTURED_NOT_PROOF_OF_ABSENCE' }
else { 'WINDOW_VERDICT=OBSERVED_CORRELATE_WITH_PROCESS_PARENT_AND_USER_TIME' }
'NEXT_CURSOR=IF_BRACKETS_RECUR_TRACE_DURING_FLASH_AND_MATCH_HWND_PID_PPID_TIME'

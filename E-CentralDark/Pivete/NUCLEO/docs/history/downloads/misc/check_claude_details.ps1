$ids = @(24356, 37336)
foreach ($id in $ids) {
    $p = Get-Process -Id $id -ErrorAction SilentlyContinue
    if ($p) {
        Write-Host ("PID {0}:" -f $id)
        Write-Host ("  Parent: {0}" -f $p.ParentProcessId)
        Write-Host ("  Handles: {0}" -f $p.HandleCount)
        Write-Host ("  Threads: {0}" -f $p.Threads.Count)
        Write-Host ("  SessionId: {0}" -f $p.SessionId)
        Write-Host ("  ProcessName: {0}" -f $p.ProcessName)
        Write-Host ("  Path: {0}" -f $p.Path)
        $wmi = Get-WmiObject Win32_Process -Filter "ProcessId=$id" -ErrorAction SilentlyContinue
        if ($wmi) {
            Write-Host ("  CommandLine: {0}" -f $wmi.CommandLine)
        }
        Write-Host ""
    }
}
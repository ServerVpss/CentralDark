$pids = @(8968, 9516, 15472, 20900, 24356, 26580, 36684, 37336, 42764, 46820, 53844, 56972)
foreach ($id in $pids) {
    $p = Get-Process -Id $id -ErrorAction SilentlyContinue
    if ($p) {
        $mainWindow = $p.MainWindowTitle
        $startTime = $p.StartTime
        $cpu = [math]::Round($p.TotalProcessorTime.TotalSeconds, 1)
        $mem = [math]::Round($p.WorkingSet64 / 1MB, 1)
        Write-Host "PID $id | CPU: ${cpu}s | RAM: ${mem}MB | Janela: '$mainWindow' | Início: $startTime"
    }
}
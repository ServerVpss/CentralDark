$t = Get-MpThreat
$stealer = $t | Where-Object { $_.ThreatName -like '*PY.STEALER*' }
if ($stealer) {
    $stealer | Select-Object ThreatName, SeverityID, CategoryID, DetectionTime, ActionTaken, IsActive, Resources | Format-List
} else {
    Write-Host "Nenhuma ameaça PY.STEALER encontrada"
}
$threats = Get-MpThreat
$crown = $t | Where-Object { $_.ThreatName -like '*CrownRelay*' }
if ($crown) {
    $crown | Select-Object ThreatName, SeverityID, CategoryID, DetectionTime, ActionTaken, IsActive, Resources | Format-List
} else {
    Write-Host "Nenhuma ameaça CrownRelay encontrada"
}
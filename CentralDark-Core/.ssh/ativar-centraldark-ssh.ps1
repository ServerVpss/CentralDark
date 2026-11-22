$ErrorActionPreference = "Stop"

$Key = "$env:USERPROFILE\.ssh\segredo_vps_ed25519"

Get-Service ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent

ssh-add $Key

Write-Host "`n=== CHAVES CARREGADAS ==="
ssh-add -l

Write-Host "`n=== TESTE GITHUB ==="
ssh -T git@github.com

Write-Host "`n=== TESTE VPS ==="
ssh segredo-vpss "hostname; whoami"
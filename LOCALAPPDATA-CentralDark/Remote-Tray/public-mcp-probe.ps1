$ProgressPreference='SilentlyContinue'
Write-Output '===DNS==='
Resolve-DnsName mcp.centralldark.com -ErrorAction Continue | Select-Object Name,Type,IPAddress
Write-Output '===HEALTH==='
try {
  $r=Invoke-WebRequest -UseBasicParsing -Uri 'https://mcp.centralldark.com/health' -TimeoutSec 15
  Write-Output ('HTTP='+$r.StatusCode)
  Write-Output $r.Content
  Write-Output ('SERVER='+$r.Headers['Server'])
  Write-Output ('CF-RAY='+$r.Headers['CF-RAY'])
} catch { Write-Output $_.Exception.Message }
Write-Output '===MCP==='
try {
  $m=Invoke-WebRequest -UseBasicParsing -Uri 'https://mcp.centralldark.com/mcp' -TimeoutSec 15
  Write-Output ('HTTP='+$m.StatusCode)
} catch {
  if ($_.Exception.Response) {
    Write-Output ('HTTP='+[int]$_.Exception.Response.StatusCode)
    Write-Output ('WWW-AUTH='+$_.Exception.Response.Headers['WWW-Authenticate'])
  } else { Write-Output $_.Exception.Message }
}

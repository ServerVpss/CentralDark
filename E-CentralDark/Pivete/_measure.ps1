$ports=@(3030,8099,8645,3100,11434,8080,3000,5173,8787,8199,8788)
foreach($p in $ports){
  $c=Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue
  if($c){$pr=Get-CimInstance Win32_Process -Filter "ProcessId=$($c[0].OwningProcess)"; "$p -> $($pr.Name) PID=$($c[0].OwningProcess)"}
  else {"$p -> fechada"}
}
"=== Tailscale IPv4 ==="
(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias *Tailscale* -ErrorAction SilentlyContinue).IPAddress

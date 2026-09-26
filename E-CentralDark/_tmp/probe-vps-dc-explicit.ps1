$ErrorActionPreference='Continue'
$ssh='C:\Windows\System32\OpenSSH\ssh.exe'
$config='C:\Users\Administrador\.ssh\config'
$key='C:\Users\Administrador\.ssh\segredo_vps_ed25519'
$target='root@89.117.78.124'
$args=@(
  '-F',$config,
  '-i',$key,
  '-o','BatchMode=yes',
  '-o','ConnectTimeout=8',
  $target,
  'hostname; whoami; pgrep -af desktop-commander || true; pgrep -af centraldark-mcp-auth || true; test -f /root/.desktop-commander-device/device.json && echo DEVICE_CONFIG=PRESENT || echo DEVICE_CONFIG=ABSENT'
)
$out='E:\CentralDark\_tmp\probe-vps-dc-explicit.out.txt'
$err='E:\CentralDark\_tmp\probe-vps-dc-explicit.err.txt'
$p=Start-Process -FilePath $ssh -ArgumentList $args -NoNewWindow -Wait -PassThru -RedirectStandardOutput $out -RedirectStandardError $err
Write-Output ('EXIT='+$p.ExitCode)
Write-Output '---STDOUT---'
Get-Content $out -ErrorAction SilentlyContinue
Write-Output '---STDERR---'
Get-Content $err -ErrorAction SilentlyContinue

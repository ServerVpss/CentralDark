$ErrorActionPreference='Stop'
$key='C:\Users\Administrador\.ssh\segredo_vps_ed25519'
$host='root@89.117.78.124'
$out='E:\CentralDark\_tmp\probe-vps-explicit.out.txt'
$err='E:\CentralDark\_tmp\probe-vps-explicit.err.txt'
Remove-Item -LiteralPath $out,$err -Force -ErrorAction SilentlyContinue
$args=@('-i',$key,'-o','BatchMode=yes','-o','ConnectTimeout=8',$host,'hostname')
$p=Start-Process -FilePath 'ssh.exe' -ArgumentList $args -NoNewWindow -PassThru -Wait -RedirectStandardOutput $out -RedirectStandardError $err
[pscustomobject]@{exit=$p.ExitCode;out=$out;err=$err}|ConvertTo-Json -Compress
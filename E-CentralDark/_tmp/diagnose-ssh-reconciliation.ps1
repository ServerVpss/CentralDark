$ErrorActionPreference='Continue'
$out='E:\CentralDark\_tmp\diagnose-ssh-reconciliation.out.txt'
$err='E:\CentralDark\_tmp\diagnose-ssh-reconciliation.err.txt'
Remove-Item -LiteralPath $out,$err -Force -ErrorAction SilentlyContinue
$p=Start-Process -FilePath 'ssh.exe' -ArgumentList @('segredo-vpss','hostname') -NoNewWindow -PassThru -Wait -RedirectStandardOutput $out -RedirectStandardError $err
[pscustomobject]@{exit=$p.ExitCode;out=$out;err=$err}|ConvertTo-Json -Compress
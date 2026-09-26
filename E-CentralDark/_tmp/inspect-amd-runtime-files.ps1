$ErrorActionPreference='SilentlyContinue'
$roots=@(
 'C:\Program Files\AMD\Manageability API',
 'C:\Program Files\AMD\Manageability Service',
 'C:\ProgramData\AMD',
 'C:\Users\Administrador\AppData\Local\AMD',
 'C:\Users\Administrador\AppData\Roaming\AMD'
)
$files=@()
foreach($r in $roots){
 if(Test-Path $r){
   $files += Get-ChildItem -LiteralPath $r -Recurse -File -ErrorAction SilentlyContinue |
     Where-Object { $_.Name -match 'log|trace|error|debug|config|cert|pem' } |
     Select-Object FullName,Length,LastWriteTime
 }
}
$deps=sc.exe qc AMDManageabilityAPI
$deps2=sc.exe qc AIMTManageabilityService
$driver=sc.exe query AMS-MailBoxDrv
[pscustomobject]@{candidate_logs=$files;api_sc=$deps;aimt_sc=$deps2;mailbox_driver=$driver}|ConvertTo-Json -Depth 6
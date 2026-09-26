$ErrorActionPreference='SilentlyContinue'
$svc=Get-CimInstance Win32_Service -Filter "Name='AMDManageabilityAPI'"
$aim=Get-CimInstance Win32_Service -Filter "Name='AIMTManageabilityService'"
$settings='C:\\Program Files\\AMD\\Manageability API\\config\\settings.json'
$web='C:\\Program Files\\AMD\\Manageability API\\config\\webserverConfig.json'
$cfg=[ordered]@{}
if(Test-Path $settings){$cfg.settings=Get-Content -Raw $settings}
if(Test-Path $web){$cfg.web=Get-Content -Raw $web}
$root='C:\\Program Files\\AMD\\Manageability API'
$critical=Get-ChildItem -LiteralPath $root -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -in '.dll','.exe','.json','.config','.pem','.crt','.cer','.key' } | Select-Object FullName,Length,LastWriteTime
[pscustomobject]@{api_service=$svc;aimt_service=$aim;configs=$cfg;critical_files=$critical}|ConvertTo-Json -Depth 8

$ErrorActionPreference='SilentlyContinue'
$ports=3274,3275,3277,8080
$r=@()
foreach($p in $ports){
  $tnc=Test-NetConnection -ComputerName 127.0.0.1 -Port $p -WarningAction SilentlyContinue
  $curl=& curl.exe -k -sS -o NUL -w "%{http_code}" --max-time 4 "https://127.0.0.1:$p/" 2>$null
  if(-not $curl -or $curl -eq '000'){
    $curlHttp=& curl.exe -sS -o NUL -w "%{http_code}" --max-time 4 "http://127.0.0.1:$p/" 2>$null
  } else {$curlHttp=$null}
  $r += [pscustomobject]@{Port=$p;TcpTest=$tnc.TcpTestSucceeded;HttpsCode=$curl;HttpCode=$curlHttp}
}
$r|ConvertTo-Json -Depth 4
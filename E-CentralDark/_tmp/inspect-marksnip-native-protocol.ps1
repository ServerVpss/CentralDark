$ErrorActionPreference='SilentlyContinue'
$sw='C:\\Users\\Administrador\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\kcbaglhfgbkjdnpeokaamjjkddempipm\\5.2.0_0\\service-worker.js'
$patterns=@('connectNative','sendNativeMessage','AGENT_BRIDGE_HOST_NAME','agentBridge','nativePort','onMessage.addListener','postMessage','disconnect')
$hits=@()
foreach($pat in $patterns){
  $m=Select-String -LiteralPath $sw -Pattern $pat -SimpleMatch -ErrorAction SilentlyContinue
  foreach($x in $m){
    $start=[Math]::Max(0,$x.LineNumber-4)
    $lines=Get-Content -LiteralPath $sw | Select-Object -Skip $start -First 14
    $hits += [pscustomobject]@{Pattern=$pat;Line=$x.LineNumber;Context=($lines -join [Environment]::NewLine)}
  }
}
$hits | ConvertTo-Json -Depth 4

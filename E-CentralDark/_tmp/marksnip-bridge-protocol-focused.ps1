$ErrorActionPreference='SilentlyContinue'
$sw='C:\\Users\\Administrador\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\kcbaglhfgbkjdnpeokaamjjkddempipm\\5.2.0_0\\service-worker.js'
$all=Get-Content -LiteralPath $sw
$anchors=@('function handleAgentBridgeNativeMessage','async function handleAgentBridgeNativeMessage','bridge.hello','capture.request','capture.result','agent.','bridge.')
$out=@()
foreach($a in $anchors){
 $m=Select-String -LiteralPath $sw -Pattern $a -SimpleMatch -ErrorAction SilentlyContinue
 foreach($x in $m){
   $start=[Math]::Max(0,$x.LineNumber-12)
   $ctx=$all | Select-Object -Skip $start -First 80
   $out += [pscustomobject]@{Anchor=$a;Line=$x.LineNumber;Context=($ctx -join [Environment]::NewLine)}
 }
}
$out|ConvertTo-Json -Depth 4

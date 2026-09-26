$ErrorActionPreference='Stop'
$swPath='C:\Users\Administrador\AppData\Local\Google\Chrome\User Data\Default\Extensions\kcbaglhfgbkjdnpeokaamjjkddempipm\5.2.0_0\service-worker.js'
$lines=Select-String -LiteralPath $swPath -SimpleMatch 'AGENT_BRIDGE_HOST_NAME' | Select-Object -First 20 -ExpandProperty Line
$keys=@(
 'HKCU:\Software\Google\Chrome\NativeMessagingHosts',
 'HKLM:\Software\Google\Chrome\NativeMessagingHosts',
 'HKCU:\Software\Chromium\NativeMessagingHosts',
 'HKLM:\Software\Chromium\NativeMessagingHosts'
)
$found=@()
foreach($k in $keys){
  if(Test-Path $k){
    Get-ChildItem $k | ForEach-Object {
      $val=(Get-Item -LiteralPath $_.PSPath -ErrorAction SilentlyContinue).GetValue('')
      $found += [pscustomobject]@{Hive=$k;Host=$_.PSChildName;Manifest=$val}
    }
  }
}
[pscustomobject]@{
 HostLines=$lines
 Registered=$found
}|ConvertTo-Json -Depth 6
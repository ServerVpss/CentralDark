$ErrorActionPreference='SilentlyContinue'
$hostName='com.openai.codexextension'
$hostManifest='C:\Users\Administrador\AppData\Local\OpenAI\extension\com.openai.codexextension.json'
$runtimeMap='C:\Users\Administrador\AppData\Local\OpenAI\Codex\chrome-native-hosts-v2.json'
$extIds=@('hehggadaopoacecdllhhajmbjkdcmajg','odlomjlbamekndcpllcnffbgeohgkmjh')
$chromeRoot='C:\Users\Administrador\AppData\Local\Google\Chrome\User Data'
$profiles=Get-ChildItem -LiteralPath $chromeRoot -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'Default' -or $_.Name -like 'Profile *' }

$regPaths=@(
 "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$hostName",
 "HKLM:\Software\Google\Chrome\NativeMessagingHosts\$hostName"
)
$reg=@()
foreach($rp in $regPaths){
 if(Test-Path $rp){
  $reg += [pscustomobject]@{path=$rp;manifest=(Get-Item $rp).GetValue('')}
 }
}

$ext=@()
foreach($prof in $profiles){
 $prefs=Join-Path $prof.FullName 'Preferences'
 $prefsObj=$null
 if(Test-Path $prefs){ try{$prefsObj=Get-Content -Raw -LiteralPath $prefs | ConvertFrom-Json}catch{} }
 foreach($id in $extIds){
  $dir=Join-Path $prof.FullName "Extensions\$id"
  $vers=@()
  if(Test-Path $dir){$vers=Get-ChildItem $dir -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending}
  $setting=$null
  if($prefsObj -and $prefsObj.extensions -and $prefsObj.extensions.settings){
    $setting=$prefsObj.extensions.settings.PSObject.Properties[$id].Value
  }
  $ext += [pscustomobject]@{
    profile=$prof.Name
    id=$id
    installed=(Test-Path $dir)
    latest_version=if($vers){$vers[0].Name}else{$null}
    state=if($setting){$setting.state}else{$null}
    enabled=if($setting){[int]$setting.state -eq 1}else{$false}
  }
 }
}

$hostProc=Get-CimInstance Win32_Process | Where-Object {
 $_.Name -eq 'extension-host.exe' -or ($_.ExecutablePath -and $_.ExecutablePath -match 'openai-bundled.*chrome.*extension-host')
} | Select-Object ProcessId,ParentProcessId,Name,ExecutablePath

$runtime=$null
if(Test-Path $runtimeMap){$runtime=Get-Content -Raw -LiteralPath $runtimeMap | ConvertFrom-Json}
$manifest=$null
if(Test-Path $hostManifest){$manifest=Get-Content -Raw -LiteralPath $hostManifest | ConvertFrom-Json}

$checks=[ordered]@{
 manifest_present=(Test-Path $hostManifest)
 registry_present=(@($reg).Count -gt 0)
 extension_installed=(@($ext | Where-Object installed).Count -gt 0)
 extension_enabled=(@($ext | Where-Object enabled).Count -gt 0)
 host_process_alive=(@($hostProc).Count -gt 0)
}
$passed=@($checks.Values | Where-Object {$_ -eq $true}).Count
[pscustomobject]@{
 observed_at=(Get-Date).ToString('o')
 checks=$checks
 passed=$passed
 total=5
 percent=[math]::Round(($passed/5.0)*100,2)
 registry=$reg
 extensions=$ext
 host_processes=$hostProc
 manifest=[pscustomobject]@{
   name=$manifest.name
   description=$manifest.description
   path=$manifest.path
   allowed_origins=$manifest.allowed_origins
 }
 runtime=[pscustomobject]@{
   schemaVersion=$runtime.schemaVersion
   active_entries=@($runtime.entries).Count
   latest_appVersion=if($runtime.entries){$runtime.entries[0].appVersion}else{$null}
   latest_nativeHostVersion=if($runtime.entries){$runtime.entries[0].nativeHostVersion}else{$null}
   latest_presence_pid=if($runtime.entries){$runtime.entries[0].presence.pid}else{$null}
   latest_presence_lastSeenAt=if($runtime.entries){$runtime.entries[0].presence.lastSeenAt}else{$null}
 }
}|ConvertTo-Json -Depth 8
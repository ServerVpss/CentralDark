$ErrorActionPreference='SilentlyContinue'
$ids=@('hehggadaopoacecdllhhajmbjkdcmajg','odlomjlbamekndcpllcnffbgeohgkmjh')
$root='C:\Users\Administrador\AppData\Local\Google\Chrome\User Data'
$profiles=Get-ChildItem -LiteralPath $root -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'Default' -or $_.Name -like 'Profile *' }

$out=@()
foreach($prof in $profiles){
  $prefPath=Join-Path $prof.FullName 'Preferences'
  $secPath=Join-Path $prof.FullName 'Secure Preferences'
  $pref=$null; $sec=$null
  if(Test-Path $prefPath){ try{$pref=Get-Content -Raw -LiteralPath $prefPath | ConvertFrom-Json}catch{} }
  if(Test-Path $secPath){ try{$sec=Get-Content -Raw -LiteralPath $secPath | ConvertFrom-Json}catch{} }

  foreach($id in $ids){
    $pstate=$null; $sstate=$null
    if($pref -and $pref.extensions -and $pref.extensions.settings){
      $prop=$pref.extensions.settings.PSObject.Properties[$id]
      if($prop){$pstate=$prop.Value.state}
    }
    if($sec -and $sec.extensions -and $sec.extensions.settings){
      $prop=$sec.extensions.settings.PSObject.Properties[$id]
      if($prop){$sstate=$prop.Value.state}
    }
    $dir=Join-Path $prof.FullName "Extensions\$id"
    $vers=@()
    if(Test-Path $dir){$vers=Get-ChildItem -LiteralPath $dir -Directory | Sort-Object Name -Descending}
    $manifest=$null
    if($vers){
      $mp=Join-Path $vers[0].FullName 'manifest.json'
      if(Test-Path $mp){try{$manifest=Get-Content -Raw -LiteralPath $mp | ConvertFrom-Json}catch{}}
    }
    $out += [pscustomobject]@{
      profile=$prof.Name
      id=$id
      installed=(Test-Path $dir)
      version=if($vers){$vers[0].Name}else{$null}
      preferences_state=$pstate
      secure_preferences_state=$sstate
      manifest_name=if($manifest){$manifest.name}else{$null}
      manifest_version=if($manifest){$manifest.version}else{$null}
    }
  }
}

$hostProc=Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'extension-host.exe' } | ForEach-Object {
  $parent=Get-CimInstance Win32_Process -Filter "ProcessId=$($_.ParentProcessId)"
  [pscustomobject]@{
    pid=$_.ProcessId
    parent_pid=$_.ParentProcessId
    parent_name=$parent.Name
    parent_command=$parent.CommandLine
    path=$_.ExecutablePath
  }
}

[pscustomobject]@{
  observed_at=(Get-Date).ToString('o')
  extensions=$out
  native_host_processes=$hostProc
}|ConvertTo-Json -Depth 6
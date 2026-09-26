$ErrorActionPreference='Stop'
$id='kcbaglhfgbkjdnpeokaamjjkddempipm'
$root=Join-Path $env:LOCALAPPDATA 'Google\Chrome\User Data'
$dirs=Get-ChildItem -Path $root -Directory -ErrorAction SilentlyContinue | ForEach-Object {
  $ext=Join-Path $_.FullName "Extensions\$id"
  if(Test-Path -LiteralPath $ext){ Get-ChildItem -LiteralPath $ext -Directory | Sort-Object Name -Descending | Select-Object -First 1 }
} | Where-Object { $_ }
$result=@()
foreach($d in $dirs){
  $manifestPath=Join-Path $d.FullName 'manifest.json'
  $m=Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
  $result += [pscustomobject]@{
    Profile=$d.Parent.Parent.Parent.Name
    VersionDir=$d.FullName
    Name=$m.name
    Version=$m.version
    ManifestVersion=$m.manifest_version
    Permissions=(@($m.permissions) -join ',')
    HostPermissions=(@($m.host_permissions) -join ',')
    ExternallyConnectable=($null -ne $m.externally_connectable)
    Background=($m.background.service_worker)
    OptionsPage=$m.options_page
    OptionsUI=$m.options_ui.page
  }
}
$result | ConvertTo-Json -Depth 6

$ErrorActionPreference='Stop'
$base='C:\Users\Administrador\AppData\Local\Google\Chrome\User Data\Default\Extensions\kcbaglhfgbkjdnpeokaamjjkddempipm\5.2.0_0'
$patterns=@(
 'connectNative','nativeMessaging','runtime.connectNative','install-host',
 'Obsidian','Advanced Obsidian URI','webhook','assistant','ChatGPT','Claude','Perplexity',
 'Interpreter','provider','API','markdown','downloads','contextMenus','clipboard',
 'offscreen','speech','voice','tts','audio','fetch(','XMLHttpRequest','storage.sync','storage.local'
)
$files=Get-ChildItem -LiteralPath $base -Recurse -File -Include *.js,*.json,*.html,*.css
$hits=@()
foreach($pat in $patterns){
  $m=Select-String -Path $files.FullName -Pattern $pat -SimpleMatch -ErrorAction SilentlyContinue | Select-Object -First 12
  foreach($x in $m){
    $hits += [pscustomobject]@{Pattern=$pat;File=$x.Path.Substring($base.Length+1);Line=$x.LineNumber;Snippet=($x.Line.Trim().Substring(0,[Math]::Min(240,$x.Line.Trim().Length)))}
  }
}
$hits | ConvertTo-Json -Depth 4

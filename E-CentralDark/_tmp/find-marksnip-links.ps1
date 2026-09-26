$files=Get-ChildItem -LiteralPath 'C:\Users\Administrador\AppData\Local\Google\Chrome\User Data\Default\Extensions\kcbaglhfgbkjdnpeokaamjjkddempipm\5.2.0_0' -Recurse -File -Include *.html,*.js,*.json
$hits=Select-String -Path $files.FullName -Pattern 'github.com|releases|Agent Bridge Walkthrough' -AllMatches -ErrorAction SilentlyContinue |
  Where-Object { $_.Line -match 'github\.com|releases' } |
  Select-Object -First 120 Path,LineNumber,Line
$hits|ConvertTo-Json -Depth 4
$ErrorActionPreference='SilentlyContinue'
$target='E:\CentralDark\CentralDark\scripts\lupa\pdf-conformance-cc2003.mjs'
$proc=Get-CimInstance Win32_Process -Filter "ProcessId=42660"
[pscustomobject]@{
  observed_at=(Get-Date).ToString('o')
  target_exists=(Test-Path -LiteralPath $target)
  pid_42660_present=($null -ne $proc)
  pid_42660_name=if($proc){$proc.Name}else{$null}
  pid_42660_command=if($proc){$proc.CommandLine}else{$null}
}|ConvertTo-Json -Depth 4
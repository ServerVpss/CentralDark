$ErrorActionPreference='SilentlyContinue'
$procs=Get-Process Hermes,screenpipe-app -ErrorAction SilentlyContinue |
  Select-Object ProcessName,Id,StartTime,Path
$receipt='C:\Users\Administrador\AppData\Local\CentralDark\ScheduledJobs\receipts\SCREENPIPE_CRYSTAL-latest.json'
$receiptObj=$null
if(Test-Path -LiteralPath $receipt){ try{$receiptObj=Get-Content -LiteralPath $receipt -Raw | ConvertFrom-Json}catch{} }
[pscustomobject]@{
 observed_at=(Get-Date).ToString('o')
 processes=$procs
 screenpipe_receipt=$receiptObj
}|ConvertTo-Json -Depth 7
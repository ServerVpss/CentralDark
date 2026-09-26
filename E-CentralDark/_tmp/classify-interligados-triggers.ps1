$ErrorActionPreference='Stop'
$root='E:\CentralDark\CentralDark\.agents\skills\meta-lupa\KITS\METAGRILL-METALUPA\INTERLIGADOS'
$tokens=@('!CENTRALDARK','!># INTERLIGADOS','#ACORDAR','!CALIBRAR','!MULTIBÚSSOLA','!META_LUPA','!RECONCILIAR','!CONTRAPROVA','!REGISTRA')
Get-ChildItem -LiteralPath $root -Recurse -File -Filter *.md | ForEach-Object {
  $text=Get-Content -Raw -LiteralPath $_.FullName
  $hit=@($tokens | Where-Object { $text.Contains($_) })
  [pscustomobject]@{
    relative=$_.FullName.Substring($root.Length+1)
    has_trigger=($hit.Count -gt 0)
    triggers=($hit -join ',')
  }
} | ConvertTo-Json -Depth 4

# #OBSERVACOES# | CENTRALDARK.SKILL_MAE.MONITOR_IDENTIFY_20261026
# @owner: .agents/skills/centraldark-operational-method/SKILL.md
# @doc_ref: docs/ARQUITETURA/CENTRALDARK-CIRCUITO-VIVO-CONEXOES-20261026.md
# @last_updated: 2026-10-26T10:00:00Z
# @implementado: inventario Windows real; acao opcional usa Identificar nativo nas Configuracoes.
# @pendente: ligar o comando ao owner de desktop existente no Cockpit com prova autenticada.
# @next_cursor: CI, readback dos quatro IDs e acao Identify na Casa.
[CmdletBinding()]
param([switch]$Identify)

Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Windows.Forms
$screens=@([System.Windows.Forms.Screen]::AllScreens)
$ordered=@($screens | Sort-Object { $_.Bounds.X })
$slots=@{}
if($ordered.Count -eq 4){
  $center=@($ordered | Select-Object -Skip 1 -First 2 | Sort-Object { $_.Bounds.Y })
  $slots['janela 1']=$ordered[0].DeviceName
  $slots['janela 2']=$center[0].DeviceName
  $slots['janela 3']=$center[1].DeviceName
  $slots['janela 4']=$ordered[3].DeviceName
}
foreach($alias in @('janela 1','janela 2','janela 3','janela 4')){
  $screen=$screens | Where-Object {$_.DeviceName -eq $slots[$alias]} | Select-Object -First 1
  if($null -eq $screen){
    [pscustomobject]@{ slot=$alias; state='UNRESOLVED'; device=$null; bounds=$null; measured_at=(Get-Date).ToUniversalTime().ToString('o') }|ConvertTo-Json -Compress
    continue
  }
  [pscustomobject]@{
    slot=$alias
    state='MAPPED'
    device=$screen.DeviceName
    bounds=[pscustomobject]@{x=$screen.Bounds.X;y=$screen.Bounds.Y;width=$screen.Bounds.Width;height=$screen.Bounds.Height}
    primary=$screen.Primary
    measured_at=(Get-Date).ToUniversalTime().ToString('o')
  }|ConvertTo-Json -Compress
}
if($screens.Count -ne 4){
  Write-Output ("PHYSICAL_MONITORS=UNKNOWN count="+$screens.Count+" device_names="+(($screens|ForEach-Object{$_.DeviceName}) -join ',')+" - sessão grafica pode ser virtual")
  exit 2
}
if(-not $Identify){exit 0}
# Use somente o controle Identificar nativo do Windows. Nenhuma sobreposicao falsa.
Start-Process 'ms-settings:display'
Start-Sleep -Milliseconds 900
try{
  Add-Type -AssemblyName UIAutomationClient
  Add-Type -AssemblyName UIAutomationTypes
  $root=[System.Windows.Automation.AutomationElement]::RootElement
  $buttons=$root.FindAll([System.Windows.Automation.TreeScope]::Descendants,
    [System.Windows.Automation.PropertyCondition]::new(
      [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
      [System.Windows.Automation.ControlType]::Button))
  foreach($button in $buttons){
    $name=$button.Current.Name.Trim()
    if($name -in @('Identificar','Identify') -and $button.Current.IsEnabled){
      $pattern=$button.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern)
      $pattern.Invoke()
      Write-Output 'NATIVE_IDENTIFY=INVOKED'
      exit 0
    }
  }
  Write-Output 'NATIVE_IDENTIFY=NOT_FOUND_IN_WINDOWS_SETTINGS'
  exit 2
}catch{
  Write-Output ('NATIVE_IDENTIFY=UNAVAILABLE REASON='+$_.Exception.GetType().Name)
  exit 3
}
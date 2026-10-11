@echo off
setlocal EnableExtensions DisableDelayedExpansion
title CENTRALDARK - CORPO UNICO - HUD + LOGS
set "CD_MONITOR_SOURCE=%~f0"
set "CD_MONITOR_PS=%TEMP%\CentralDark-CorpoUnico-%RANDOM%-%RANDOM%.ps1"
powershell.exe -NoProfile -Command "$s=[IO.File]::ReadAllText($env:CD_MONITOR_SOURCE);$m='::CENTRALDARK_PS_PAYLOAD_BEGIN';$p=$s.LastIndexOf([string][char]10+$m);if($p -lt 0){exit 3};$c=$s.Substring($p+1+$m.Length).TrimStart([char]13,[char]10);[IO.File]::WriteAllText($env:CD_MONITOR_PS,$c,(New-Object System.Text.UTF8Encoding($true)))"
if errorlevel 1 (
 echo [ERRO] Falha preparando HUD unico.
 pause
 exit /b 3
)
REM One visible GUI. The PowerShell host stays hidden; the integrated log panel is the terminal view.
start "" powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -STA -WindowStyle Hidden -File "%CD_MONITOR_PS%"
if errorlevel 1 (
 echo [ERRO] Nao foi possivel iniciar o HUD unico.
 pause
 exit /b 4
)
exit /b 0
::CENTRALDARK_PS_PAYLOAD_BEGIN
# CENTRALDARK: SOMENTE LEITURA. Uma janela, um owner, nenhum segundo HUD ou Screenpipe.
# Windows PowerShell 5.1 + WinForms. Nao solicita elevacao nem modifica regras ou credenciais.
$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$Casa = '100.123.93.25'
$Vps  = '100.90.199.124'
$script:LogRoot = Join-Path $env:LOCALAPPDATA 'CentralDark'
$script:LogFile = Join-Path $script:LogRoot 'Corpo-Unico-HUD-Logs.txt'
# Reaproveita os scripts existentes: fonte != execucao; NUNCA le tailscale.env.
$script:ScriptRoot = if($env:CD_MONITOR_SOURCE){Split-Path -Parent $env:CD_MONITOR_SOURCE}else{$null}
if (-not $script:ScriptRoot -or -not (Test-Path -LiteralPath $script:ScriptRoot)) {
  $script:ScriptRoot = Join-Path $env:USERPROFILE 'Downloads\CRISTAL LOGICA\scripts'
}
$script:ScriptSeen = @{}
$script:ScriptLogSeen = @{}
$script:ScriptPollOnce = $false
$script:Cycle = 0
$script:RemoteJob = $null
$script:RemoteLast = [datetime]::MinValue
$script:RemoteState = 'UNKNOWN'
$script:HeartState = 'UNKNOWN'
$script:RemoteInfo = 'sem leitura SSH'
$script:LastScreenLogFile = $null
$script:LastScreenLogStamp = [datetime]::MinValue
$script:Started = Get-Date
$script:Loading = $false
try { New-Item -ItemType Directory -Path $script:LogRoot -Force | Out-Null } catch { }
$created = $false
$mutex = [System.Threading.Mutex]::new($true, 'Local\CentralDark_CorpoUnico_HudLogs', [ref]$created)
if (-not $created) {
  [System.Windows.Forms.MessageBox]::Show('O HUD CentralDark ja esta aberto. Nao vou iniciar outra janela.', 'CentralDark - uma janela') | Out-Null
  exit 0
}
function Clean([string]$Value) {
  if (-not $Value) { return '' }
  $Value = $Value -replace '(?i)(authorization\s*[:=]\s*(?:bearer|basic)\s+)\S+','$1[OCULTO]'
  $Value = $Value -replace '(?i)((?:api[_-]?key|token|password|secret)\s*[:=]\s*)\S+','$1[OCULTO]'
  $Value = $Value -replace '(?i)(--(?:api-key|token|password|secret)\s+)\S+','$1[OCULTO]'
  $Value = $Value -replace '(?i)(user_code=)[A-Z0-9-]+','$1[OCULTO]'
  $Value = $Value -replace '(?i)(cookie\s*[:=]\s*)\S+','$1[OCULTO]'
  if ($Value.Length -gt 500) { return $Value.Substring(0,500) + ' ...' }
  return $Value
}
$bg = [Drawing.Color]::FromArgb(13,17,23)
$panel = [Drawing.Color]::FromArgb(21,28,38)
$light = [Drawing.Color]::FromArgb(222,232,242)
$dim = [Drawing.Color]::FromArgb(156,171,188)
$green = [Drawing.Color]::FromArgb(73,214,137)
$yellow = [Drawing.Color]::FromArgb(245,187,75)
$red = [Drawing.Color]::FromArgb(240,108,105)
$cyan = [Drawing.Color]::FromArgb(97,194,231)
$form = New-Object Windows.Forms.Form
$form.Text = 'CENTRALDARK | CORPO UNICO | HUD FIXO + LOGS AO VIVO'
$form.Size = New-Object Drawing.Size(1120,790)
$form.MinimumSize = New-Object Drawing.Size(890,620)
$form.StartPosition = 'CenterScreen'
$form.BackColor = $bg
$form.ForeColor = $light
$form.Font = New-Object Drawing.Font('Segoe UI',10)
$header = New-Object Windows.Forms.Panel
$header.Dock = 'Top'; $header.Height = 116; $header.BackColor = $panel
$form.Controls.Add($header)
$title = New-Object Windows.Forms.Label
$title.Text = 'CENTRALDARK  /  UM CORPO  /  UM MONITOR'
$title.ForeColor = $cyan; $title.Font = New-Object Drawing.Font('Segoe UI Semibold',17,[Drawing.FontStyle]::Bold)
$title.AutoSize = $true; $title.Location = New-Object Drawing.Point(20,9)
$header.Controls.Add($title)
$subtitle = New-Object Windows.Forms.Label
$subtitle.Text = 'Casa + Tailscale + Screenpipe + Hermes + VPS + Supabase + Desktop Commander + HUD | somente leitura'
$subtitle.ForeColor=$dim;$subtitle.AutoSize=$true;$subtitle.Location=New-Object Drawing.Point(22,45)
$header.Controls.Add($subtitle)
# ACTION STRIP: mesma janela WinForms, visual preservado, login sempre humano no provedor.
$actions = New-Object Windows.Forms.FlowLayoutPanel
$actions.Dock = 'Bottom'; $actions.Height = 44
$actions.BackColor = $panel; $actions.WrapContents = $false
$actions.Padding = New-Object Windows.Forms.Padding(17,4,0,1)
$header.Controls.Add($actions)
function New-HudAction([string]$Caption,[int]$Width) {
  $b = New-Object Windows.Forms.Button
  $b.Text = $Caption; $b.Width=$Width; $b.Height=31
  $b.Margin = New-Object Windows.Forms.Padding(3,0,5,0)
  $b.BackColor=[Drawing.Color]::FromArgb(33,47,63)
  $b.ForeColor=$cyan; $b.FlatStyle='Flat'
  $b.FlatAppearance.BorderColor=[Drawing.Color]::FromArgb(56,85,111)
  $b.Cursor='Hand';$b.Font=New-Object Drawing.Font('Segoe UI Semibold',9)
  $actions.Controls.Add($b)
  return $b
}
$script:BtnProfile1=New-HudAction '🔐 Conta 1' 133
$script:BtnProfile2=New-HudAction '🔐 Conta 2' 133
$script:BtnScreenpipe=New-HudAction '👁 Screenpipe' 140
$script:BtnDesktop=New-HudAction '🖥 Desktop Commander' 183
$script:BtnVerify=New-HudAction '🔄 Conferir' 118

$footer = New-Object Windows.Forms.Panel
$footer.Dock='Bottom';$footer.Height=39;$footer.BackColor=$panel
$form.Controls.Add($footer)
$footLabel=New-Object Windows.Forms.Label
$footLabel.AutoSize=$false;$footLabel.Dock='Fill';$footLabel.TextAlign='MiddleLeft'
$footLabel.ForeColor=$dim;$footLabel.Padding=New-Object Windows.Forms.Padding(13,0,0,0)
$footLabel.Text='Casa 10s | VPS 40s | Supabase 60s | nenhuma nova janela ou servico'
$footer.Controls.Add($footLabel)
$split=New-Object Windows.Forms.SplitContainer
$split.Dock='Fill';$split.Orientation='Horizontal';$split.SplitterWidth=7
$split.BackColor=$bg;$split.Panel1.BackColor=$bg;$split.Panel2.BackColor=$bg
$form.Controls.Add($split)
$form.Controls.SetChildIndex($split,0)
$top=New-Object Windows.Forms.TableLayoutPanel
$top.Dock='Fill';$top.ColumnCount=2;$top.RowCount=5;$top.BackColor=$bg
$top.Padding=New-Object Windows.Forms.Padding(12,10,12,6)
$top.ColumnStyles.Add((New-Object Windows.Forms.ColumnStyle([Windows.Forms.SizeType]::Percent,50))) | Out-Null
$top.ColumnStyles.Add((New-Object Windows.Forms.ColumnStyle([Windows.Forms.SizeType]::Percent,50))) | Out-Null
for($i=0;$i -lt 5;$i++){ $top.RowStyles.Add((New-Object Windows.Forms.RowStyle([Windows.Forms.SizeType]::Percent,20))) | Out-Null }
$split.Panel1.Controls.Add($top)
$script:Cards=@{}
$sectors=@('CASA / WINDOWS','TAILSCALE / MALHA','SCREENPIPE / TELA','HERMES / SSH','VPS / CORACAO','RUNTIME / PORTAS','HUD / OBSIDIAN','PROVA / ARQUIVO','DESKTOP COMMANDER','SUPABASE / PLUGIN')
for($i=0;$i -lt $sectors.Count;$i++){
  $cell=New-Object Windows.Forms.Panel
  $cell.Margin=New-Object Windows.Forms.Padding(4)
  $cell.Dock='Fill';$cell.BackColor=$panel
  $name=New-Object Windows.Forms.Label
  $name.Text=$sectors[$i];$name.ForeColor=$dim;$name.AutoSize=$false
  $name.Location=New-Object Drawing.Point(12,7);$name.Size=New-Object Drawing.Size(350,19)
  $name.Font=New-Object Drawing.Font('Segoe UI Semibold',9,[Drawing.FontStyle]::Bold)
  $cell.Controls.Add($name)
  $value=New-Object Windows.Forms.Label
  $value.Text='UNKNOWN | aguardando leitura';$value.ForeColor=$yellow;$value.AutoSize=$false
  $value.Location=New-Object Drawing.Point(12,29);$value.Anchor='Top,Left,Right'
  $value.Size=New-Object Drawing.Size(490,24)
  $cell.Controls.Add($value)
  $top.Controls.Add($cell,($i%2),[int][Math]::Floor($i/2))
  $script:Cards[$sectors[$i]]=$value
}
$tab=New-Object Windows.Forms.TabControl
$tab.Dock='Fill';$tab.Font=New-Object Drawing.Font('Segoe UI',9)
$split.Panel2.Controls.Add($tab)
$script:LogViews=@{}
$names=@('TODOS','SCREENPIPE','VPS','HERMES','HUD','RUNTIME','TAILSCALE','WINDOWS','DESKTOP','SUPABASE','SCRIPTS')
foreach($n in $names){
  $page=New-Object Windows.Forms.TabPage
  $page.Text=$n;$page.BackColor=$bg
  $view=New-Object Windows.Forms.RichTextBox
  $view.Dock='Fill';$view.ReadOnly=$true;$view.WordWrap=$false
  $view.BackColor=$bg;$view.ForeColor=$light
  $view.BorderStyle='None';$view.Font=New-Object Drawing.Font('Consolas',9)
  $page.Controls.Add($view);$tab.TabPages.Add($page)
  $script:LogViews[$n]=$view
}
function Add-Log([string]$Sector,[string]$Level,[string]$Message){
  $Message=Clean $Message
  $line=('[{0}] [{1}] [{2}] {3}' -f (Get-Date -Format 'HH:mm:ss'),$Sector,$Level,$Message)
  $color=if($Level -eq 'PASS'){$green}elseif($Level -in @('WARN','UNKNOWN')){$yellow}elseif($Level -eq 'FAIL'){$red}else{$light}
  foreach($n in @('TODOS',$Sector) | Select-Object -Unique){
    if(-not $script:LogViews.ContainsKey($n)){continue}
    $v=$script:LogViews[$n]
    if($v.TextLength -gt 95000) { $v.Select(0,22000);$v.SelectedText='' }
    $v.SelectionStart=$v.TextLength;$v.SelectionLength=0;$v.SelectionColor=$color
    $v.AppendText($line+[Environment]::NewLine)
    $v.SelectionStart=$v.TextLength;$v.ScrollToCaret()
  }
  try { Add-Content -LiteralPath $script:LogFile -Value $line -Encoding UTF8 -ErrorAction Stop } catch { }
}
function Set-Card([string]$Sector,[string]$State,[string]$Details){
  if (-not $script:Cards.ContainsKey($Sector)){return}
  $label=$script:Cards[$Sector]
  $text=$State+' | '+$Details
  if($label.Text -ne $text){
    $label.Text=$text;$label.ForeColor=if($State -eq 'PASS'){$green}elseif($State -eq 'FAIL'){$red}else{$yellow}
    $logSector=switch -Wildcard ($Sector){'CASA*'{'WINDOWS'};'TAILSCALE*'{'TAILSCALE'};'SCREENPIPE*'{'SCREENPIPE'};'HERMES*'{'HERMES'};'VPS*'{'VPS'};'RUNTIME*'{'RUNTIME'};'HUD*'{'HUD'};'PROVA*'{'WINDOWS'};'DESKTOP*'{'DESKTOP'};'SUPABASE*'{'SUPABASE'}}
    Add-Log $logSector $State ($Sector+': '+$Details)
  }
}
function Refresh-Scripts {
  # Catalogo da raiz ja escolhida: loga fonte e mudancas, nao inventa runtime.
  $extensions=@('.bat','.batt','.cmd','.ps1','.sh','.py','.pyw','.js','.mjs','.cjs')
  $sources=@()
  try {
    $sources=@(Get-ChildItem -LiteralPath $script:ScriptRoot -File -ErrorAction Stop |
      Where-Object { $extensions -contains $_.Extension.ToLowerInvariant() })
  } catch {
    if (-not $script:ScriptPollOnce) { Add-Log 'SCRIPTS' 'UNKNOWN' 'Pasta de scripts indisponivel' }
  }
  if (-not $script:ScriptPollOnce) {
    Add-Log 'SCRIPTS' 'INFO' ("Catalogo: {0} arquivo(s) em {1}; fonte != executado" -f $sources.Count,$script:ScriptRoot)
    Add-Log 'SCRIPTS' 'INFO' 'tail de logs autorizados: scripts\logs\*.log + bridge preexistente. Nunca le .env.'
  }
  foreach($f in $sources) {
    $signature=('{0}|{1}' -f $f.Length,$f.LastWriteTimeUtc.Ticks)
    if (-not $script:ScriptSeen.ContainsKey($f.FullName)) {
      $script:ScriptSeen[$f.FullName]=$signature
      Add-Log 'SCRIPTS' 'INFO' ("{0}: SOURCE_PRESENT; execucao UNKNOWN" -f $f.Name)
    } elseif($script:ScriptSeen[$f.FullName] -ne $signature) {
      $script:ScriptSeen[$f.FullName]=$signature
      Add-Log 'SCRIPTS' 'WARN' ("{0}: arquivo alterado; validar origem/checksum" -f $f.Name)
    }
  }
  # So arquivos de LOG previamente existentes; nao executa .sh/.py/.js.
  $logItems=[System.Collections.ArrayList]::new()
  $localLogs=Join-Path $script:ScriptRoot 'logs'
  if (Test-Path -LiteralPath $localLogs -PathType Container) {
    Get-ChildItem -LiteralPath $localLogs -File -Filter '*.log' -ErrorAction SilentlyContinue |
      Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 18 |
      ForEach-Object { [void]$logItems.Add($_) }
  }
  $known=@(
    (Join-Path $env:TEMP 'centraldark-hud-unified\centraldark-hud-live.log'),
    'F:\Bridge\logs\bridge.log'
  )
  foreach($path in $known) {
    if(Test-Path -LiteralPath $path -PathType Leaf) {
      try { [void]$logItems.Add((Get-Item -LiteralPath $path -ErrorAction Stop)) } catch {}
    }
  }
  foreach($log in $logItems) {
    $signature=('{0}|{1}' -f $log.Length,$log.LastWriteTimeUtc.Ticks)
    if($script:ScriptLogSeen.ContainsKey($log.FullName) -and $script:ScriptLogSeen[$log.FullName] -eq $signature){ continue }
    $script:ScriptLogSeen[$log.FullName]=$signature
    try {
      $samples=@(Get-Content -LiteralPath $log.FullName -Tail 6 -ErrorAction Stop)
      foreach($entry in $samples) {
        if(-not [string]::IsNullOrWhiteSpace($entry)) {
          Add-Log 'SCRIPTS' 'LOG' ("[{0}] {1}" -f $log.Name,$entry)
        }
      }
    } catch {
      Add-Log 'SCRIPTS' 'WARN' ("Log presente mas leitura falhou: {0}" -f $log.Name)
    }
  }
  $script:ScriptPollOnce=$true
}
function Port-Open([int]$Port){
  try {return (@(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop).Count -gt 0)} catch { return $false }
}
function Find-ScreenpipeLog {
  $dirs=@((Join-Path $env:USERPROFILE '.screenpipe\logs'),(Join-Path $env:LOCALAPPDATA 'screenpipe\logs'),(Join-Path $env:APPDATA 'screenpipe\logs'))
  foreach($d in $dirs){
    if(-not(Test-Path -LiteralPath $d -PathType Container)){continue}
    $f=Get-ChildItem -LiteralPath $d -File -Filter '*.log' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if($f){return $f}
  }
  return $null
}
$script:ScreenLogWarned=$false
$script:SupabaseProject='lyoigsqluyktoclwdaft'
$script:SupabaseBridgeUrl='https://lyoigsqluyktoclwdaft.supabase.co/functions/v1/centraldark-bridge'
$script:SupabaseLast=[datetime]::MinValue
function Refresh-DesktopCommander {
  try{
    $running=@(Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction Stop |
      Where-Object {$_.CommandLine -match '(?i)desktop-commander.*remote'})
    if($running.Count -gt 0){
      $pids=($running | ForEach-Object {[string]$_.ProcessId}) -join ','
      Set-Card 'DESKTOP COMMANDER' 'PASS' ('processo PID='+$pids+'; execucao remota medida separadamente')
    }else{
      Set-Card 'DESKTOP COMMANDER' 'UNKNOWN' 'processo remoto local nao encontrado'
    }
  }catch{
    Set-Card 'DESKTOP COMMANDER' 'UNKNOWN' 'consulta local indisponivel'
  }
}
function Refresh-Supabase {
  try{
    $body='{"limit":1,"mission_state":"queued"}'
    $reply=Invoke-RestMethod -Uri $script:SupabaseBridgeUrl -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 7 -ErrorAction Stop
    if($reply.ok -eq $true -and $reply.project -eq $script:SupabaseProject){
      $summary=$reply.summary
      $agents=if($summary){$summary.agents_ativos}else{'?'}
      Set-Card 'SUPABASE / PLUGIN' 'PASS' ('projeto validado; agentes='+$agents+'; Obsidian E2E UNKNOWN')
    }else{
      Set-Card 'SUPABASE / PLUGIN' 'UNKNOWN' 'resposta sem projeto confirmado'
    }
  }catch{
    Set-Card 'SUPABASE / PLUGIN' 'UNKNOWN' 'bridge HTTP indisponivel/sem autorizacao'
  }
}
function Local-Refresh {
  $script:Cycle++
  $tailPass=$false
  $hudPass=$false
  $rdp=(Get-Service TermService -ErrorAction SilentlyContinue)
  $wrm=(Get-Service WinRM -ErrorAction SilentlyContinue)
  $r=($rdp -and $rdp.Status -eq 'Running' -and (Port-Open 3389))
  $w=($wrm -and $wrm.Status -eq 'Running' -and (Port-Open 5985))
  if($r -and $w){Set-Card 'CASA / WINDOWS' 'PASS' 'RDP 3389 + WinRM 5985 locais'}
  else {Set-Card 'CASA / WINDOWS' 'WARN' 'verificar servicos RDP / WinRM'}
  $tsCmd=Get-Command tailscale.exe -ErrorAction SilentlyContinue
  $tsExe=if($tsCmd){$tsCmd.Source}else{Join-Path $env:ProgramFiles 'Tailscale\tailscale.exe'}
  if(Test-Path -LiteralPath $tsExe){
    try{
      $status=(& $tsExe status --json 2>$null | Out-String) | ConvertFrom-Json -ErrorAction Stop
      $peers=@($status.Peer.PSObject.Properties.Value | Where-Object { $_.Online -and $_.TailscaleIPs -contains $Vps })
      if($status.BackendState -eq 'Running' -and $peers.Count -gt 0){$tailPass=$true;Set-Card 'TAILSCALE / MALHA' 'PASS' 'Casa + VPS na mesma malha'}
      else{Set-Card 'TAILSCALE / MALHA' 'WARN' 'VPS ou tailnet nao confirmados'}
    }catch{Set-Card 'TAILSCALE / MALHA' 'UNKNOWN' 'Tailscale sem resposta valida'}
  }else{Set-Card 'TAILSCALE / MALHA' 'UNKNOWN' 'cliente nao encontrado'}
  $screenPass=$false
  try{
    $res=Invoke-WebRequest -Uri 'http://127.0.0.1:3030/health' -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if($res.StatusCode -eq 200){
      $screenPass=$true
      Set-Card 'SCREENPIPE / TELA' 'PASS' 'HTTP 200 /health local; captura nao comprovada'
    }else{
      Set-Card 'SCREENPIPE / TELA' 'UNKNOWN' ('health HTTP '+$res.StatusCode)
    }
  }catch{
    Set-Card 'SCREENPIPE / TELA' 'UNKNOWN' 'health nao respondeu; sem iniciar outra instancia'
  }
  $slog=Find-ScreenpipeLog
  if($slog){
    if($script:LastScreenLogFile -ne $slog.FullName -or $slog.LastWriteTime -gt $script:LastScreenLogStamp){
      $script:LastScreenLogFile=$slog.FullName;$script:LastScreenLogStamp=$slog.LastWriteTime
      try{Get-Content -LiteralPath $slog.FullName -Tail 5 -ErrorAction Stop | ForEach-Object {Add-Log 'SCREENPIPE' 'LOG' $_}}catch{Add-Log 'SCREENPIPE' 'WARN' 'arquivo de log local nao pode ser lido'}
    }
  }elseif(-not $script:ScreenLogWarned){
    Add-Log 'SCREENPIPE' 'UNKNOWN' 'stdout do gravador em outra janela nao tem arquivo de log conhecido; /health segue monitorado'
    $script:ScreenLogWarned=$true
  }
  # Path found by file-name, without guessing emoji spelling.
  $vault=Join-Path (Join-Path $env:USERPROFILE 'Documents') 'Obsidian Vault'
  $hudFile=$null
  if(Test-Path $vault){
    $hudFile=Get-ChildItem -LiteralPath $vault -Directory -ErrorAction SilentlyContinue | ForEach-Object {Join-Path $_.FullName 'HUD.html'} | Where-Object {Test-Path -LiteralPath $_ -PathType Leaf} | Select-Object -First 1
  }
  if($hudFile){
    $hudPass=$true
    $f=Get-Item -LiteralPath $hudFile
    Set-Card 'HUD / OBSIDIAN' 'PASS' ('HUD local existe; '+$f.LastWriteTime.ToString('dd/MM HH:mm'))
  }else{Set-Card 'HUD / OBSIDIAN' 'UNKNOWN' 'HUD.html local nao localizado'}
  if($screenPass -and $tailPass -and $hudPass){
    Set-Card 'PROVA / ARQUIVO' 'PASS' 'provas locais: /health + Tailscale + HUD; sem TXT'
  }else{
    Set-Card 'PROVA / ARQUIVO' 'UNKNOWN' 'readback incompleto; sem exigir TXT'
  }
  Refresh-DesktopCommander
  if(((Get-Date)-$script:SupabaseLast).TotalSeconds -ge 60){
    $script:SupabaseLast=Get-Date
    Refresh-Supabase
  }
  Set-Card 'RUNTIME / PORTAS' $(if((Port-Open 3030) -and (Port-Open 3389)){'PASS'}else{'WARN'}) '3030 Screenpipe / 3389 RDP (portas locais)'
  $footLabel.Text=('Ultima leitura: {0} | ciclo {1} | VPS 40s | Supabase 60s | LOG: {2}' -f (Get-Date -Format 'HH:mm:ss'),$script:Cycle,$script:LogFile)
}
# SSH read-only, never opens a second HUD or remote interactive terminal.
# Job prevents the GUI from freezing while SSH times out.
$script:RemoteScript = {
  param($cmd)
  $ErrorActionPreference='SilentlyContinue'
  # Reuse Segredo-VPS and the Git SSH client whose key/config were verified in Casa.
  $sshPath=Join-Path $env:ProgramFiles 'Git\usr\bin\ssh.exe'
  if(-not (Test-Path -LiteralPath $sshPath -PathType Leaf)){return 'CD_SSH=UNKNOWN|Git SSH nao encontrado'}
  $exe=$sshPath
  $remote='echo CD_SSH=PASS; printf "CD_HEART="; curl -fsS --max-time 3 http://127.0.0.1:9100/heartbeat 2>/dev/null; echo; echo CD_RUNTIME; uptime; ps -eo comm= | grep -E "(node|pm2|screenpipe|llama|hermes)" | sort -u | head -8; echo CD_VPS_SENSORS; for unit in desktop-commander-remote.service centraldark-desktop-commander-conta2.service; do state=$(systemctl is-active "$unit" 2>/dev/null || true); echo "CD_DC=$unit,${state:-UNKNOWN}"; done; sc=$(curl --noproxy "*" -s -o /dev/null -w "%{http_code}" --connect-timeout 2 --max-time 3 http://127.0.0.1:3030/health 2>/dev/null || true); echo "CD_SCREENPIPE_VPS=${sc:-000}"; if [ -f /root/CentralDark/apps/modulos/elite-gateway/test-local/local_send_dump.py ]; then echo CD_ZENDRIVE=CODE_PRESENT_RUNTIME_UNKNOWN; else echo CD_ZENDRIVE=CODE_NOT_FOUND_RUNTIME_UNKNOWN; fi; echo CD_VPS_LOG; journalctl -n 8 -p warning --no-pager --output=short-iso 2>/dev/null | tail -8'
  $encoded=[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($remote))
  $out=$encoded | & $exe -T -o BatchMode=yes -o ConnectTimeout=5 -o ConnectionAttempts=1 -o StrictHostKeyChecking=yes Segredo-VPS 'base64 -d | bash -s' 2>&1 | Out-String
  if($LASTEXITCODE -ne 0){return ('CD_SSH=UNKNOWN|ssh exit '+$LASTEXITCODE)}
  return $out
}
function Poll-Remote {
  if($script:RemoteJob -and $script:RemoteJob.State -ne 'Running'){
    $out=Receive-Job $script:RemoteJob -ErrorAction SilentlyContinue | Out-String
    Remove-Job $script:RemoteJob -Force -ErrorAction SilentlyContinue
    $script:RemoteJob=$null
    $lines=$out -split '\r?\n'
    $okay=($out -match 'CD_SSH=PASS')
    if($okay){
      Set-Card 'HERMES / SSH' 'PASS' 'Segredo-VPS autenticado em leitura'
      $heartLine=$lines | Where-Object {$_ -match '^CD_HEART='} | Select-Object -First 1
      if($heartLine -and $heartLine -match '"heart"\s*:\s*"one"' -and $heartLine -match '"ok"\s*:\s*true' -and $heartLine -match '"self"\s*:\s*"(alive|fresh|ok|healthy)"'){
        Set-Card 'VPS / CORACAO' 'PASS' 'One Heart JSON confirmou estado fresco'
      }elseif($heartLine -and $heartLine -match '"self"\s*:\s*"stale"'){
        Set-Card 'VPS / CORACAO' 'UNKNOWN' 'SSH responde; heartbeat stale (nao PASS)'
      }else{Set-Card 'VPS / CORACAO' 'UNKNOWN' 'SSH responde; heartbeat fresco nao provado'}
      $sect='HERMES'
      foreach($line in $lines){
        if($line -match '^CD_RUNTIME'){$sect='RUNTIME';continue}
        if($line -match '^CD_VPS_SENSORS'){$sect='RUNTIME';continue}
        if($line -match '^CD_VPS_LOG'){$sect='VPS';continue}
        if($line -match '^CD_DC=(.+)$'){
          $state=$Matches[1];$level=if($state -match ',active$'){'WARN'}else{'UNKNOWN'}
          Add-Log 'DESKTOP' $level ('VPS Desktop Commander '+$state+'; conta autenticada nao comprovada')
          continue
        }
        if($line -match '^CD_SCREENPIPE_VPS=(\d+)$'){
          $code=$Matches[1]
          $level=if($code -eq '200'){'PASS'}else{'UNKNOWN'}
          Add-Log 'SCREENPIPE' $level ('VPS Screenpipe /health HTTP '+$code+'; captura e MCP nao inferidos')
          continue
        }
        if($line -match '^CD_ZENDRIVE=(.+)$'){
          Add-Log 'SCRIPTS' 'UNKNOWN' ('VPS Zendrive: '+$Matches[1]+' (arquivo nao prova sessao)')
          continue
        }
        if($line -match '^CD_HEART='){Add-Log 'VPS' 'LOG' 'Heartbeat consultado; detalhes tecnicos disponiveis no SSH';continue}
        if($line -match '^CD_SSH='){continue}
        if(-not [string]::IsNullOrWhiteSpace($line)){Add-Log $sect 'LOG' $line}
      }
    }else{
      Set-Card 'HERMES / SSH' 'UNKNOWN' 'Segredo-VPS sem sessao autenticada'
      Set-Card 'VPS / CORACAO' 'UNKNOWN' 'sem leitura do heartbeat'
      Add-Log 'HERMES' 'WARN' 'SSH indisponivel: sem mexer em chave/senha'
    }
  }
  if(-not $script:RemoteJob -and ((Get-Date)-$script:RemoteLast).TotalSeconds -ge 40){
    $script:RemoteLast=Get-Date
    $script:RemoteJob=Start-Job -ScriptBlock $script:RemoteScript -ArgumentList 'none'
  }
}

# Botões somente no HUD WinForms original. Login e troca de conta ocorrem no provedor.
$script:AccountProbeJob=$null
function Start-AccountProbe([string]$StartProfile='none') {
  if($script:AccountProbeJob -and $script:AccountProbeJob.State -eq 'Running') {
    Add-Log 'DESKTOP' 'INFO' 'Consulta anterior rodando; SSH nao duplicado'
    return
  }
  if($script:AccountProbeJob) {
    Remove-Job $script:AccountProbeJob -Force -ErrorAction SilentlyContinue
    $script:AccountProbeJob=$null
  }
  $script:AccountProbeJob=Start-Job -ArgumentList $StartProfile -ScriptBlock {
    param([string]$StartFor)
    $ssh=Join-Path $env:ProgramFiles 'Git\usr\bin\ssh.exe'
    if(!(Test-Path -LiteralPath $ssh)) { return 'CD_PROBE_ERROR|GIT_SSH_MISSING' }
    $remote=@'
for entry in principal:desktop-commander-remote.service conta2:centraldark-desktop-commander-conta2.service; do
  name="$(printf '%s' "$entry" | cut -d: -f1)"
  unit="$(printf '%s' "$entry" | cut -d: -f2)"
  load="$(systemctl show "$unit" -p LoadState --value 2>/dev/null || true)"
  state="$(systemctl is-active "$unit" 2>/dev/null || true)"
  if [ "$START_FOR" = "$name" ] && [ "$load" = loaded ] && [ "$state" != active ]; then
    systemctl start "$unit" >/dev/null 2>&1 || true
    state="$(systemctl is-active "$unit" 2>/dev/null || true)"
  fi
  auth=UNKNOWN
  if [ "$state" = active ]; then
    recent="$(journalctl -u "$unit" --since '-15 minutes' --no-pager -o cat 2>/dev/null | tail -n 90)"
    last_event="$(printf '%s\n' "$recent" | grep -Ei 'Device ready|Device marked as online|Device marked as offline|Authorization successful|Waiting for authorization|Device code received|Starting device authorization' | tail -1)"
    if printf '%s' "$last_event" | grep -Eiq 'Device ready|Device marked as online|Authorization successful'; then auth=READY_LOG
    elif printf '%s' "$last_event" | grep -Eiq 'Waiting for authorization|Device code received|Starting device authorization'; then auth=LOGIN_PENDING
    else auth=UNKNOWN
    fi
  fi
  printf 'CD_PROFILE|%s|%s|%s|%s\n' "$name" "$load" "$state" "$auth"
done
'@
    $prefix='START_FOR=none; '
    if($StartFor -eq 'principal') {$prefix='START_FOR=principal; '}
    elseif($StartFor -eq 'conta2') {$prefix='START_FOR=conta2; '}
    # Codigo do device vem do journal do perfil escolhido, nunca salvo no BAT.
    if($StartFor -eq 'principal' -or $StartFor -eq 'conta2') {
      $remote += @'

if [ "$START_FOR" = principal ]; then selected_unit=desktop-commander-remote.service; else selected_unit=centraldark-desktop-commander-conta2.service; fi
logs="$(journalctl -u "$selected_unit" --since "-10 minutes" --no-pager -o cat 2>/dev/null)"
code="$(printf '%s\n' "$logs" | grep -Eo '[A-Z0-9]{4}-[A-Z0-9]{4}' | tail -1)"
last_auth="$(printf '%s\n' "$logs" | grep -Ei 'Device marked as online|Device ready|Waiting for authorization|Device marked as offline' | tail -1)"
# So regenera o codigo da conta2 quando o clique e explicito e ela nao esta autenticada.
if [ -z "$code" ] && [ "$START_FOR" = conta2 ] && ! printf '%s' "$last_auth" | grep -Eiq 'Device marked as online|Device ready'; then
  systemctl restart "$selected_unit" >/dev/null 2>&1 || true
  for wait_attempt in 1 2 3 4 5 6; do
    sleep 1
    logs="$(journalctl -u "$selected_unit" --since "-2 minutes" --no-pager -o cat 2>/dev/null)"
    code="$(printf '%s\n' "$logs" | grep -Eo '[A-Z0-9]{4}-[A-Z0-9]{4}' | tail -1)"
    if [ -n "$code" ]; then break; fi
  done
fi
if [ -n "$code" ]; then printf 'CD_VERIFY|%s|%s\n' "$START_FOR" "$code"; else printf 'CD_VERIFY|%s|UNAVAILABLE\n' "$START_FOR"; fi
'@
    }
    # Script via stdin: evita quebra de aspas do shell remoto (SSH_EXIT_2).
    $cmdText=($prefix+"`n"+$remote).Replace("`r",'')
    $payload=[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($cmdText))
    $out=$payload | & $ssh -T -o BatchMode=yes -o ConnectTimeout=7 -o StrictHostKeyChecking=yes Segredo-VPS 'base64 -d | bash -s' 2>$null | Out-String
    if($LASTEXITCODE -ne 0) {return ('CD_PROBE_ERROR|SSH_EXIT_'+$LASTEXITCODE)}
    return $out
  }
}
function Poll-AccountProbe {
  if(!$script:AccountProbeJob -or $script:AccountProbeJob.State -eq 'Running'){return}
  $output=(Receive-Job $script:AccountProbeJob -ErrorAction SilentlyContinue | Out-String)
  Remove-Job $script:AccountProbeJob -Force -ErrorAction SilentlyContinue
  $script:AccountProbeJob=$null
  $lines=@($output -split '[\r\n]+' | Where-Object {$_ -match '^CD_PROFILE\|' })
  # Abre apenas URL do perfil que o humano clicou. Nunca registra/mostra codigo em log.
  if($script:PendingAuthProfile) {
    $selected=$script:PendingAuthProfile
    $script:PendingAuthProfile=$null
    $verify=@($output -split '[\r\n]+' | Where-Object {$_ -match '^CD_VERIFY\|' } | Select-Object -Last 1)
    $parts=if($verify.Count){$verify[0].Split('|')}else{@()}
    if($parts.Count -eq 3 -and $parts[1] -eq $selected -and $parts[2] -match '^[A-Z0-9]{4}-[A-Z0-9]{4}$') {
      $url='https://mcp.desktopcommander.app/verify-device?verify_device=true&user_code='+[uri]::EscapeDataString($parts[2])
      try {Start-Process $url -ErrorAction Stop|Out-Null; Add-Log 'DESKTOP' 'INFO' ('Autorizacao '+$selected+': pagina oficial com codigo temporario preenchido')}
      catch {Add-Log 'DESKTOP' 'WARN' 'Navegador nao abriu para verificar dispositivo'}
    } else {
      Add-Log 'DESKTOP' 'UNKNOWN' ('Codigo fresco nao disponivel para '+$selected+'; abrindo dispositivos, sem usar codigo antigo')
      try {Start-Process 'https://mcp.desktopcommander.app/' -ErrorAction Stop|Out-Null}catch{}
    }
  }
  if($lines.Count -eq 0) {
    $signal=($output -split '[\r\n]+' | Where-Object { $_ -match '^CD_PROBE_ERROR\|' } | Select-Object -First 1)
    if(-not $signal){$signal='NO_JOB_RECEIPT'}
    Add-Log 'DESKTOP' 'UNKNOWN' ('Consulta sem receipt: '+$signal+'; autorizacao nao inferida')
    return
  }
  foreach($line in $lines) {
    $fields=$line.Split('|')
    if($fields.Count -ne 5){continue}
    $label=if($fields[1] -eq 'principal'){'CONTA 1'}else{'CONTA 2'}
    $level=if($fields[2] -eq 'loaded' -and $fields[3] -eq 'active' -and $fields[4] -eq 'READY_LOG'){'PASS'}else{'UNKNOWN'}
    Add-Log 'DESKTOP' $level ("{0} | service={1} | process={2} | autorizacao={3}" -f $label,$fields[2],$fields[3],$fields[4])
  }
}
function Open-DesktopAccount([string]$Profile) {
  $chosen=if($Profile -eq 'CONTA 1'){'principal'}else{'conta2'}
  if($script:AccountProbeJob -and $script:AccountProbeJob.State -eq 'Running') {
    Add-Log 'DESKTOP' 'INFO' 'Outra consulta de perfil em andamento; aguarde a leitura antes de trocar conta'
    return
  }
  # A escolha humana fica vinculada SOMENTE a este job ate receber o receipt.
  $script:PendingAuthProfile=$chosen
  Add-Log 'DESKTOP' 'INFO' ("{0}: recuperando codigo temporario do perfil selecionado; credenciais nao sao registradas" -f $Profile)
  Start-AccountProbe -StartProfile $chosen
  foreach($page in $tab.TabPages) {if($page.Text -eq 'DESKTOP'){$tab.SelectedTab=$page;break}}
}
$script:BtnProfile1.Add_Click({ Open-DesktopAccount 'CONTA 1' })
$script:BtnProfile2.Add_Click({ Open-DesktopAccount 'CONTA 2' })
$script:BtnScreenpipe.Add_Click({
  Add-Log 'SCREENPIPE' 'INFO' 'Abrindo Screenpipe local, sem iniciar captura duplicada'
  try { Start-Process 'http://127.0.0.1:3030' -ErrorAction Stop | Out-Null }
  catch { Add-Log 'SCREENPIPE' 'WARN' 'Navegador indisponivel' }
})
$script:BtnDesktop.Add_Click({
  Add-Log 'DESKTOP' 'INFO' 'Abrindo painel oficial; troque de conta no site antes de confirmar a segunda'
  try { Start-Process 'https://mcp.desktopcommander.app/' -ErrorAction Stop | Out-Null }
  catch { Add-Log 'DESKTOP' 'WARN' 'Navegador indisponivel' }
})
$script:BtnVerify.Add_Click({
  Add-Log 'DESKTOP' 'INFO' 'Conferindo dois perfis sem reiniciar servicos ativos'
  Start-AccountProbe -StartProfile 'none'
})
$timer=New-Object Windows.Forms.Timer
$timer.Interval=10000
$timer.Add_Tick({
  if($script:Loading){return}
  $script:Loading=$true
  try{Local-Refresh;Poll-Remote;Refresh-Scripts;Poll-AccountProbe}catch{Add-Log 'RUNTIME' 'WARN' ('Erro na leitura: '+$_.Exception.Message)}finally{$script:Loading=$false}
})
$form.Add_Shown({
  try{$split.SplitterDistance=[int][Math]::Max(340,$split.Height*0.52)}catch{}
  Add-Log 'RUNTIME' 'INFO' 'Terminal incorporado nos logs deste HUD; processo PowerShell oculto; nenhum painel/bridge paralelo.'
  try{Local-Refresh;Poll-Remote;Refresh-Scripts}catch{Add-Log 'RUNTIME' 'WARN' $_.Exception.Message}
  $timer.Start()
})
$form.Add_FormClosing({
  $timer.Stop()
  if($script:RemoteJob){Stop-Job $script:RemoteJob -ErrorAction SilentlyContinue;Remove-Job $script:RemoteJob -Force -ErrorAction SilentlyContinue}
  if($script:AccountProbeJob){Stop-Job $script:AccountProbeJob -ErrorAction SilentlyContinue;Remove-Job $script:AccountProbeJob -Force -ErrorAction SilentlyContinue}
  try{$mutex.ReleaseMutex()}catch{}
  $mutex.Dispose()
})
[void][Windows.Forms.Application]::Run($form)
# Remove only this ephemeral launcher payload after the HUD closes.
try { if($PSCommandPath -and (Test-Path -LiteralPath $PSCommandPath -PathType Leaf)) { Remove-Item -LiteralPath $PSCommandPath -Force -ErrorAction SilentlyContinue } } catch { }
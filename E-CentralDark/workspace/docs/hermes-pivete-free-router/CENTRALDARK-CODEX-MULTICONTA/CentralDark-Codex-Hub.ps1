Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName Microsoft.VisualBasic
[System.Windows.Forms.Application]::EnableVisualStyles()

$App='CentralDark Codex MultiConta'
$Data=Join-Path $env:LOCALAPPDATA 'CentralDark\CodexAccountHub'
$Homes=Join-Path $env:LOCALAPPDATA 'CentralDark\CodexAccounts'
$StateFile=Join-Path $Data 'hub-state.json'
$PromptFile=Join-Path $PSScriptRoot 'PROMPT-RETOMADA.txt'
New-Item -ItemType Directory -Force $Data,$Homes|Out-Null

function Default-State {
 [ordered]@{version=1;active='';workspace='E:\CentralDark\Pivete\CentralDark';worktree='E:\CentralDark\Pivete\worktrees\bolt-lovable-bridge-20260726';goal='E:\CentralDark\GOALFORMULAA120CONSOLIDADA.zip';accounts=@()}
}
function Save-State($s){[IO.File]::WriteAllText($StateFile,($s|ConvertTo-Json -Depth 6),[Text.UTF8Encoding]::new($false))}
function Load-State {if(!(Test-Path $StateFile)){$s=Default-State;Save-State $s;return $s};try{Get-Content $StateFile -Raw|ConvertFrom-Json}catch{$s=Default-State;Save-State $s;return $s}}
function Codex-Path { $c=Get-Command codex -ErrorAction SilentlyContinue;if($c){return $c.Source};$p=Join-Path $env:APPDATA 'npm\codex.cmd';if(Test-Path $p){return $p};return $null }
function Selected {if($list.SelectedIndex-lt 0){return $null};$a=[string]$list.SelectedItem;@($script:S.accounts|? alias-eq $a)[0]}
function Persist-Paths {$script:S.workspace=$ws.Text.Trim();$script:S.worktree=$wt.Text.Trim();$script:S.goal=$goal.Text.Trim();Save-State $script:S}
function Resume-Clipboard {
 $t=Get-Content $PromptFile -Raw
 $t=$t.Replace('{{WORKSPACE}}',$ws.Text.Trim()).Replace('{{WORKTREE}}',$wt.Text.Trim()).Replace('{{GOAL}}',$goal.Text.Trim())
 Set-Clipboard $t;$status.Text='Prompt de retomada copiado.'
}
function Launch($acc,[string]$mode='open',[bool]$copy=$false){
 $codex=Codex-Path;if(!$codex){[Windows.Forms.MessageBox]::Show('Codex CLI não localizado. Abra um PowerShell novo ou reinstale o Codex.',$App)|Out-Null;return}
 New-Item -ItemType Directory -Force $acc.home|Out-Null
 if($copy){Resume-Clipboard}
 $dir=$wt.Text.Trim();if(!(Test-Path $dir)){$dir=$ws.Text.Trim()};if(!(Test-Path $dir)){$dir=$env:USERPROFILE}
 $h=$acc.home.Replace("'","''");$d=$dir.Replace("'","''");$c=$codex.Replace("'","''")
 if($mode-eq'login'){$run="& '$c' --login"}elseif($mode-eq'status'){$run="& '$c' login status"}else{$run="& '$c'"}
 $cmd="`$env:CODEX_HOME='$h';Set-Location -LiteralPath '$d';Write-Host 'CONTA CODEX: $($acc.alias)' -ForegroundColor Cyan;Write-Host 'CODEX_HOME=$h' -ForegroundColor DarkGray;$run"
 Start-Process powershell.exe -ArgumentList '-NoExit','-NoProfile','-ExecutionPolicy','Bypass','-Command',$cmd
}
function Refresh {
 $old=if($list.SelectedIndex-ge 0){[string]$list.SelectedItem}else{''};$list.Items.Clear();@($script:S.accounts|sort alias)|%{[void]$list.Items.Add($_.alias)}
 if($old-and$list.Items.Contains($old)){$list.SelectedItem=$old}elseif($script:S.active-and$list.Items.Contains([string]$script:S.active)){$list.SelectedItem=[string]$script:S.active}elseif($list.Items.Count){$list.SelectedIndex=0};Details
}
function Details {$a=Selected;if(!$a){$sel.Text='Conta: nenhuma';$home.Text='CODEX_HOME: —';return};$m=if($script:S.active-eq$a.alias){' (ATIVA)'}else{''};$sel.Text="Conta: $($a.alias)$m";$home.Text="CODEX_HOME: $($a.home)"}

$f=New-Object Windows.Forms.Form;$f.Text=$App;$f.Size='920,620';$f.StartPosition='CenterScreen';$f.BackColor=[Drawing.Color]::FromArgb(20,23,28);$f.ForeColor='Gainsboro';$f.Font='Segoe UI,10'
$t=New-Object Windows.Forms.Label;$t.Text='CENTRALDARK — CODEX MULTICONTA';$t.Font='Segoe UI Semibold,18';$t.AutoSize=$true;$t.Location='22,18';$f.Controls.Add($t)
$sub=New-Object Windows.Forms.Label;$sub.Text='Perfis isolados. Login oficial. Sem capturar token.';$sub.AutoSize=$true;$sub.ForeColor='Silver';$sub.Location='25,57';$f.Controls.Add($sub)
$list=New-Object Windows.Forms.ListBox;$list.Location='25,100';$list.Size='260,310';$list.BackColor=[Drawing.Color]::FromArgb(32,36,43);$list.ForeColor='White';$f.Controls.Add($list)
$add=New-Object Windows.Forms.Button;$add.Text='Adicionar conta';$add.Location='25,425';$add.Size='125,36';$f.Controls.Add($add)
$rem=New-Object Windows.Forms.Button;$rem.Text='Remover do Hub';$rem.Location='160,425';$rem.Size='125,36';$f.Controls.Add($rem)
$sel=New-Object Windows.Forms.Label;$sel.Location='315,100';$sel.Size='560,28';$sel.Font='Segoe UI Semibold,12';$f.Controls.Add($sel)
$home=New-Object Windows.Forms.Label;$home.Location='315,133';$home.Size='560,42';$home.ForeColor='Silver';$f.Controls.Add($home)
function Box($label,$top,$value){$l=New-Object Windows.Forms.Label;$l.Text=$label;$l.Location="315,$top";$l.Size='110,25';$f.Controls.Add($l);$b=New-Object Windows.Forms.TextBox;$b.Text=$value;$b.Location="430,$($top-2)";$b.Size='445,28';$b.BackColor=[Drawing.Color]::FromArgb(32,36,43);$b.ForeColor='White';$f.Controls.Add($b);$b}
$script:S=Load-State;$ws=Box 'Workspace' 190 ([string]$script:S.workspace);$wt=Box 'Worktree' 230 ([string]$script:S.worktree);$goal=Box 'Goal/ZIP' 270 ([string]$script:S.goal)
$save=New-Object Windows.Forms.Button;$save.Text='Salvar caminhos';$save.Location='315,315';$save.Size='145,38';$f.Controls.Add($save)
$login=New-Object Windows.Forms.Button;$login.Text='Autenticar oficialmente';$login.Location='470,315';$login.Size='190,38';$f.Controls.Add($login)
$stat=New-Object Windows.Forms.Button;$stat.Text='Ver status';$stat.Location='670,315';$stat.Size='110,38';$f.Controls.Add($stat)
$open=New-Object Windows.Forms.Button;$open.Text='Abrir Codex';$open.Location='315,370';$open.Size='145,42';$f.Controls.Add($open)
$resume=New-Object Windows.Forms.Button;$resume.Text='Abrir + copiar retomada';$resume.Location='470,370';$resume.Size='190,42';$f.Controls.Add($resume)
$next=New-Object Windows.Forms.Button;$next.Text='Próxima conta + retomada';$next.Location='670,370';$next.Size='205,42';$f.Controls.Add($next)
$warn=New-Object Windows.Forms.Label;$warn.Text='O Hub não intercepta localhost:1455 e não grava id_token. O próprio Codex controla o OAuth.';$warn.Location='315,440';$warn.Size='560,48';$warn.ForeColor='Khaki';$f.Controls.Add($warn)
$status=New-Object Windows.Forms.Label;$status.Text='Pronto.';$status.Location='25,510';$status.Size='850,35';$status.ForeColor='LightGreen';$f.Controls.Add($status)

$list.Add_SelectedIndexChanged({Details})
$add.Add_Click({$x=[Microsoft.VisualBasic.Interaction]::InputBox('Apelido local: principal, reserva... Não digite senha ou token.',$App,'');$a=($x-replace'[^a-zA-Z0-9_-]','-').Trim('-').ToLower();if(!$a){return};if(@($script:S.accounts|? alias-eq$a).Count){[Windows.Forms.MessageBox]::Show('Apelido já existe.',$App)|Out-Null;return};$h=Join-Path $Homes $a;New-Item -ItemType Directory -Force $h|Out-Null;$script:S.accounts=@($script:S.accounts)+[pscustomobject]@{alias=$a;home=$h};if(!$script:S.active){$script:S.active=$a};Save-State $script:S;Refresh;$list.SelectedItem=$a;$status.Text="Conta '$a' criada. Agora autentique oficialmente."})
$rem.Add_Click({$a=Selected;if(!$a){return};if([Windows.Forms.MessageBox]::Show("Remover '$($a.alias)' apenas da lista? O perfil local não será apagado.",$App,'YesNo')-ne'Yes'){return};$script:S.accounts=@($script:S.accounts|? alias-ne$a.alias);if($script:S.active-eq$a.alias){$script:S.active=''};Save-State $script:S;Refresh})
$save.Add_Click({Persist-Paths;$status.Text='Caminhos salvos.'})
$login.Add_Click({Persist-Paths;$a=Selected;if($a){Launch $a 'login'}})
$stat.Add_Click({$a=Selected;if($a){Launch $a 'status'}})
$open.Add_Click({Persist-Paths;$a=Selected;if($a){$script:S.active=$a.alias;Save-State $script:S;Launch $a;Refresh}})
$resume.Add_Click({Persist-Paths;$a=Selected;if($a){$script:S.active=$a.alias;Save-State $script:S;Launch $a 'open' $true;Refresh}})
$next.Add_Click({Persist-Paths;if(!$list.Items.Count){return};$i=if($list.SelectedIndex-lt 0){0}else{($list.SelectedIndex+1)%$list.Items.Count};$list.SelectedIndex=$i;$a=Selected;$script:S.active=$a.alias;Save-State $script:S;Launch $a 'open' $true;Refresh})
Refresh;[void]$f.ShowDialog()

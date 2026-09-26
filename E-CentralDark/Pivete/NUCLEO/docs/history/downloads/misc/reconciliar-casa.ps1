<#
================================================================================
 RECONCILIAR-CASA.ps1  —  CentralDark
--------------------------------------------------------------------------------
 AUTORIDADE : SEGREDO/CHEFE
 PRINCIPIO  : letra de disco MENTE. Achar a Casa por CONTEUDO e SERIAL.
 MODO       : READ_ONLY por padrao. Use -Aplicar para escrever.
--------------------------------------------------------------------------------
 POR QUE ESTE SCRIPT EXISTE
   Todo Windows chama a si mesmo de C:. Ao bootar pelo outro sistema, as letras
   trocam. Ancorar caminho em "C:\" quebra. Este script ancora em serial de
   disco + presenca de arquivo canonico.
--------------------------------------------------------------------------------
 USO
   powershell -NoProfile -ExecutionPolicy Bypass -File reconciliar-casa.ps1
   powershell -NoProfile -ExecutionPolicy Bypass -File reconciliar-casa.ps1 -Aplicar
================================================================================
#>

param(
    [switch]$Aplicar,
    [string]$SaidaJson = "$PSScriptRoot\reconciliacao-casa.json"
)

$ErrorActionPreference = 'Continue'
$ts  = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$log = @()

function Diga($txt, $cor = 'Gray') {
    Write-Host $txt -ForegroundColor $cor
    $script:log += $txt
}

Diga "================================================================" 'Cyan'
Diga " RECONCILIACAO DA CASA CENTRALDARK" 'Cyan'
Diga " $ts   |   modo: $(if($Aplicar){'APLICAR'}else{'READ_ONLY'})" 'Cyan'
Diga "================================================================" 'Cyan'
Diga ""

# =============================================================================
# 1. QUEM SOU EU AGORA — qual Windows bootou, em qual disco fisico
# =============================================================================
Diga "--- 1. SISTEMA ATUAL ---" 'Yellow'

$sysDrive = $env:SystemDrive
Diga "Letra do sistema atual : $sysDrive"

$sysPart = Get-Partition -DriveLetter $sysDrive.TrimEnd(':') -ErrorAction SilentlyContinue
$sysDisk = $null
if ($sysPart) {
    $sysDisk = Get-Disk -Number $sysPart.DiskNumber -ErrorAction SilentlyContinue
    Diga "DiskNumber             : $($sysPart.DiskNumber)"
    if ($sysDisk) {
        Diga "Modelo do disco        : $($sysDisk.Model)"
        Diga "Serial (ANCORA REAL)   : $($sysDisk.SerialNumber)"
        Diga "Tipo de midia          : $($sysDisk.MediaType)"
    }
}

$kernel = Get-Item "$sysDrive\Windows\System32\ntoskrnl.exe" -ErrorAction SilentlyContinue
if ($kernel) { Diga "Kernel deste Windows   : $($kernel.LastWriteTime)" }
Diga ""

# =============================================================================
# 2. MAPA FISICO — todo disco, todo serial, toda letra
# =============================================================================
Diga "--- 2. MAPA FISICO DOS DISCOS ---" 'Yellow'

$mapaDiscos = @()
foreach ($d in (Get-Disk | Sort-Object Number)) {
    $letras = (Get-Partition -DiskNumber $d.Number -ErrorAction SilentlyContinue |
               Where-Object DriveLetter | ForEach-Object { "$($_.DriveLetter):" }) -join ' '
    $item = [PSCustomObject]@{
        DiskNumber = $d.Number
        Modelo     = $d.Model
        Serial     = $d.SerialNumber
        MediaType  = $d.MediaType
        Tam_GB     = [math]::Round($d.Size / 1GB)
        Letras     = $letras
        EhSistema  = ($sysPart -and $d.Number -eq $sysPart.DiskNumber)
    }
    $mapaDiscos += $item
    $marca = if ($item.EhSistema) { ' <== SISTEMA ATUAL' } else { '' }
    Diga ("  Disco {0} | {1,-28} | {2,-8} | {3,5} GB | {4}{5}" -f `
        $item.DiskNumber, $item.Modelo, $item.MediaType, $item.Tam_GB, $item.Letras, $marca)
}
Diga ""

# =============================================================================
# 3. CACAR A CASA POR CONTEUDO — nunca por letra
# =============================================================================
Diga "--- 3. CACANDO A CASA POR CONTEUDO ---" 'Yellow'

# marcador = arquivo/pasta que PROVA que aquilo e o alvo
$alvos = @(
    @{ Nome='CentralDark_Repo'; Sufixo='CentralDark\.git';                    Rotulo='repositorio da Casa' }
    @{ Nome='CentralDark_Raiz'; Sufixo='CentralDark';                         Rotulo='raiz da Casa' }
    @{ Nome='Hermes_Config';    Sufixo='Users\danda\.hermes\config.yaml';     Rotulo='config do Hermes' }
    @{ Nome='Hermes_Home';      Sufixo='Users\danda\.hermes';                 Rotulo='home do Hermes' }
    @{ Nome='SSH_Chave_Priv';   Sufixo='Users\danda\.ssh\centraldark_vps';    Rotulo='chave SSH privada' }
    @{ Nome='SSH_Pasta';        Sufixo='Users\danda\.ssh';                    Rotulo='pasta SSH' }
    @{ Nome='CPUID_Sensores';   Sufixo='Program Files\CPUID';                 Rotulo='CPU-Z + HWMonitor' }
    @{ Nome='Obsidian_Vault';   Sufixo='CentralDark\docs\BRAIN';              Rotulo='segundo cerebro' }
)

$letrasVivas = (Get-Volume | Where-Object { $_.DriveLetter -and $_.DriveType -eq 'Fixed' } |
                ForEach-Object { "$($_.DriveLetter):" })

$achados = @{}
foreach ($a in $alvos) {
    $hits = @()
    foreach ($L in $letrasVivas) {
        $caminho = Join-Path $L $a.Sufixo
        if (Test-Path $caminho) {
            $disco = $mapaDiscos | Where-Object { $_.Letras -match [regex]::Escape($L) }
            $hits += [PSCustomObject]@{
                Caminho    = $caminho
                Letra      = $L
                DiskNumber = $disco.DiskNumber
                Serial     = $disco.Serial
                EhSistema  = $disco.EhSistema
            }
        }
    }
    $achados[$a.Nome] = $hits
    if ($hits.Count -eq 0) {
        Diga ("  [ AUSENTE  ] {0,-18} ({1})" -f $a.Nome, $a.Rotulo) 'Red'
    } elseif ($hits.Count -eq 1) {
        Diga ("  [ OK       ] {0,-18} -> {1}  (disco {2})" -f $a.Nome, $hits[0].Caminho, $hits[0].DiskNumber) 'Green'
    } else {
        Diga ("  [ DUPLICADO] {0,-18} achado em {1} lugares:" -f $a.Nome, $hits.Count) 'Yellow'
        foreach ($h in $hits) {
            $tag = if ($h.EhSistema) { 'sistema atual' } else { 'outro disco' }
            Diga ("               -> {0}  (disco {1}, {2})" -f $h.Caminho, $h.DiskNumber, $tag) 'Yellow'
        }
    }
}
Diga ""

# =============================================================================
# 4. OUTROS WINDOWS INSTALADOS
# =============================================================================
Diga "--- 4. OUTROS WINDOWS NA MAQUINA ---" 'Yellow'

$windows = @()
foreach ($L in $letrasVivas) {
    $k = "$L\Windows\System32\ntoskrnl.exe"
    if (Test-Path $k) {
        $disco = $mapaDiscos | Where-Object { $_.Letras -match [regex]::Escape($L) }
        $w = [PSCustomObject]@{
            Letra      = $L
            DiskNumber = $disco.DiskNumber
            Modelo     = $disco.Modelo
            MediaType  = $disco.MediaType
            Serial     = $disco.Serial
            Kernel     = (Get-Item $k).LastWriteTime
            EhAtual    = ($L -eq $sysDrive)
        }
        $windows += $w
        $tag = if ($w.EhAtual) { ' <== VOCE ESTA AQUI' } else { '' }
        Diga ("  {0} | disco {1} | {2,-8} | {3,-26} | kernel {4}{5}" -f `
            $w.Letra, $w.DiskNumber, $w.MediaType, $w.Modelo, $w.Kernel, $tag)
    }
}
Diga ""

# =============================================================================
# 5. PRESSAO E PAGEFILE — o gargalo medido
# =============================================================================
Diga "--- 5. PRESSAO DE MEMORIA E PAGEFILE ---" 'Yellow'

$os   = Get-CimInstance Win32_OperatingSystem
$fis  = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
$com  = [math]::Round(($os.TotalVirtualMemorySize - $os.FreeVirtualMemory) / 1MB, 2)
$prs  = [math]::Round($com / $fis * 100, 1)
$vere = if ($prs -gt 85) { 'PAGINANDO' } else { 'OK' }

Diga "  RAM fisica    : $fis GB"
Diga "  Commit        : $com GB"
Diga "  Pressao       : $prs %   -> $vere" $(if($prs -gt 85){'Red'}else{'Green'})

foreach ($pf in (Get-CimInstance Win32_PageFileUsage -ErrorAction SilentlyContinue)) {
    $letraPf = $pf.Name.Substring(0,2)
    $discoPf = $mapaDiscos | Where-Object { $_.Letras -match [regex]::Escape($letraPf) }
    $aviso = if ($discoPf.MediaType -eq 'HDD') { '  <== EM HDD, ISSO DOI' } else { '' }
    Diga "  Pagefile      : $($pf.Name)  ($($pf.AllocatedBaseSize) MB, pico $($pf.PeakUsage) MB) [$($discoPf.MediaType)]$aviso" `
        $(if($discoPf.MediaType -eq 'HDD'){'Red'}else{'Green'})
}
Diga ""

# =============================================================================
# 6. VEREDITO
# =============================================================================
Diga "--- 6. VEREDITO ---" 'Yellow'

$pend = @()
if ($prs -gt 85) { $pend += "Pressao de memoria em $prs% — sistema paginando" }

$sysMedia = ($mapaDiscos | Where-Object EhSistema).MediaType
if ($sysMedia -eq 'HDD') {
    $pend += "Windows atual roda em HDD. Existe Windows em SSD/NVMe? ver secao 4."
}

$dup = $achados.Keys | Where-Object { $achados[$_].Count -gt 1 }
if ($dup) { $pend += "Duplicado(s) detectado(s): $($dup -join ', ') — decidir qual e canonico" }

$aus = $achados.Keys | Where-Object { $achados[$_].Count -eq 0 }
if ($aus) { $pend += "Ausente(s) neste sistema: $($aus -join ', ')" }

if ($pend.Count -eq 0) {
    Diga "  Nada a reconciliar. Casa coerente." 'Green'
} else {
    foreach ($p in $pend) { Diga "  [!] $p" 'Yellow' }
}
Diga ""

# =============================================================================
# 7. GRAVAR O MAPA
# =============================================================================
$json = [PSCustomObject]@{
    gerado_em       = $ts
    sistema_atual   = @{
        letra      = $sysDrive
        disco      = $(if($sysPart){$sysPart.DiskNumber}else{$null})
        modelo     = $(if($sysDisk){$sysDisk.Model}else{$null})
        serial     = $(if($sysDisk){$sysDisk.SerialNumber}else{$null})
        media_type = $sysMedia
        kernel     = $(if($kernel){$kernel.LastWriteTime.ToString('s')}else{$null})
    }
    discos          = $mapaDiscos
    casa            = $achados
    windows_achados = $windows
    memoria         = @{ ram_gb = $fis; commit_gb = $com; pressao_pct = $prs; veredito = $vere }
    pendencias      = $pend
}

$json | ConvertTo-Json -Depth 6 | Set-Content -Path $SaidaJson -Encoding UTF8
Diga "Mapa gravado em: $SaidaJson" 'Cyan'

$logPath = Join-Path (Split-Path $SaidaJson) 'reconciliacao-casa.log'
$log | Set-Content -Path $logPath -Encoding UTF8
Diga "Log gravado em : $logPath" 'Cyan'
Diga ""

# =============================================================================
# 8. APLICAR — so com -Aplicar, e so o que e reversivel
# =============================================================================
if (-not $Aplicar) {
    Diga "MODO READ_ONLY. Nada foi alterado." 'Cyan'
    Diga "Para aplicar as correcoes reversiveis, rode de novo com -Aplicar" 'Cyan'
    return
}

Diga "--- 8. APLICANDO (reversivel) ---" 'Magenta'

# 8a. variavel de ambiente apontando pra Casa achada
$raiz = $achados['CentralDark_Raiz'] | Where-Object EhSistema | Select-Object -First 1
if (-not $raiz) { $raiz = $achados['CentralDark_Raiz'] | Select-Object -First 1 }

if ($raiz) {
    [Environment]::SetEnvironmentVariable('CENTRALDARK_ROOT', $raiz.Caminho, 'User')
    Diga "  CENTRALDARK_ROOT = $($raiz.Caminho)" 'Green'
    Diga "  desfazer: [Environment]::SetEnvironmentVariable('CENTRALDARK_ROOT',`$null,'User')" 'DarkGray'
} else {
    Diga "  CentralDark nao encontrada. Nada aplicado." 'Red'
}

# 8b. chave SSH
$ssh = $achados['SSH_Chave_Priv'] | Where-Object EhSistema | Select-Object -First 1
if (-not $ssh) { $ssh = $achados['SSH_Chave_Priv'] | Select-Object -First 1 }
if ($ssh) {
    [Environment]::SetEnvironmentVariable('CENTRALDARK_SSH_KEY', $ssh.Caminho, 'User')
    Diga "  CENTRALDARK_SSH_KEY = $($ssh.Caminho)" 'Green'
}

Diga ""
Diga "Aplicado. Nenhum arquivo foi movido, copiado ou apagado." 'Magenta'
Diga "Somente variaveis de ambiente do usuario foram definidas." 'Magenta'

# OUTRO - reconciliar-casa.ps1
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\reconciliar-casa.ps1
**SHA:** f7661a0edd8ba532
**Timestamp:** 2026-08-26T18:24:31.309519
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- PRINCIPIO  : letra de disco MENTE. Achar a Casa por CONTEUDO e SERIAL.

### Principios
- PRINCIPIO  : letra de disco MENTE. Achar a Casa por CONTEUDO e SERIAL.

### Ouro Bruto (primeiros 5000 chars)
```
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
                ForEach-Object { "$($_.DriveLet
```
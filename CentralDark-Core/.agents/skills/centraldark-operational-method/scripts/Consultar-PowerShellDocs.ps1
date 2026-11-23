#requires -Version 5.1
<#
.SYNOPSIS
  Consultor oficial sob demanda para erros de PowerShell observados por um agente.
.DESCRIPTION
  Roteia erros para a fonte primária Microsoft Learn. Não instala pacotes,
  não modifica serviços e não age sem uma chamada explícita do executor.
  Quando corresponde a PowerShell, por padrão consulta a documentação via HTTPS.
  -SomenteRota seleciona o tópico sem rede (contraprovas determinísticas).
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [AllowEmptyString()]
    [string] $Mensagem,
    [switch] $SomenteRota,
    [ValidateRange(3,30)]
    [int] $TempoLimiteSegundos = 10
)
Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

# As regras são avaliadas na ordem abaixo: o sinal específico tem prioridade.
$rotas = @(
    @{ Id='PS_EXECUTION_POLICY'; Pattern='(?i)Get-ExecutionPolicy|Set-ExecutionPolicy|about_Execution_Policies|execution of scripts is disabled|execucao de scripts foi desabilitada|execução de scripts foi desabilitada'; URL='https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies'; Categoria='Política de execução' },
    @{ Id='PS_MODULE_AUTOLOAD'; Pattern='(?i)CouldNotAutoloadMatchingModule|Unable to load module|Import-Module.*failed|m[oó]dulo.*carrega'; URL='https://learn.microsoft.com/en-us/powershell/module/'; Categoria='Descoberta e autoload de módulo' },
    @{ Id='PS_CMDLET_GET_FILEHASH'; Pattern='(?i)Get-FileHash'; URL='https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/get-filehash'; Categoria='Cmdlet Microsoft.PowerShell.Utility' },
    @{ Id='PS_LINT'; Pattern='(?i)PSScriptAnalyzer|Invoke-ScriptAnalyzer|ScriptAnalyzer'; URL='https://learn.microsoft.com/en-us/powershell/utility-modules/psscriptanalyzer/overview'; Categoria='PSScriptAnalyzer' },
    @{ Id='PS_SECRET_MODULE'; Pattern='(?i)SecretManagement|SecretStore'; URL='https://learn.microsoft.com/en-us/powershell/utility-modules/overview'; Categoria='Módulos de utilidade (ver estado atual)' },
    @{ Id='PS_UTILITY_MODULE'; Pattern='(?i)Crescendo|PlatyPS'; URL='https://learn.microsoft.com/en-us/powershell/utility-modules/overview'; Categoria='Módulos de utilidade' },
    @{ Id='PS_DSC'; Pattern='(?i)\bDSC\b|Start-DscConfiguration|Test-DscConfiguration|Desired.State.Configuration'; URL='https://learn.microsoft.com/en-us/powershell/dsc/overview'; Categoria='Desired State Configuration' },
    @{ Id='PS_GALLERY'; Pattern='(?i)Install-Module|Find-Module|PowerShellGallery|PSGallery|Install-PSResource|Find-PSResource|Get-PSResource'; URL='https://learn.microsoft.com/en-us/powershell/gallery/overview'; Categoria='PowerShell Gallery / Package Management' },
    @{ Id='PS_VSCODE'; Pattern='(?i)PowerShell Integrated Console|PowerShell extension|launch\.json|VS.Code.*PowerShell|PSES|PowerShellEditorServices'; URL='https://learn.microsoft.com/en-us/powershell/scripting/dev-cross-plat/vscode/using-vscode-for-remote-editing-and-debugging'; Categoria='VS Code / debug remoto' },
    @{ Id='PS_SDK'; Pattern='(?i)System\.Management\.Automation|PowerShell\.SDK|runspace|PSHost'; URL='https://learn.microsoft.com/en-us/powershell/scripting/developer/windows-powershell'; Categoria='PowerShell SDK' },
    @{ Id='PS_AZURE'; Pattern='(?i)Connect-AzAccount|Az\.Accounts|Azure.PowerShell|Automation.runbook|Azure.Cloud.Shell'; URL='https://learn.microsoft.com/en-us/powershell/azure/'; Categoria='Azure PowerShell / runbooks' },
    @{ Id='PS_WINDOWS_MANAGEMENT'; Pattern='(?i)Get-WmiObject|Get-CimInstance|Get-Service|WinRM|Enter-PSSession|Invoke-Command'; URL='https://learn.microsoft.com/en-us/powershell/module/'; Categoria='Windows Management / remoting' },
    @{ Id='PS_INSTALL_VERSION'; Pattern='(?i)\bpwsh\b|PSVersionTable|PowerShell.*instal|PowerShell.*edition|PowerShell.*vers[aã]o|PowerShell.*upgrade'; URL='https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell'; Categoria='Edições, versões e instalação' },
    @{ Id='PS_CMDLET_MODULE'; Pattern='(?i)CommandNotFoundException|FullyQualifiedErrorId|Import-Module|Get-Command|Get-Help|Get-Module|cmdlet|ModuleNotFound|The.term.*not.recognized|termo.*n[aã]o.*reconhecido'; URL='https://learn.microsoft.com/en-us/powershell/module/'; Categoria='Module Browser / referência de cmdlet' },
    @{ Id='PS_SCRIPT_SYNTAX'; Pattern='(?i)ParserError|Unexpected.token|MissingEndCurlyBrace|\.ps1\b|ExecutionPolicy|PSScriptRoot|InvalidArgument|ParameterBindingException'; URL='https://learn.microsoft.com/en-us/powershell/scripting/overview'; Categoria='Scripting / How-To' },
    @{ Id='PS_GENERAL'; Pattern='(?i)PowerShell'; URL='https://learn.microsoft.com/en-us/powershell/'; Categoria='PowerShell documentação geral' }
)
$rota = $null
foreach($r in $rotas) {
    if($Mensagem -match $r.Pattern) { $rota=$r; break }
}
if($null -eq $rota) {
    [pscustomobject]@{
        PS_TRIGGER='NO_MATCH'
        CATEGORIA=$null
        OFFICIAL_DOC_URL=$null
        DOC_FETCH_STATUS='NOT_REQUESTED'
        PS_VERSION=$PSVersionTable.PSVersion.ToString()
        VEREDITO='NO_ACTION'
    } | ConvertTo-Json -Depth 3 -Compress
    exit 0
}

$status = if($SomenteRota) { 'ROUTE_ONLY' } else { 'UNAVAILABLE' }
$http = $null
if(-not $SomenteRota) {
    try {
        # Fonte predefinida e whitelist: nenhuma URL arbitrária é construída do texto do erro.
        $response=Invoke-WebRequest -Uri $rota.URL -Method Get -UseBasicParsing -TimeoutSec $TempoLimiteSegundos -ErrorAction Stop
        $http=[int]$response.StatusCode
        if($http -ge 200 -and $http -lt 300) { $status='FETCHED_OFFICIAL' } else { $status='HTTP_OTHER' }
    }
    catch {
        $status='UNAVAILABLE'
        if($null -ne $_.Exception.Response) {
            try { $http=[int]$_.Exception.Response.StatusCode } catch {}
        }
    }
}
[pscustomobject]@{
    PS_TRIGGER=$rota.Id
    CATEGORIA=$rota.Categoria
    OFFICIAL_DOC_URL=$rota.URL
    DOC_FETCH_STATUS=$status
    HTTP_STATUS=$http
    PS_VERSION=$PSVersionTable.PSVersion.ToString()
    VEREDITO='DIAGNOSTIC_ROUTE_ONLY'
    NEXT_STEP='Confrontar a edição, Get-Command/Get-Module e o erro local antes de propor qualquer correção.'
} | ConvertTo-Json -Depth 4 -Compress

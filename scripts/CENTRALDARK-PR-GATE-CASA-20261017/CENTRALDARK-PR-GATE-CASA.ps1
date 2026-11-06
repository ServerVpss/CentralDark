#requires -Version 5.1
<#
  CentralDark / Casa / Gate deterministico de PRs (somente leitura)
  OWNERS: GitHub main, scripts/remote-bridge/canonical/CENTRALDARK-VPS-UPDATE.ps1
  ACTION: Audita todos os PRs OPEN da main, checks no SHA, reviews e colisao de arquivos.
  Nunca faz merge, reset, clean, push, deploy ou modifica credenciais.
#>
[CmdletBinding()]
param(
    [string]$Repositorio = 'ServerVpss/CentralDark',
    [ValidateSet('Auditar','Preparar')][string]$Modo = 'Auditar',
    [string]$Destino = ''
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if ([string]::IsNullOrWhiteSpace($Destino)) {
    $Destino = Join-Path $PSScriptRoot ('RESULTADO-PR-GATE-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
}
New-Item -ItemType Directory -Force -Path $Destino | Out-Null
$Falhas = New-Object 'System.Collections.Generic.List[string]'
function ApiJson([string]$Rota) {
    $linhas = @(& gh api -X GET $Rota 2>&1)
    if ($LASTEXITCODE -ne 0) { throw ('GitHub API recusou ' + ($Rota -split '\?')[0] + ' (exit=' + $LASTEXITCODE + ')') }
    $texto = ($linhas -join "`n").Trim()
    if (-not $texto) { throw ('Resposta vazia de GitHub API ' + ($Rota -split '\?')[0]) }
    return ConvertFrom-Json -InputObject $texto
}
function Paginar([string]$Base, [string]$Campo) {
    $acumulado = New-Object System.Collections.ArrayList
    for ($pagina=1; $pagina -le 15; $pagina++) {
        $sep = if ($Base.Contains('?')) { '&' } else { '?' }
        $resposta = ApiJson ($Base + $sep + 'per_page=100&page=' + $pagina)
        $itens = if ($Campo) { @($resposta.$Campo) } else { @($resposta) }
        foreach ($item in $itens) { if ($null -ne $item) { [void]$acumulado.Add($item) } }
        if ($itens.Count -lt 100) { return $acumulado.ToArray() }
    }
    throw ('Paginas excedidas, inventario incompleto: ' + ($Base -split '\?')[0])
}
function Block([System.Collections.Generic.List[string]]$Causes, [string]$Reason) {
    if (-not $Causes.Contains($Reason)) { $Causes.Add($Reason) }
}
function Cell([object]$Value) { return (([string]$Value) -replace '\|','/' -replace '[\r\n]+',' ') }

try {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw 'GitHub CLI gh.exe nao encontrado no PATH.' }
    & gh auth status 1>$null 2>$null
    if ($LASTEXITCODE -ne 0) { throw 'GitHub CLI precisa estar autenticado: gh auth login.' }
    $main = ApiJson ('repos/' + $Repositorio + '/commits/main')
    $mainSha = [string]$main.sha
    $abertos = @(Paginar ('repos/' + $Repositorio + '/pulls?state=open&base=main') '')
    if ($abertos.Count -eq 0) { throw 'Nao ha PRs abertos apontando para main; este gate nao autoriza deploy sozinho.' }

    $linhas = New-Object System.Collections.ArrayList
    $porCaminho = @{}
    foreach ($p in $abertos) {
        $num = [int]$p.number
        $atual = ApiJson ('repos/' + $Repositorio + '/pulls/' + $num)
        $sha = [string]$atual.head.sha
        $causas = New-Object 'System.Collections.Generic.List[string]'
        if ($atual.draft) { Block $causas 'DRAFT' }
        if ($atual.base.ref -ne 'main') { Block $causas 'BASE_NAO_MAIN' }
        if ($null -ne $atual.mergeable -and -not $atual.mergeable) { Block $causas 'CONFLITO_MERGE' }
        if ($null -eq $atual.mergeable -or $atual.mergeable_state -ne 'clean') {
            Block $causas ('MERGE_STATE_' + [string]$atual.mergeable_state)
        }
        $workflows = @(Paginar ('repos/' + $Repositorio + '/actions/runs?head_sha=' + $sha + '&event=pull_request') 'workflow_runs' |
            Where-Object { $_.head_sha -eq $sha -and $_.event -eq 'pull_request' })
        if ($workflows.Count -eq 0) { Block $causas 'SEM_CI_NO_HEAD' }
        $pending = @($workflows | Where-Object { $_.status -ne 'completed' })
        $nonGreen = @($workflows | Where-Object { $_.status -eq 'completed' -and $_.conclusion -ne 'success' })
        if ($pending.Count) { Block $causas ('CI_PENDENTE_' + $pending.Count) }
        if ($nonGreen.Count) {
            foreach ($tipo in @($nonGreen | ForEach-Object { $_.conclusion } | Sort-Object -Unique)) {
                Block $causas ('CI_' + [string]$tipo)
            }
        }
        $checks = @(Paginar ('repos/' + $Repositorio + '/commits/' + $sha + '/check-runs') 'check_runs')
        if ($checks.Count -eq 0) { Block $causas 'SEM_CHECK_RUN_NO_HEAD' }
        foreach ($check in $checks) {
            if ($check.head_sha -ne $sha) { Block $causas 'CHECK_SHA_DIVERGENTE'; continue }
            if ($check.status -ne 'completed') { Block $causas 'CHECK_PENDENTE' }
            elseif ($check.conclusion -ne 'success') { Block $causas ('CHECK_' + [string]$check.conclusion) }
        }
        $combined = ApiJson ('repos/' + $Repositorio + '/commits/' + $sha + '/status')
        if (@($combined.statuses).Count -gt 0 -and $combined.state -ne 'success') {
            Block $causas ('STATUS_' + [string]$combined.state)
        }
        $reviews = @(Paginar ('repos/' + $Repositorio + '/pulls/' + $num + '/reviews') '')
        $approved = @($reviews | Where-Object { $_.state -eq 'APPROVED' -and $_.commit_id -eq $sha })
        if ($approved.Count -eq 0) { Block $causas 'SEM_APPROVAL_NO_HEAD' }
        $rejected = @($reviews | Where-Object { $_.state -eq 'CHANGES_REQUESTED' })
        if ($rejected.Count) { Block $causas 'CHANGES_REQUESTED' }
        $arquivos = @(Paginar ('repos/' + $Repositorio + '/pulls/' + $num + '/files') '')
        foreach ($arq in $arquivos) {
            $caminho = ([string]$arq.filename).ToLowerInvariant()
            if (-not $porCaminho.ContainsKey($caminho)) { $porCaminho[$caminho] = New-Object System.Collections.ArrayList }
            [void]$porCaminho[$caminho].Add($num)
        }
        $linha = [pscustomobject]@{
            numero = $num; titulo = [string]$atual.title; sha = $sha
            draft = [bool]$atual.draft; mergeable_state = [string]$atual.mergeable_state
            workflows = $workflows.Count; ci_pending = $pending.Count
            ci_nongreen = $nonGreen.Count; checks = $checks.Count
            approvals_no_head = $approved.Count
            arquivos = @($arquivos | ForEach-Object { $_.filename })
            causas = $causas.ToArray(); estado = 'BLOQUEADO'
        }
        [void]$linhas.Add($linha)
        Write-Host ('[INFO] PR #{0} SHA={1} CI={2} pendentes={3} nao-verdes={4}' -f $num,$sha.Substring(0,9),$workflows.Count,$pending.Count,$nonGreen.Count)
    }
    $choques = New-Object System.Collections.ArrayList
    foreach ($caminho in ($porCaminho.Keys | Sort-Object)) {
        $nums = @($porCaminho[$caminho] | Sort-Object -Unique)
        if ($nums.Count -gt 1) {
            [void]$choques.Add([pscustomobject]@{ arquivo = $caminho; prs = $nums })
            foreach ($item in $linhas) {
                if ($nums -contains $item.numero) {
                    $item.causas = @($item.causas) + 'COLISAO_DE_ARQUIVO'
                }
            }
        }
    }
    $blockedCount = 0
    foreach ($item in $linhas) {
        $item.causas = @($item.causas | Sort-Object -Unique)
        if ($item.causas.Count -eq 0) { $item.estado = 'ELEGIVEL_PARA_REVISAO'; continue }
        $blockedCount++
    }
    $allGreen = $blockedCount -eq 0 -and $choques.Count -eq 0
    $resultado = [ordered]@{
        coletado_em_utc = (Get-Date).ToUniversalTime().ToString('o')
        repositorio = $Repositorio; main_sha = $mainSha
        total_prs_open = $linhas.Count; elegiveis = $linhas.Count - $blockedCount
        bloqueados = $blockedCount; colisao_arquivos = @($choques)
        ci_todos_verdes = $allGreen; deploy_autorizado = $false
        prs = @($linhas)
    }
    $jsonPath = Join-Path $Destino 'resultado.json'
    $mdPath = Join-Path $Destino 'RELATORIO.md'
    $resultado | ConvertTo-Json -Depth 18 | Out-File -Encoding utf8 -FilePath $jsonPath
    $md = New-Object System.Collections.Generic.List[string]
    $md.Add('# CentralDark — Gate PRs na Casa')
    $md.Add('')
    $md.Add('**UTC:** ' + $resultado.coletado_em_utc)
    $md.Add('**Main HEAD:** `' + $mainSha + '`')
    $md.Add('**PRs:** ' + $linhas.Count + ' | **Elegiveis:** ' + ($linhas.Count-$blockedCount) + ' | **Bloqueados:** ' + $blockedCount)
    $md.Add('**Microdeploy autorizado por este script:** NAO (somente auditoria / plano)')
    $md.Add('')
    $md.Add('| PR | SHA | CI pendente | CI nao verde | Aprovacoes HEAD | Estado / causa |')
    $md.Add('|---|---|---:|---:|---:|---|')
    foreach ($p in $linhas) {
        $md.Add(('| #{0} | `{1}` | {2} | {3} | {4} | {5} |' -f $p.numero,$p.sha.Substring(0,12),$p.ci_pending,$p.ci_nongreen,$p.approvals_no_head,(Cell ($p.causas -join ', '))))
    }
    $md.Add('')
    $md.Add('## Arquivos simultaneamente alterados por PRs diferentes')
    if ($choques.Count -eq 0) { $md.Add('Nenhuma colisao de arquivo no conjunto aberto.') }
    foreach ($v in $choques) { $md.Add('- `' + $v.arquivo + '` — PRs ' + ($v.prs -join ', ')) }
    $md.Add('')
    $md.Add('## Next')
    $md.Add('1. Resolver ACTION_REQUIRED, queued/pending e demais checks no HEAD de cada PR.')
    $md.Add('2. Revisar colisao do mesmo owner; rebasear/reconciliar sem sobrescrever edits em K:\.')
    $md.Add('3. Aprovar e integrar PRs por owner sob fluxo do GitHub; cada merge muda o HEAD da main.')
    $md.Add('4. Revalidar a main e usar o updater canônico existente em modo -ProbeOnly antes de qualquer microdeploy autorizado.')
    $md.Add('Este script NAO faz deploy, merge, reset, clean, force push, writes ou muda secrets.')
    $md | Out-File -Encoding utf8 -FilePath $mdPath
    Write-Host ('[RELATORIO] ' + $mdPath)
    if (-not $allGreen) {
        Write-Host ('[BLOQUEADO] ' + $blockedCount + '/' + $linhas.Count + ' PRs sem requisitos suficientes; ' + $choques.Count + ' caminhos em colisao.') -ForegroundColor Yellow
        exit 2
    }
    Write-Host '[PRONTO_PARA_REVISAO] Todos os PRs abertos elegiveis; ainda falta merge e gate separado de deploy.' -ForegroundColor Green
    if ($Modo -eq 'Preparar') {
        $probe = Join-Path $PSScriptRoot '..\..\remote-bridge\canonical\CENTRALDARK-VPS-UPDATE.ps1'
        if (Test-Path -LiteralPath $probe) {
            Write-Host ('[SONDA_READ_ONLY] Executando ' + $probe + ' -ProbeOnly')
            & $probe -ProbeOnly
            if (-not $?) { throw 'Sonda SSH nao concluiu com sucesso.' }
        } else { Write-Host ('[AVISO] Updater da Casa nao encontrado: ' + $probe) }
    }
    exit 0
} catch {
    $msg = [string]$_.Exception.Message
    $msg = $msg -replace '(?i)(token|authorization|password|secret)\s*[:=]\s*\S+', '$1=[REDACTED]'
    ('ERRO DE AUDITORIA: ' + $msg) | Out-File -Encoding utf8 -FilePath (Join-Path $Destino 'ERRO.txt')
    Write-Host ('[ERRO] ' + $msg) -ForegroundColor Red
    exit 3
}

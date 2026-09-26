param(
    [string]$Root = "G:\Users\danda",
    [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $Root)) {
    throw "Raiz nao encontrada: $Root"
}

$Root = (Resolve-Path -LiteralPath $Root).Path.TrimEnd('\')

if ([string]::IsNullOrWhiteSpace($OutDir)) {
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $OutDir = Join-Path $Root "_MAPA_METADADOS_$stamp"
}

New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

function Get-Sha256Text {
    param([string]$Text)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
        $hash = $sha.ComputeHash($bytes)
        return ([BitConverter]::ToString($hash) -replace "-", "").ToLowerInvariant()
    }
    finally {
        $sha.Dispose()
    }
}

function Get-RelativeSafe {
    param([string]$FullPath)
    if ($FullPath -eq $Root) { return "." }
    if ($FullPath.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $FullPath.Substring($Root.Length).TrimStart('\')
    }
    return $FullPath
}

function Get-SemanticKey {
    param([string]$RelativePath, [string]$Extension)
    $s = $RelativePath.ToLowerInvariant()
    $s = $s -replace '[\\/._\-\(\)\[\]\{\},;:+]+', ' '
    $s = $s -replace '\s+', ' '
    $s = $s.Trim()
    if ($Extension) {
        $ext = $Extension.TrimStart('.').ToLowerInvariant()
        if ($ext -and $s -notmatch "(^| )$([regex]::Escape($ext))( |$)") {
            $s = "$s $ext".Trim()
        }
    }
    return $s
}

$records = New-Object System.Collections.Generic.List[object]
$errors  = New-Object System.Collections.Generic.List[object]

# Raiz
$rootItem = Get-Item -LiteralPath $Root -Force
$records.Add([pscustomobject]@{
    id                = "p_" + (Get-Sha256Text ".").Substring(0,16)
    type              = "directory"
    name              = $rootItem.Name
    extension         = ""
    relative_path     = "."
    full_path         = $rootItem.FullName
    parent_relative   = ""
    depth             = 0
    size_bytes        = $null
    creation_utc      = $rootItem.CreationTimeUtc.ToString("o")
    modified_utc      = $rootItem.LastWriteTimeUtc.ToString("o")
    attributes        = $rootItem.Attributes.ToString()
    semantic_key      = Get-SemanticKey "." ""
    reparse_point     = (($rootItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0)
}) | Out-Null

# Enumeracao iterativa: evita seguir junction/symlink e evita recursao explosiva.
$queue = New-Object System.Collections.Generic.Queue[string]
$queue.Enqueue($Root)

while ($queue.Count -gt 0) {
    $dir = $queue.Dequeue()

    try {
        $children = Get-ChildItem -LiteralPath $dir -Force -ErrorAction Stop
    }
    catch {
        $errors.Add([pscustomobject]@{
            path  = $dir
            error = $_.Exception.Message
        }) | Out-Null
        continue
    }

    foreach ($item in $children) {
        $full = $item.FullName
        $rel  = Get-RelativeSafe $full
        $parentRel = Get-RelativeSafe $item.DirectoryName
        if ($item.PSIsContainer) {
            $parentRel = Get-RelativeSafe $item.Parent.FullName
        }

        $depth = if ($rel -eq ".") { 0 } else { ($rel -split '\\').Count }
        $isReparse = (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0)

        # ID deterministico de localizacao: muda somente se o caminho relativo mudar.
        $id = "p_" + (Get-Sha256Text ($rel.ToLowerInvariant())).Substring(0,16)

        $records.Add([pscustomobject]@{
            id                = $id
            type              = $(if ($item.PSIsContainer) { "directory" } else { "file" })
            name              = $item.Name
            extension         = $(if ($item.PSIsContainer) { "" } else { $item.Extension.ToLowerInvariant() })
            relative_path     = $rel
            full_path         = $full
            parent_relative   = $parentRel
            depth             = $depth
            size_bytes        = $(if ($item.PSIsContainer) { $null } else { [int64]$item.Length })
            creation_utc      = $item.CreationTimeUtc.ToString("o")
            modified_utc      = $item.LastWriteTimeUtc.ToString("o")
            attributes        = $item.Attributes.ToString()
            semantic_key      = Get-SemanticKey $rel $(if ($item.PSIsContainer) { "" } else { $item.Extension })
            reparse_point     = $isReparse
        }) | Out-Null

        # Nao segue junction/symlink: evita loop e sair da raiz.
        if ($item.PSIsContainer -and -not $isReparse) {
            $queue.Enqueue($full)
        }
    }
}

$recordsSorted = $records | Sort-Object relative_path

# CSV: bom para Excel / busca humana
$csvPath = Join-Path $OutDir "mapa-arquivos.csv"
$recordsSorted | Export-Csv -LiteralPath $csvPath -NoTypeInformation -Encoding UTF8

# JSONL: bom para IA / grep / ingest incremental; 1 registro por linha.
$jsonlPath = Join-Path $OutDir "mapa-arquivos.jsonl"
$recordsSorted | ForEach-Object {
    $_ | ConvertTo-Json -Compress -Depth 4
} | Set-Content -LiteralPath $jsonlPath -Encoding UTF8

# JSON completo
$jsonPath = Join-Path $OutDir "mapa-arquivos.json"
$recordsSorted | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $jsonPath -Encoding UTF8

# Sumario deterministico por extensao e tipo.
$files = @($recordsSorted | Where-Object type -eq "file")
$dirs  = @($recordsSorted | Where-Object type -eq "directory")

$extSummary = $files |
    Group-Object extension |
    Sort-Object Count -Descending |
    ForEach-Object {
        [pscustomobject]@{
            extension = $(if ([string]::IsNullOrWhiteSpace($_.Name)) { "(sem-extensao)" } else { $_.Name })
            count = $_.Count
            total_bytes = [int64](($_.Group | Measure-Object size_bytes -Sum).Sum)
        }
    }

$summary = [ordered]@{
    schema = "centraldark.local-metadata-map.v1"
    generated_at = (Get-Date).ToString("o")
    root = $Root
    content_read = $false
    file_hashes_computed = $false
    id_basis = "sha256(lowercase relative_path), first 16 hex chars"
    directories = $dirs.Count
    files = $files.Count
    total_file_bytes = [int64](($files | Measure-Object size_bytes -Sum).Sum)
    access_errors = $errors.Count
    output_directory = $OutDir
    extension_summary = @($extSummary)
}
$summaryPath = Join-Path $OutDir "resumo.json"
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

# Erros separados; nao interrompem o mapa inteiro.
$errorsPath = Join-Path $OutDir "erros.jsonl"
if ($errors.Count -gt 0) {
    $errors | ForEach-Object { $_ | ConvertTo-Json -Compress } |
        Set-Content -LiteralPath $errorsPath -Encoding UTF8
} else {
    "" | Set-Content -LiteralPath $errorsPath -Encoding UTF8
}

# Indice Markdown compacto: pastas e candidatos por nome; sem conteudo.
$mdPath = Join-Path $OutDir "MAPA-LEIA-ME.md"
$topExt = $extSummary | Select-Object -First 30

@"
# MAPA LOCAL — METADADOS SOMENTE

- Raiz: `$Root`
- Gerado: $((Get-Date).ToString("o"))
- Pastas: $($dirs.Count)
- Arquivos: $($files.Count)
- Erros de acesso: $($errors.Count)
- Conteudo dos arquivos lido: **NAO**
- Hash de conteudo calculado: **NAO**
- ID: `p_<16 hex>` derivado somente do caminho relativo normalizado.

## Arquivos de saida

- `mapa-arquivos.jsonl` — melhor para IA / busca linha a linha
- `mapa-arquivos.csv` — melhor para filtro humano
- `mapa-arquivos.json` — corpus completo
- `resumo.json` — contagens e extensoes
- `erros.jsonl` — caminhos sem acesso

## Campos de cada item

`id`, `type`, `name`, `extension`, `relative_path`, `full_path`,
`parent_relative`, `depth`, `size_bytes`, `creation_utc`, `modified_utc`,
`attributes`, `semantic_key`, `reparse_point`.

## Extensoes mais frequentes

$(
    ($topExt | ForEach-Object {
        "- $($_.extension): $($_.count) arquivos / $($_.total_bytes) bytes"
    }) -join "`r`n"
)
"@ | Set-Content -LiteralPath $mdPath -Encoding UTF8

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " MAPA DE METADADOS CONCLUIDO" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Raiz     : $Root"
Write-Host "Pastas   : $($dirs.Count)"
Write-Host "Arquivos : $($files.Count)"
Write-Host "Erros    : $($errors.Count)"
Write-Host "Saida    : $OutDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "Nenhum conteudo de arquivo foi aberto para indexacao." -ForegroundColor Green
Write-Host "Use mapa-arquivos.jsonl para IA e mapa-arquivos.csv para olhar." -ForegroundColor Cyan

<#
  CentralDark · Local Offline Library Ingest
  Setor: ML-CIENCIA-DE-DADOS

  Objetivo:
  - Copiar o corpus inteiro para uma pasta local ignorada pelo git.
  - Extrair texto quando tecnicamente possível.
  - Gerar inventory.jsonl + corpus.jsonl para busca/RAG/treino local.
  - Não publicar conteúdo bruto no repositório.

  Uso rápido:
    pwsh -ExecutionPolicy Bypass -File scripts/library/CentralDark-LocalOffline-Library-Ingest.ps1 `
      -SourceRoot "E:\CentralDark\_BIBLIOTECA_OFFLINE\entrada" `
      -OutputRoot "E:\CentralDark\_BIBLIOTECA_OFFLINE\ML-CIENCIA-DE-DADOS" `
      -Recreate
#>

[CmdletBinding()]
param(
  [string]$SourceRoot = "E:\CentralDark\_BIBLIOTECA_OFFLINE\entrada",
  [string]$OutputRoot = "E:\CentralDark\_BIBLIOTECA_OFFLINE\ML-CIENCIA-DE-DADOS",
  [int]$ChunkChars = 3500,
  [int]$MaxTextFileMB = 80,
  [switch]$CloneMlJourney,
  [switch]$InstallOptionalExtractors,
  [switch]$Recreate
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$sector = "ml-ciencia-de-dados"
$started = Get-Date -Format o
$rawRoot = Join-Path $OutputRoot "raw"
$workRoot = Join-Path $OutputRoot "work"
$indexRoot = Join-Path $OutputRoot "index"
$inventoryPath = Join-Path $indexRoot "inventory.jsonl"
$corpusPath = Join-Path $indexRoot "corpus.jsonl"
$manifestPath = Join-Path $indexRoot "manifest.json"
$receiptPath = Join-Path $indexRoot "receipt.txt"

function Write-Status($Kind, $Text) {
  $colors = @{ PASS="Green"; INFO="Cyan"; WARN="Yellow"; FAIL="Red"; WAIT="Magenta" }
  $color = $colors[$Kind]
  if (-not $color) { $color = "White" }
  Write-Host ("[{0,-5}] {1}" -f $Kind, $Text) -ForegroundColor $color
}

function Ensure-Dir($Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Force -Path $Path | Out-Null
  }
}

function Get-Sha256($Path) {
  return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function To-JsonLine($Obj) {
  return ($Obj | ConvertTo-Json -Compress -Depth 12)
}

function Append-JsonLine($Path, $Obj) {
  Add-Content -LiteralPath $Path -Encoding UTF8 -Value (To-JsonLine $Obj)
}

function Normalize-Text($Text) {
  if ($null -eq $Text) { return "" }
  $t = $Text -replace "`r`n", "`n"
  $t = $t -replace "`r", "`n"
  $t = $t -replace "[\u0000-\u0008\u000B\u000C\u000E-\u001F]", " "
  $t = $t -replace "[ \t]+", " "
  return $t.Trim()
}

function Split-TextChunks($Text, $Size) {
  $clean = Normalize-Text $Text
  if ([string]::IsNullOrWhiteSpace($clean)) { return @() }
  $chunks = New-Object System.Collections.Generic.List[string]
  for ($i = 0; $i -lt $clean.Length; $i += $Size) {
    $len = [Math]::Min($Size, $clean.Length - $i)
    $chunks.Add($clean.Substring($i, $len))
  }
  return $chunks
}

function Read-TextSafe($Path) {
  try {
    $item = Get-Item -LiteralPath $Path
    if ($item.Length -gt ($MaxTextFileMB * 1MB)) { return @{ ok=$false; reason="TEXT_FILE_TOO_LARGE"; text="" } }
    $text = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
    return @{ ok=$true; reason="OK"; text=$text }
  } catch {
    return @{ ok=$false; reason=$_.Exception.Message; text="" }
  }
}

function Extract-PdfText($Path) {
  $pdftotext = Get-Command pdftotext -ErrorAction SilentlyContinue
  if ($pdftotext) {
    $tmp = Join-Path $workRoot (([guid]::NewGuid().ToString()) + ".txt")
    & $pdftotext.Source -layout $Path $tmp | Out-Null
    if (Test-Path -LiteralPath $tmp) {
      $txt = Get-Content -LiteralPath $tmp -Raw -Encoding UTF8
      Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
      return @{ ok=$true; reason="PDFTOTEXT"; text=$txt }
    }
  }
  return @{ ok=$false; reason="PDF_TEXT_EXTRACTOR_NOT_AVAILABLE"; text="" }
}

function Ingest-Text($SourcePath, $RelativePath, $SourceKind, $Sha, $Ext) {
  $read = @{ ok=$false; reason="UNSUPPORTED"; text="" }
  $textExt = @(".md", ".txt", ".csv", ".json", ".jsonl", ".yml", ".yaml", ".py", ".js", ".ts", ".tsx", ".html", ".css", ".toml")
  if ($textExt -contains $Ext.ToLowerInvariant()) {
    $read = Read-TextSafe $SourcePath
  } elseif ($Ext.ToLowerInvariant() -eq ".pdf") {
    $read = Extract-PdfText $SourcePath
  }

  if (-not $read.ok) { return @{ chunks=0; status=$read.reason } }

  $chunks = Split-TextChunks $read.text $ChunkChars
  $idx = 0
  foreach ($chunk in $chunks) {
    $idRaw = "$sector|$RelativePath|$Sha|$idx"
    $id = [Convert]::ToHexString([System.Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($idRaw))).ToLowerInvariant()
    Append-JsonLine $corpusPath ([ordered]@{
      id = $id
      sector = $sector
      source_path = $RelativePath
      source_kind = $SourceKind
      source_sha256 = $Sha
      chunk_index = $idx
      chunk_chars = $chunk.Length
      text = $chunk
      tags = @("machine-learning", "ciencia-de-dados", "offline-local")
      created_at = (Get-Date -Format o)
    })
    $idx++
  }
  return @{ chunks=$chunks.Count; status="TEXT_INDEXED" }
}

Write-Host ""
Write-Host "          CENTRALDARK · BIBLIOTECA OFFLINE" -ForegroundColor Cyan
Write-Host "          Setor ML e Ciência de Dados · conteúdo local inteiro" -ForegroundColor DarkCyan
Write-Host "          PROVA. COSTURA. SEGUE." -ForegroundColor Yellow
Write-Host ""

if ($Recreate -and (Test-Path -LiteralPath $OutputRoot)) {
  Write-Status "WARN" "Recriando saída local: $OutputRoot"
  Remove-Item -LiteralPath $OutputRoot -Recurse -Force
}

Ensure-Dir $SourceRoot
Ensure-Dir $rawRoot
Ensure-Dir $workRoot
Ensure-Dir $indexRoot
Set-Content -LiteralPath $inventoryPath -Encoding UTF8 -Value ""
Set-Content -LiteralPath $corpusPath -Encoding UTF8 -Value ""

if ($CloneMlJourney) {
  $git = Get-Command git -ErrorAction SilentlyContinue
  if ($git) {
    $dst = Join-Path $SourceRoot "github\leandromineti\ml-journey"
    if (-not (Test-Path -LiteralPath $dst)) {
      Ensure-Dir (Split-Path $dst -Parent)
      Write-Status "WAIT" "Clonando ml-journey uma vez para uso offline..."
      & git clone --depth 1 https://github.com/leandromineti/ml-journey.git $dst
    } else {
      Write-Status "INFO" "ml-journey já existe localmente: $dst"
    }
  } else {
    Write-Status "WARN" "git não encontrado; pulei clone online."
  }
}

$zipFiles = Get-ChildItem -LiteralPath $SourceRoot -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -ieq ".zip" }
foreach ($zip in $zipFiles) {
  $target = Join-Path $workRoot ("zip-" + $zip.BaseName)
  if (-not (Test-Path -LiteralPath $target)) {
    Write-Status "WAIT" "Extraindo ZIP local: $($zip.FullName)"
    Ensure-Dir $target
    try { Expand-Archive -LiteralPath $zip.FullName -DestinationPath $target -Force }
    catch { Write-Status "FAIL" "Falha ao extrair $($zip.Name): $($_.Exception.Message)" }
  }
}

$rootsToScan = @($SourceRoot, $workRoot) | Select-Object -Unique
$totalFiles = 0
$totalChunks = 0
$totalBytes = 0

foreach ($root in $rootsToScan) {
  $files = Get-ChildItem -LiteralPath $root -Recurse -File -ErrorAction SilentlyContinue
  foreach ($file in $files) {
    if ($file.FullName -like "$indexRoot*") { continue }
    $rel = $file.FullName.Substring($root.Length).TrimStart("\", "/")
    $kind = if ($root -eq $SourceRoot) { "local-source" } else { "zip-expanded" }
    $sha = Get-Sha256 $file.FullName
    $rawDst = Join-Path $rawRoot ($sha.Substring(0,12) + "-" + $file.Name)
    if (-not (Test-Path -LiteralPath $rawDst)) {
      Copy-Item -LiteralPath $file.FullName -Destination $rawDst -Force
    }
    $ingest = Ingest-Text $file.FullName $rel $kind $sha $file.Extension
    Append-JsonLine $inventoryPath ([ordered]@{
      sector = $sector
      source_path = $rel
      source_kind = $kind
      extension = $file.Extension.ToLowerInvariant()
      size_bytes = $file.Length
      sha256 = $sha
      raw_local_copy = $rawDst
      text_status = $ingest.status
      chunks = $ingest.chunks
      observed_at = (Get-Date -Format o)
    })
    $totalFiles++
    $totalBytes += $file.Length
    $totalChunks += [int]$ingest.chunks
  }
}

$manifest = [ordered]@{
  sector = $sector
  started_at = $started
  finished_at = (Get-Date -Format o)
  source_root = $SourceRoot
  output_root = $OutputRoot
  raw_root = $rawRoot
  inventory = $inventoryPath
  corpus = $corpusPath
  total_files = $totalFiles
  total_bytes = $totalBytes
  total_chunks = $totalChunks
  policy = [ordered]@{
    local_full_content_copy = $true
    public_repo_raw_copy = $false
    git_commit_raw_corpus = $false
    use_for_local_search_rag_training = $true
    unknown_is_not_pass = $true
  }
}
$manifest | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $manifestPath -Encoding UTF8

$receipt = @"
CENTRALDARK_LOCAL_OFFLINE_LIBRARY_INGEST
sector=$sector
source_root=$SourceRoot
output_root=$OutputRoot
total_files=$totalFiles
total_bytes=$totalBytes
total_chunks=$totalChunks
inventory=$inventoryPath
corpus=$corpusPath
manifest=$manifestPath
raw_content_local_only=true
public_repo_raw_copy=false
finished_at=$(Get-Date -Format o)
"@
Set-Content -LiteralPath $receiptPath -Encoding UTF8 -Value $receipt

Write-Status "PASS" "Arquivos medidos: $totalFiles"
Write-Status "PASS" "Bytes copiados localmente: $totalBytes"
Write-Status "PASS" "Chunks gerados para busca/treino local: $totalChunks"
Write-Status "INFO" "Inventory: $inventoryPath"
Write-Status "INFO" "Corpus JSONL: $corpusPath"
Write-Status "INFO" "Raw local: $rawRoot"
Write-Status "INFO" "Receipt: $receiptPath"

[CmdletBinding()]
param([int]$PrNumber = 1880, [switch]$NoOpen)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Info([string]$Message) { Write-Host ('🪬 ' + $Message) -ForegroundColor Cyan }
function Pass([string]$Message) { Write-Host ('🟢 ' + $Message) -ForegroundColor Green }
function Check([string]$Name) { if ($LASTEXITCODE -ne 0) { throw ($Name + ' falhou. EXIT=' + $LASTEXITCODE) } }

Info 'CENTRALDARK · ONE-CLICK · CALIBRAR + COMPILAR + INSTALAR + CONECTAR'

$candidates = @((Get-Location).Path,'K:\','K:\CentralDark','E:\CentralDark\CentralDark','E:\CentralDark') | Select-Object -Unique
$Repo = $null
foreach ($candidate in $candidates) {
  if (-not (Test-Path $candidate)) { continue }
  $root = & git -C $candidate rev-parse --show-toplevel 2>$null
  if ($LASTEXITCODE -eq 0 -and $root) { $Repo = $root.Trim(); break }
}
if (-not $Repo) { throw 'CENTRALDARK_REPO_NOT_FOUND' }

$OriginalHead = (& git -C $Repo rev-parse HEAD).Trim()
$OriginalBranch = (& git -C $Repo branch --show-current).Trim()
$OriginalDirty = @(& git -C $Repo status --porcelain=v1 2>$null).Count
Pass ('Repo=' + $Repo + ' | HEAD=' + $OriginalHead + ' | branch=' + $OriginalBranch + ' | dirty=' + $OriginalDirty)

$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$RemoteRef = 'refs/remotes/origin/centraldark-pr' + $PrNumber
$Worktree = Join-Path $env:TEMP ('centraldark-pr' + $PrNumber + '-' + $Stamp)

Info ('Buscando PR #' + $PrNumber)
& git -C $Repo fetch origin ('+refs/pull/' + $PrNumber + '/head:' + $RemoteRef)
Check ('git fetch PR#' + $PrNumber)
& git -C $Repo worktree add --detach $Worktree $RemoteRef
Check 'git worktree add'
$PrHead = (& git -C $Worktree rev-parse HEAD).Trim()
Pass ('PR' + $PrNumber + '_HEAD=' + $PrHead)

$Ext = Join-Path $Worktree 'skills\vs-code-restore'
if (-not (Test-Path (Join-Path $Ext 'package.json'))) { throw 'VS_CODE_EXTENSION_OWNER_NOT_FOUND' }

Push-Location $Ext
try {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'NODE_NOT_FOUND' }
  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'NPM_NOT_FOUND' }
  if (-not (Get-Command npx -ErrorAction SilentlyContinue)) { throw 'NPX_NOT_FOUND' }
  Info 'Instalando dependencias no worktree isolado'
  npm install --ignore-scripts
  Check 'npm install'
  Info 'Rodando gates'
  npm test
  Check 'npm test'
  Info 'Compilando TypeScript'
  npm run compile
  Check 'npm run compile'
  $Pkg = Get-Content '.\package.json' -Raw | ConvertFrom-Json
  $Version = [string]$Pkg.version
  $Vsix = Join-Path $Ext ('centraldark-vscode-restore-' + $Version + '.vsix')
  Info ('Empacotando VSIX ' + $Version)
  'y' | npx --yes '@vscode/vsce' package --no-dependencies --allow-missing-repository --out $Vsix
  Check 'VSIX package'
  if (-not (Test-Path $Vsix)) { throw 'VSIX_NOT_CREATED' }
  Pass ('VSIX=' + $Vsix)
} finally { Pop-Location }

$CodeCmd = Get-Command code.cmd -ErrorAction SilentlyContinue
if (-not $CodeCmd) { $CodeCmd = Get-Command code -ErrorAction SilentlyContinue }
if (-not $CodeCmd) { throw 'VS_CODE_CLI_NOT_FOUND' }
$Code = $CodeCmd.Source

$Installed = @(& $Code --list-extensions --show-versions)
if (-not ($Installed -match '^ms-vscode-remote\.remote-ssh@')) {
  Info 'Instalando Remote-SSH oficial'
  & $Code --install-extension 'ms-vscode-remote.remote-ssh' --force
  Check 'Remote-SSH install'
}

Info ('Instalando CentralDark VSIX ' + $Version)
& $Code --install-extension $Vsix --force
Check 'CentralDark VSIX install'
$InstalledAfter = @(& $Code --list-extensions --show-versions)
$ExpectedExtension = '^centraldark\.centraldark-vscode-restore@' + [regex]::Escape($Version) + '$'
if (-not ($InstalledAfter -match $ExpectedExtension)) { throw ('CENTRALDARK_EXTENSION_VERSION_NOT_INSTALLED=' + $Version) }
Pass ('centraldark-vscode-restore@' + $Version + ' instalada')

$SshConfig = Join-Path $env:USERPROFILE '.ssh\config'
if (-not (Test-Path $SshConfig)) { throw ('SSH_CONFIG_NOT_FOUND=' + $SshConfig) }
$GitSsh = Join-Path ${env:ProgramFiles} 'Git\usr\bin\ssh.exe'
$WinSsh = Join-Path $env:WINDIR 'System32\OpenSSH\ssh.exe'
if (Test-Path $GitSsh) { $Ssh = $GitSsh } elseif (Test-Path $WinSsh) { $Ssh = $WinSsh } else { throw 'SSH_CLIENT_NOT_FOUND' }

$Winner = $null
foreach ($Alias in @('Segredo-VPS','segredo-vpss')) {
  Info ('Testando SSH=' + $Alias)
  $Probe = & $Ssh -F $SshConfig -o BatchMode=yes -o ConnectTimeout=8 -o StrictHostKeyChecking=yes -o IdentitiesOnly=yes $Alias "printf 'CENTRALDARK_SSH_OK\n'; hostname; id -un" 2>&1
  $Rc = $LASTEXITCODE
  $Text = $Probe -join [Environment]::NewLine
  if ($Rc -eq 0 -and $Text -match 'CENTRALDARK_SSH_OK' -and $Text -match 'CENTRALDARK-OS') { $Winner = $Alias; break }
}
if (-not $Winner) { throw 'SSH_ROUTE_NOT_PROVEN' }
Pass ('SSH_ROUTE=' + $Winner)

$RemoteScript = @'
set +e
echo "=== IDENTITY ==="
hostname
id -un
date -Is
echo "=== CENTRALDARK ==="
git -C /root/CentralDark rev-parse HEAD 2>/dev/null
printf "BRANCH="
git -C /root/CentralDark branch --show-current 2>/dev/null
printf "DIRTY="
git -C /root/CentralDark status --porcelain=v1 2>/dev/null | wc -l
echo "=== PUBLIC ROUTES ==="
printf "api => "; curl -ksS -o /dev/null -w '%{http_code}\n' --max-time 8 https://api.centralldark.com/health
printf "mcp => "; curl -ksS -o /dev/null -w '%{http_code}\n' --max-time 8 https://mcp.centralldark.com/health
printf "admin => "; curl -ksS -o /dev/null -w '%{http_code}\n' --max-time 8 https://admin.centralldark.com/health
echo "=== LOCAL RUNTIME ==="
printf "9100 => "; curl -sS -o /dev/null -w '%{http_code}\n' --max-time 5 http://127.0.0.1:9100/health
printf "9900 => "; curl -sS -o /dev/null -w '%{http_code}\n' --max-time 5 http://127.0.0.1:9900/health
printf "8899 => "; curl -sS -o /dev/null -w '%{http_code}\n' --max-time 5 http://127.0.0.1:8899/health
echo "=== SERVICES ==="
printf "caddy => "; systemctl is-active caddy 2>/dev/null || true
printf "tailscaled => "; systemctl is-active tailscaled 2>/dev/null || true
printf "mcp => "; systemctl is-active centraldark-native-mcp-http.service 2>/dev/null || true
printf "hermes => "; systemctl is-active hermes-gateway.service 2>/dev/null || true
'@
$EncodedRemote = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($RemoteScript))
$RemoteResult = & $Ssh -F $SshConfig -o BatchMode=yes -o ConnectTimeout=8 -o StrictHostKeyChecking=yes -o IdentitiesOnly=yes $Winner ('echo ' + $EncodedRemote + ' | base64 -d | bash')
Check 'VPS readback'
$RemoteResult | ForEach-Object { Write-Host $_ }

$Tailscale = Get-Command tailscale.exe -ErrorAction SilentlyContinue
if (-not $Tailscale) { $Tailscale = Get-Command tailscale -ErrorAction SilentlyContinue }
if ($Tailscale) { Info 'Tailscale Casa'; & $Tailscale.Source status }

if (-not $NoOpen) {
  Info 'Abrindo janela local nova com a extensao atualizada'
  & $Code --new-window $Repo
  Info ('Abrindo CentralDark OS via ' + $Winner)
  & $Code --new-window --remote ('ssh-remote+' + $Winner) '/root/CentralDark'
}

$Receipt = Join-Path $env:TEMP ('centraldark-oneclick-' + $Stamp + '.txt')
$ReceiptLines = @(
  'CENTRALDARK_ONECLICK',
  ('DATE=' + (Get-Date -Format o)),
  ('PR=' + $PrNumber),
  ('PR_HEAD=' + $PrHead),
  ('VERSION=' + $Version),
  ('VSIX=' + $Vsix),
  ('SSH_ROUTE=' + $Winner),
  ('ORIGINAL_REPO=' + $Repo),
  ('ORIGINAL_HEAD=' + $OriginalHead),
  ('ORIGINAL_BRANCH=' + $OriginalBranch),
  ('ORIGINAL_DIRTY=' + $OriginalDirty),
  'ORIGINAL_TREE_RESET=false',
  'SSH_CONFIG_MUTATED=false',
  'PRIVATE_KEY_READ_OR_COPIED=false',
  'NEXT_CURSOR=ABRIR_VIBE→DIZER_EM_LINGUAGEM_NATURAL→PAREAR_SE_NECESSARIO→STATUS'
)
$ReceiptLines | Set-Content -Path $Receipt -Encoding UTF8
Pass ('RECEIPT=' + $Receipt)
Pass 'CENTRALDARK ONE-CLICK FINALIZADO'

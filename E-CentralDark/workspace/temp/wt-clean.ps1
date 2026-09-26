$base = 'C:\CentralDark\Pivete\worktrees'
$targets = @(
  'bolt-lovable-bridge-20260726','bolt-vendor-restore','fix-gitlink-telepainel-20260730',
  'fix-glossario-github-boot-obrigatorio-20260731','meta-lupa-gate-bootstrap-20260728',
  'meta-lupa-mandatory-gate-20260728','meta-lupa-runtime-current-20260728',
  'meta-lupa-runtime-final-20260728','omniroute-centraldark-routing','pr-648-cot-react-loop',
  'pr-662-writer-wire','pr-664-hermes-final-94e53e9','pr-664-writer-fix','pr585-findings',
  'segredounlock-grok-pr1','_fort-alpha-clean','_rodadas','_rodadas-chave'
)
foreach ($t in $targets) {
  $p = Join-Path $base $t
  if (Test-Path $p) {
    Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path $p) { Write-Output ("FALHOU: " + $t) } else { Write-Output ("OK: " + $t) }
  } else {
    Write-Output ("NAO_EXISTE: " + $t)
  }
}
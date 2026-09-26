# Enxame Ômega / Janelas Paralelas — Padrão Reutilizável

> Complementa a seção "ENXAME ÔMEGA / JANELAS PARALELAS" no SKILL.md.
> CHEFE quer transformar múltiplas janelas/terminais de IA em braços de UMA missão CentralDark.

## Princípio
O "Enxame Ômega" histórico (Overclock 10/07/2026) era "leitores paralelos + consolidação".
Isso JÁ existe na Casa: `kimetsu-legacy-operational-method` (leitores paralelos por design,
ONE_WRITER, fixed point) + Hermes Core (multi-session BFF :8787 `/api/sessions`) + `SOUL.md`.
**Não criar V2, router ou segundo orquestrador** — estender o owner.

## Identidade lógica estável (T-ID NÃO depende de PID)
- T0 = SOL_ORCHESTRATOR (Hermes perfil pivete, nesta sessão)
- T1..TN = WORKERS (Codex / Claude / Hermes CLI / VS Code terminal)
- T-ID = hash estável de (workspace + engine). PID é só runtime observado.

## Arquivos criados nesta sessão (home operacional E:\CentralDark\Pivete)
- `ENXAME-OMEGA-REGISTRO.jsonl` — registro runtime append-only. Cada braço escreve 1 linha:
  ```json
  {"TERMINAL_ID":"T1","ENGINE":"codex","PID":42264,"WORKSPACE":"E:/CentralDark/Pivete/CentralDark","STATE":"ACTIVE","MISSION_ID":"...","SNAPSHOT_ID":"snap_001","LAST_RECEIPT":"2026-08-27T18:00:00Z","FACTS":["HEAD:f085e082d"],"EVIDENCE":["tasklist"],"UNKNOWN":[],"CONTRADICTIONS":[],"COUNTERPROOF":["reconciliado"],"RESIDUAL":[],"VERDICT":"PASS"}
  ```
- `scripts/enxame-omega-rendezvous.mjs` — faz CROSS_WINDOW_RENDEZVOUS:
  normalize → dedupe (TERMINAL_ID@SNAPSHOT_ID) → detectar contradições (mesma FACT, valor diverso)
  → teste discriminante → reconciled snapshot → ONE_WRITER → fixed point eval.
- `ENXAME-OMEGA-MAPA.md` — documentação do padrão T0..TN + regras do CONTRATO.

## Como gerar o mapa T0..TN (medir VS Code vivo)
VS Code `storage.json` (AppData/Roaming/Code/) tem `backupWorkspaces.workspaces[]` com
`id` + `configURIPath` (ex: `vscode-remote://ssh-remote+...+root/CentralDark` = braço VPS).
`code` CLI está no PATH (`/c/Users/danda/AppData/Local/Programs/Microsoft VS Code/bin/code`).
Processos vivos: `tasklist.exe | grep -iE 'hermes|claude|codex|Code.exe'`.

## Uso do rendezvous
```bash
node scripts/enxame-omega-rendezvous.mjs --mission=CENTRALDARK_MULTIWINDOW_OMEGA_RECONCILIATION braço1.json braço2.json
# ou pipe:
cat braços.jsonl | node scripts/enxame-omega-rendezvous.mjs --stdin --mission=...
```
Saída: JSON com `arms[]`, `contradictions[]`, `fixed_point{}`.
Testado 27/08: alinhado → FIXED_POINT=true (exit 0); HEAD divergente → contradição detectada,
NO_MATERIAL_CONTRADICTION=0, FIXED_POINT=false (exit 1).

## Regras (CONTRATO de Reconciliação)
- REUSE_BEFORE_CREATE / ONE_SYSTEM_ONLY / NO_PARALLEL_ORCHESTRATOR
- ONE_WRITER_PER_SCOPE / UNKNOWN_IS_NOT_PASS
- PRESERVE_CURRENT_WINDOWS / DO_NOT_KILL_STALLED_SESSION
- STALLED sem prova → marcar STALLED, excluir daquele rendezvous, NÃO matar.

## FIXED_POINT_PASS
SAME_MISSION_ID + SAME_FINAL_SNAPSHOT_ID + UNKNOWN_MATERIAL=0 + NO_MATERIAL_CONTRADICTION
+ COUNTERPROOF_SURVIVES + ONE_WRITER_PER_SCOPE + T1_STABLE + REGRESSION_GATE=PASS

## MSYS pitfalls (Windows)
- `/tmp` ausente → escrever artefato de teste em path estável sob repo (ex: `E:/CentralDark/Pivete/_t.json`).
- `python3` é alias da Windows Store (não roda) → usar `node` ou `uv python`.
- `find` em pastas gigantes (ex: clone CentralDark 4000+ arq) dá timeout → usar `git ls-tree` ou `search_files` com glob restrito.

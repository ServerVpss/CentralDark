# CentralDark issue tracker — canonical facts (verified 2026-07-22)

## Which repo is real
- **Canonical operational repo: `ServerVpss/CentralDark`** — this is where the issues live
  (267 issues: 233 CLOSED, 34 OPEN as of 2026-07-22). Confirmed by `AGENTS.md` §1 in
  `Documents/Codex/webhook-clean/` ("O alvo principal operacional é ServerVpss/CentralDark").
- `segredounlock/segredounlock` (README "Construindo o CentralDark") has **0 issues** — it is
  not the tracker. `segredounlock/clone-deck` is a legacy mirror with 1 issue (#146).
- Local clones exist under `Documents/Codex/webhook-clean/CentralDark` and
  `Documents/Codex/arquivados/CentralDark-live`; `gh` is authed as `segredounlock`.

## The `sentinela` bot (the source of the noise)
- A monitoring bot auto-opens issues titled `[SENTINELA sentinela-<hash>] <Area>: <detail>`
  with labels `sentinela, auto, p2, assign:<codex|grok|claude>`.
- Title body carries `Hash de dedupe: sentinela-<hash> — não reabre se já existir` and a
  "Critério pra fechar" block, but the dedupe is unreliable: the SAME hash gets re-filed many
  times. 73 `sentinela` issues = only **13 distinct alerts**. Worst offenders:
  `7bfa696946`=32 issues, `eea565501f`=16, `32645e81de`=5, `1e5ebdb30b`=5.

## False-green patterns confirmed here
- **0 of 233 closed issues** have `closedByPullRequestsReferences` — nothing was closed by a
  real PR/commit. 67 sentinela issues are CLOSED/COMPLETED via bot comment
  ("✅ Monitorei o workflow … sucesso. Problema resolvido. Fechando.") with no code.
- **Twin open/closed pairs** on the same hash: #244↔#245, #299↔#300, #246↔#249, #271↔#272.
  The CLOSED twin says "📋 mesmo problema já registrado em #NNN. Consolidando… Fechando esta"
  (stateReason COMPLETED), while the OPEN twin carries
  "🔴 Mantida aberta — evidência de falha atual… Não fechada para evitar falso verde
  (Gate de Falsificação da Lupa)". So the dup-close hides a still-failing alert.
- Non-sentinela OPEN issues #115–#134, #144, #148, #190, #195, #196, #204, #205 are the real
  architecture/roadmap backlog (labels 🔴 RISCO-SERVIDOR, 🟢 PRONTO-PARA-IA,
  🟡 IA-PRECISA-REVISAR, 🔴 FALTA-EVIDÊNCIA) — these are legitimate, not bot noise.

## What "good" looks like on this tracker
- Keeping an alert OPEN with an evidence comment ("Mantida aberta… para evitar falso verde")
  is the CORRECT behavior — do not flag those as stale.
- A CLOSED sentinela with empty PR references + "monitored, green now" is a false green until
  proven otherwise by an actual workflow-run link or PR.

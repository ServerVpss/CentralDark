# CentralDark CI Reconciliation — Session Notes (2026-08-27)

Condensed from a #ACORDAR→!RECONCILIAR ciclo onde a base da Casa estava vermelha
em `porta-de-entrada` / `Autonomia — promoção segura`. Padrões reutilizáveis.

## Bug chain descoberta (falso-vermelho em cascata)

1. **GLOBAL_RUNNER_POLICY FAIL** — `scripts/trigger-fabric/verify_repo_contract.py`
   acusava `CANONICAL_RUNNER_POLICY=FAIL` porque 2 workflows VPS
   (`vps-reboot-forensic.yml`, `vps-wake-hosted-ssh.yml`) usam `ubuntu-latest`.
   Isso é legítimo (precisam de API externa / acordar self-hosted morto).
   Fix: allowlist `runner_policy_exempt` no script + **normalizar barra**
   (`rel.replace('\\','/')`) pois no Windows `relative_to()` retorna `\`.

2. **MAIN_WRITER_SHARED_FORBIDDEN_FORCE** — `scripts/lupa/validar-continuidade-global.mjs`
   acusava 5 workflows porque o `writer-safe-push-main.sh` tem o COMENTÁRIO
   `# - ZERO rebase -X ours` e o validador fazia `sharedScriptText.includes("rebase -X ours")`.
   Comentário ≠ comando. Fix: filtrar linhas `#` antes do scan de force/rebase.

3. **ADAPTER_REDEFINED_CANONICAL_POLICY** — `scripts/lupa/agent-core-adapters.test.mjs`
   falha em 6/8 adapters (GEMINI.md, CODEX.md, .claude/rules/*, .cursor/rules/*,
   .windsurfrules, .github/copilot-instructions.md) porque citam `docs/ARQUITETURA/`
   ou `.agents/skills/` — proibidos por `FORBIDDEN_ADAPTER_POLICY`.
   Frente SISTÊMICA: exige decisão de política (relaxar teste OU limpar adapters),
   NÃO edição às cegas de 6 arquivos.

## Lições de verificação (ver SKILL.md §14.5–14.8)

- `node --test` com `new URL("../..", import.meta.url).pathname` quebra no MSYS
  (path duplicado `E:\E:\...`). Validação real de adapter test SÓ no runner Linux.
- Sempre rodar verificação FRESH da sessão antes de declarar PASS em Respiração.
  Padrão: `git show origin/<branch>:<file>` → `node --check` → worktree → executar.

## Comandos úteis

```bash
# estado de um run
gh api repos/ServerVpss/CentralDark/actions/runs/<id> --jq '"\(.status)/\(.conclusion // "running")"'
# failed steps
gh api repos/ServerVpss/CentralDark/actions/runs/<id>/jobs --jq '.jobs[] | "\(.name) [\(.conclusion)]", (.steps[] | select(.conclusion!="success") | "  - \(.name) -> \(.conclusion)")'
# log filtrado
gh run view <id> --repo ServerVpss/CentralDark --log 2>&1 | grep -iE 'ERRO |CONTINUIDADE_GLOBAL|AssertionError|MARKER_MISSING'
```

## Fronteira não resolvida (a ser decidida pelo CHEFE)

Os 4 PRs (#1228/#1227/#1223/#1211) continuam bloqueados pelo gate
`agent-core-adapters.test.mjs` (frente 3 acima). PRs #1233 (runner policy) e
#1238 (continuidade) destravam as outras camadas. Merge é decisão humana (R4).

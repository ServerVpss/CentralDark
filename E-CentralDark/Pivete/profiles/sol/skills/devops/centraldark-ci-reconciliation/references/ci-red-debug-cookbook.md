# CI Vermelho — Cookbook Consolidado de Falhas (CentralDark)

Complementa as seções 1-11 do SKILL.md. Cinco modos de falha mapeados em sessões de reconciliação (ago/2026). Cada entrada: sintoma, causa raiz medida, correção.

## 1. `python: command not found` no runner self-hosted
- **Sintoma:** `porta-de-entrada`, `autonomia-promocao`, `trigger-fabric-package` (e outros) falham com `/opt/.../.sh: line 2: python: command not found` ao chamar `python scripts/trigger-fabric/verify_repo_contract.py`. Gera `REPO_CONTRACT_VERIFY=FAIL` / `CANONICAL_RUNNER_POLICY=FAIL` na Porta e no Juiz → se CAMUFLAGEM como falha de governança.
- **Causa:** runner `vmi3256920-centraldark` tem `python3` no PATH, mas NÃO `python`. `Lupa Drift Guard` funciona porque roda `actions/setup-python@3.11`. `verify_repo_contract.py` já usa shebang `#!/usr/bin/env python3`.
- **Correção (MERGED):** PR #1235 + #1240 substituíram `python ` → `python3 ` em TODOS os workflows (porta-de-entrada, autonomia-promocao, trigger-fabric-package, lupa-conformance, nivel-7-tests). Validar YAML: `uv run --with pyyaml python -c "import yaml; [yaml.safe_load(open(f)) for f in [...]]"`.
- **PITFALL:** varrer TODOS os workflows numa passada (`git grep -nE '(^|[^3])python ' -- '.github/workflows/*.yml' | grep -vE 'python3 '`); não corrigir "os que lembrei" — faltar um mantém o vermelho.
- **Cascade proof:** no head 4e58b4d12 o contrato passou (REPO_CONTRACT_VERIFY=PASS etc.); o job ainda deu exit 1, mas por OUTRO gate (Seção 11).

## 2. Drift-guard FAILURE — `tecnica-da-lupa` (alias de compatibilidade)
- **Sintoma:** `drift-guard=FAILURE` em TODOS os PRs. Log: `SKILL_REMOVIDA_REAPARECEU: .agents/skills/tecnica-da-lupa`.
- **Causa:** `tecnica-da-lupa/SKILL.md` é COMPATIBILITY_ALIAS (`status: COMPATIBILITY_ALIAS`, `owner: meta-lupa`, `IS_SECOND_SKILL=false`), mas o `lupa-drift-guard.yml` (shell) E `scripts/lupa/detectar_drift.py` (`PROIBIDOS_EXATOS`, regex `padrao_ativo`) listam `tecnica-da-lupa` por nome fixo.
- **Correção:** trocar lista por nome por checagem semântica (permitir `type=redirect`/`status=COMPATIBILITY_ALIAS`, barar só `IS_SECOND_*=true`) — EM AMBOS (YAML + script). PR #1231 (head 613d20e4b), drift-guard provado GREEN no run 33103265535.
- **Contraprova:** estado real PASS; `metalupa-bayesiana-canonica` ainda barrado; `tecnica-da-lupa` com `IS_SECOND_SKILL=true` barrado via `elif "lupa" in nome`.

## 3. `agent-core-adapters.test.mjs` — ENGINE_MARKER_MISSING / CORE_ROUTE_MISMATCH
- **Sintoma:** `porta-de-entrada=FAILURE` com `ENGINE_MARKER_MISSING:CLAUDE.md:CLAUDE` e `CORE_ROUTE_MISMATCH:CLAUDE.md` (scripts/lupa/agent-core-adapters.test.mjs:73/98).
- **Causa:** teste espera `ENGINE=CLAUDE` + `CANONICAL_AGENT_CORE` no `CLAUDE.md`, mas a main tem `ENGINE=REPLACEABLE` + hierarquia `SEGREDO/CHEFE > SOL > PIVETE/HERMES`. Teste dessincronizado da realidade. Afeta TODOS os PRs.
- **Correção:** NÃO feita (HUMAN_FRONTIER — mexer em teste de governança ou no CLAUDE.md canônico).

## 4. Juiz — `GLOBAL_RUNNER_POLICY=FAIL` (ubuntu-latest VPS)
- **Sintoma:** `Juiz=FAILURE` com `runner_violations` listando `vps-reboot-forensic.yml` + `vps-wake-hosted-ssh.yml` (`runs-on: ubuntu-latest`).
- **Causa:** os 2 workflows usam `ubuntu-latest` INTENCIONALMENTE (comentário: "Self-hosted NÃO acorda a si mesmo"). Falso-positivo by-design. Checker do Juiz NÃO está no repo local (sistema externo/VPS; inalcançável da Casa quando MCP 502).
- **Correção:** NÃO feita (externo/VPS). Pendência de fronteira.

## 5. `CONTINUIDADE_GLOBAL=BLOCKED` (pós-command-not-found)
- **Sintoma:** após matar o `python`, o `porta-de-entrada` ainda dá exit 1: `CONTINUIDADE_GLOBAL=BLOCKED MAIN_WRITERS=7 COUNTERPROOF=BLOCKED ERRORS=5`.
- **Causa:** `node scripts/lupa/validar-continuidade-global.mjs`. `MAIN_WRITERS=7` = 7 writers ativos na main (ONE_WRITER_PER_SCOPE funcionando como BLOCKED). `COUNTERPROOF=BLOCKED` = contraprova pendente. Repo-level, afeta todos os PRs.
- **Correção:** NÃO feita (HUMAN_FRONTIER — reduzir writers concorrentes ou abrir exceção é decisão do CHEFE).

## Comandos de investigação (reutilizáveis)
```bash
# runs do seu head novo (ignora rollup misturado de head antigo)
gh run list --repo ServerVpss/CentralDark --branch <branch> --headSha <sha> --limit 10

# forçar julgamento quando runner busy
gh workflow run "Lupa Drift Guard" --repo ServerVpss/CentralDark --ref <branch>

# ler erro real
gh run view <run_id> --repo ServerVpss/CentralDark --log-failed

# repro local python (host Casa tem uv, não python)
uv run python scripts/lupa/detectar_drift.py

# validar yaml após editar workflow
uv run --with pyyaml python -c "import yaml; [yaml.safe_load(open(f)) for f in ['<wf>']]; print('OK')"

# head remoto autoritativo (gh pr view faz cache)
git ls-remote origin refs/heads/<branch>

# varredura python (sem 3) restante nos workflows
git grep -nE '(^|[^3])python ' -- '.github/workflows/*.yml' | grep -vE 'python3 ' || echo NENHUM_RESTANTE
```

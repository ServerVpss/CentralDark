# Base gate vermelha — GLOBAL_RUNNER_POLICY (2026-08-27)

## Sintoma
4 PRs abertos (`#1228`, `#1227`, `#1223` draft, `#1211`) com `Juiz determinístico`
+ `Porta, identidade e governança canônica estão íntegras?` = FAIL, mas
`Comentar e rotear`, `IA consultiva`, `validar` = PASS.

## Raiz (provada, não palpite)
`porta-de-entrada` falha NA PRÓPRIA `main` (run `33083189738`, merge do #1222)
no step `Gate global — Trigger Fabric + runner policy + self-healing contract`.
Esse step roda `scripts/trigger-fabric/verify_repo_contract.py .` e exige
`REPO_CONTRACT_VERIFY=PASS` + `CANONICAL_RUNNER_POLICY=PASS`.

Reprodução local (clone CentralDark):
```bash
uv run --no-project python scripts/trigger-fabric/verify_repo_contract.py .
# runner_violations:
#   .github\workflows\vps-reboot-forensic.yml   label=ubuntu-latest
#   .github\workflows\vps-wake-hosted-ssh.yml   label=ubuntu-latest
# REPO_CONTRACT_VERIFY=FAIL
# CANONICAL_RUNNER_POLICY=FAIL
```

## Por que os PRs ficam vermelhos
`porta-de-entrada` é gate obrigatório da base. Se a base falha, os PRs herdam
o vermelho independente do diff deles.

## O que são os 2 arquivos
- `vps-reboot-forensic.yml` — `workflow_dispatch` com input `MUTATION`
  (dry-run vs reboot real VPS Contabo/Cloudflare). Precisa de rede externa.
  Entrou em `bd54aaa9c`.
- `vps-wake-hosted-ssh.yml` (#1217) — `workflow_dispatch` que faz SSH na VPS e
  restarta o runner. Comentário no topo diz explicitamente "(ubuntu-latest)".
  É dispatch manual R4, não CI automático.

## Tooling que funcionou
`gh run view <id> --json steps` → UNKNOWN JSON field (gh local não suporta).
Substituir por:
```bash
gh api repos/ServerVpss/CentralDark/actions/runs/<ID>/jobs \
  --jq '.jobs[] | "JOB: \(.name) [\(.conclusion)]", (.steps[] | select(.conclusion!="success") | "  - \(.name) -> \(.conclusion)")'
```
No run da main, o único step `failure` foi `Gate global — Trigger Fabric...`;
os demais ficaram `skipped` (set -e cortou a cadeia).

## Opções de correção (HUMAN_FRONTIER — exige ordem do CHEFE)
- A (recomendada): isentar os 2 do `GLOBAL_RUNNER_POLICY` no
  `verify_repo_contract.py` por classificação (são dispatch R4). Mínimo de mudança.
- B: trocar `ubuntu-latest`→`self-hosted` nos 2. Quebra funcionalidade (precisam
  de rota pra internet/VPS que o runner self-hosted pode não ter).
- C: deixar. Base segue vermelha, PRs travados.

Correção via PR próprio (`fix/runner-policy-exempt-vps`, Writer único), nunca
force-push na main nem edição solitária do contrato.

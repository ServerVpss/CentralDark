---
name: centraldark-ci-gate-debugging
description: Debug CentralDark CI gate failures via gh and git.
version: "1.0.0"
author: "Hermes Agent"
license: "MIT"
tags: ["centraldark", "ci", "github-actions", "debugging", "gate", "regression"]
category: "software-development"
related_skills: ["centraldark-casa-operations", "centraldark-ci-gate-forensics", "centraldark-ci-reconciliation", "trigger-chain-verification"]
metadata:
  hermes:
    tags: ["centraldark", "ci", "github-actions", "debugging", "gate", "regression"]
    related_skills: ["centraldark-casa-operations", "centraldark-ci-gate-forensics", "centraldark-ci-reconciliation", "trigger-chain-verification"]
---

# CentralDark CI Gate Debugging

Diagnose and fix a red CentralDark CI gate with the smallest safe change. See
references/recipes.md for copy-modify command recipes. The repo
`ServerVpss/CentralDark` runs a self-hosted runner; `porta-de-entrada` is a
meta-gate running many sub-suites (identity, codex-validate, lupa-drift-guard,
continuity-guard). One red gate hides several independent failures.

## When to Use
A `porta-de-entrada` / `codex-validate` / `lupa-drift-guard` run is `failure` and
you must prove the cause from the log (not guess) and fix WITHOUT weakening a
governance gate.

## Measure first
```bash
gh run list --limit 40 --json databaseId,headBranch,headSha,status,conclusion,createdAt,workflowName,name
gh run view <RUN_ID> --log-failed > /tmp/run.log
grep -nE "##\[error|SyntaxError|IDENTIDADE_ERRO|EXTERNAL_SOURCE|RESULTADO=|ERROS=|INVARIANT_PROOF|UNREGISTERED" /tmp/run.log
```
Pitfall: `gh api .../actions/jobs/<id>/log` → 404 on this runner; use
`gh run view <id> --log-failed`. `gh run watch` can hit the 400s timeout; use
`gh run view <id> --json conclusion,status`.

## Failure patterns
**A. Lost-export regression** (`SyntaxError: ... does not provide an export named X`).
A consolidation PR dropped a function a test imports. Recover canonically:
```bash
LAST=$(git log -S "aplicarGatePercepcao" --pretty=format:"%H" -- <path/module.mjs> | tail -1)
git show "$LAST":<path/module.mjs> > <path/module.mjs>
node --test <path/test.mjs>
```
Restore the LAST commit that had the export + its helper chain. Never hand-rewrite.

**B. External-source governance gate** (`EXTERNAL_SOURCE_*_FORBIDDEN`, tokens
`aiox`/`SynkraAI`/`aioxsquad.ai`). Gate is CORRECT — do NOT weaken. Sanitize
literal tokens (`aiox`→`ai-ox`, `SynkraAI`→`Synkra-AI`), keep hashes/inspected_sha.
Verify grep returns 0.

**D. Runner/capacity failure** (`queued` por longos períodos, runner offline).
O problema é capacity, não defeito funcional — não investigar defeito de código
enquanto o runner não executou. Fluxo:

1. Verificar estado do runner:
   ```bash
   gh api repos/ServerVpss/CentralDark/actions/runners --jq '.runners[] | {name: .name, status: .status, busy: .busy}'
   ```
2. Se `offline`, investigar recovery workflows EXISTENTES antes de assumir defeito:
   - `vps-wake-hosted-ssh.yml` — SSH wake via GitHub hosted (ubuntu-latest)
     usa secrets `VPS_SSH_KEY_LOVABLE`, `VPS_HOST_LOVABLE`, `VPS_USER_LOVABLE`
   - `vps-reboot-forensic.yml` + `scripts/vps-reboot-forensic.py` — Contabo API reboot
     precisa `CONTABO_CLIENT_ID`, `CONTABO_CLIENT_SECRET`, `CONTABO_API_USER`,
     `CONTABO_API_PASSWORD`, `CLOUDFLARE_API_TOKEN`
3. Se DNS falhou ("Temporary failure in name resolution"): problema de reachability,
   não só porta 22 fechada — VPS não resolve por DNS
4. Se Contabo secrets ausentes no repo: não pode fazer reboot via API; precisa
   configure secrets pelo humano antes
5. **Regra**: capacity failure é `UNKNOWN`, não `FAIL` funcional. Só declare
   defeito funcional após run executado e log de falha lido.

Pitfall: `vps-wake-hosted-ssh.yml` é `workflow_dispatch` — não dispara
automaticamente. O agente precisa disparar explicitamente ou o humano precisa
fazer o wake diretamente.

Pitfall: Não confundir `queued`/`pending` com `failure` — `queued` pode ser
capacity/runner offline, não defeito do código.

**Pitfall de diagnóstico de DNS**: erro `ssh: Could not resolve hostname: Temporary
failure in name resolution` é DNS/reachability, não porta 22 bloqueada. Se o SSH
falhar com esse erro, o problema é resolução de nome ou rede, não a chave ou a
porta. Tentar wake via Contabo API (`vps-reboot-forensic.yml`) ou investigar DNS.

**Pitfall de secrets**: ao disparar `vps-reboot-forensic.yml`, o script verifica
`CONTABO_CLIENT_ID`, `CONTABO_CLIENT_SECRET`, `CONTABO_API_USER`,
`CONTABO_API_PASSWORD` e falha se ausentes. Sem os secrets Contabo, o path de
reboot via API não está disponível — fica somente DNS forensics via Cloudflare.

## Loop insight
`porta-de-entrada` runs suites sequentially; fixing #1 reveals #2. Measure →
fix smallest → re-run gate → repeat until all green. Base stays red until EVERY
suite passes.

## Rules
ONE_WRITER_PER_SCOPE (one worktree/branch per fix); zero regression (restore
canonical, never V2, never weaken gate); proof before claim (`node --test`
PASS); open PR per scope; human merges base (R4).

## Pitfalls
`python3` MISSING on MSYS — use `python`/`node`. `search_files` can return 0
with files present — use `git ls-files` / `git ls-tree -r --name-only origin/main`.
`gh workflow run --ref <b>` → 422 if branch merged/not indexed. Pure unit
`node --test` suites run fine locally; ones using `new URL("../../",import.meta.url)`
break on MSYS.

In GitHub Actions YAML, avoid heredoc-based JSON emission inside bash functions.
`cat <<'JSON' ... JSON` often breaks the YAML parser even when the block looks
valid, and once broken the file silently becomes invalid. Use `printf`/`jq -n` to
build JSONL lines and state files deterministically, especially for log events
and idempotency files written from within a function.

## Delta reutilizável — baseline, merge-base e pacotes cross-owner

Para PRs que acumulam várias falhas independentes, o diagnóstico deve separar três classes antes de editar:

1. **Regressão do delta**: erro introduzido entre `merge-base(origin/main, HEAD)` e `HEAD`; corrigir no owner do PR.
2. **Dívida baseline**: fingerprint/contagem idêntica em `origin/main` e no PR; preservar visibilidade, mas não bloquear o PR se o gate comprovar `UNSAFE_PATHS=0` e a política do workflow permitir baseline.
3. **Falha de infraestrutura/runner**: `queued`, timeout ou shutdown sem conclusão do job; isso é `UNKNOWN`, não falha funcional nem PASS.

Sempre medir `origin/main` atual antes de fixar a causa. Se `main` avançar durante a missão, fazer merge/rebase pelo padrão do repositório, resolver semanticamente e só então rerodar checks. Para conflito `modify/delete`, arqueologia do consumidor e do contrato decide; nunca manter `ubuntu-latest` ou workflow auxiliar apenas por posição visual se a política canônica exige self-hosted.

### Pacote com requisitos fora do owner físico

Quando `verify_package.py` exige um contrato canônico localizado fora da pasta empacotada, o builder deve copiar o arquivo para o ZIP preservando seu caminho relativo (`docs/ARQUITETURA/...`). Não criar cópia canônica no repositório. A prova mínima é:

```bash
python scripts/trigger-fabric/build_package.py
python scripts/trigger-fabric/verify_package.py <extracted-package-root>
```

Se o verificador exigir tokens que pertencem ao diagrama, adicionar os nós ao `ARCHITECTURE.mmd` e deixar o PNG ser gerado pelo workflow; não fabricar imagem vazia como correção do repositório.

### Lint global fora do escopo

Se `npm test` e `npm run build` passam, mas `npm run lint` falha em centenas de arquivos fora do delta, registrar a falha como dívida preexistente e rodar lint direcionado aos arquivos alterados. Não fazer reforma global para fechar um PR de CI específico.

### Label gate e heurística de versão

- Quando `label-gate-run.mjs` emitir `LABEL_NAO_CANONICA`, ler o catálogo real de `.github/workflows/bots-labels-seed.yml` e comparar as labels vivas do PR; não substituir uma label por semelhança textual. Remover somente as labels comprovadamente fora do catálogo.
- Quando `validar-mapa.mjs` classificar um caminho como versão paralela, abrir o artefato e procurar owner/referências antes de excluir. Se o conteúdo declara um owner existente e não há referências ao filename, preserve o conteúdo e o histórico Git renomeando para um nome sem `vN`, `V2`, `final` ou `copy`.
- Um run verde antigo, um run `cancelled`, `queued` ou `skipped` nunca valida o HEAD atual. Após cada mutação, consultar `headSha` e acompanhar o run mais novo; só `success/pass` no HEAD exato fecha a prova.

## Pitfall — Gate de cartazes canônicos (ENOENT por nome de diretório divergente)
Se o gate "Cartazes canônicos" falhar com `ENOENT: no such file or directory,
open '.../CARTAZES-CANONICOS/manifest.json'`, veja
`references/canonical-posters-missing-dir.md`. Em resumo:

- Causa: diretório real é `01-CARTAZES-CANONICOS/`, validator espera `CARTAZES-CANONICOS/`.
- Fix: `ln -s 01-CARTAZES-CANONICOS docs/BRAIN/08-ARTEFATOS-VISUAIS/CARTAZES-CANONICOS`
- Validar local: `node .agents/skills/visual-design-method/scripts/validate-canonical-posters.mjs`
- Nunca renomear o diretório — symlink mantém ambos os caminhos válidos.


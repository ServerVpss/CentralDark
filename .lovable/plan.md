# Plano: Consolidação Vigia Self-Hosted + PR #82

## Objetivo
Fechar o PR #82 (`fix/vigia-self-hosted-minimal`) e deixar os robôs do GitHub (Vigia, Codex, Dependabot, dispatcher, farm, linear-sync) rodando no runner self-hosted da VPS, sem bater no billing dos GitHub-hosted runners. Atualizar pendência #132 só com evidência real.

## Fases

### 1. Confirmar PR #82
- `gh pr view 82 --repo ServerVpss/CentralDark --json number,state,mergeable,baseRefName,headRefName,changedFiles,url`
- `gh pr diff 82 --repo ServerVpss/CentralDark --name-only`
- Validar: base `main`, estado `OPEN`, `MERGEABLE`, sem CRM/secrets/Docker/Caddy/PM2/WuzAPI/banco.

### 2. Identificar workflows que ainda batem em billing
Buscar em `.github/workflows/` os arquivos correspondentes a:
- "PR auto-review (Codex + checklist)"
- "codex-validate / Validate Codex operational kit"

Listar todos `runs-on: ubuntu-latest` restantes e classificar como **seguro** (apenas check/lint/review/automação de PR) ou **sensível** (deploy/Docker/Caddy/PM2/secrets — NÃO migrar).

### 3. Migrar apenas workflows seguros para `self-hosted`
Na branch `fix/vigia-self-hosted-minimal`:
- `git checkout fix/vigia-self-hosted-minimal && git pull --ff-only`
- Trocar `runs-on: ubuntu-latest` → `runs-on: self-hosted` apenas nos workflows seguros identificados.

### 4. Validar antes do commit
- `git diff --name-only` — bloquear se aparecer: `apps/crm/`, `.env`, `secrets`, `tokens`, `sessions`, `.ssh`, `*.pem`, `*.key`, `docker`, `caddy`, `pm2`, `wuzapi`, `whatsapp`, `database`, `banco`, `supabase`.
- Validar YAML: `ruby -e 'require "yaml"; ARGV.each{|f| YAML.load_file(f); puts "ok #{f}"}' <arquivos>`
- `git diff --check`

### 5. Commit seletivo (sem `git add .`)
```
git add .github/workflows/<arquivos-alterados>
git commit -m "fix(ci): run PR automation checks on self-hosted" -m "Migra workflows seguros de PR/Codex/checklist para self-hosted para evitar bloqueio por billing."
git push origin fix/vigia-self-hosted-minimal
```

### 6. Validar checks do PR #82
- `gh pr checks 82 --repo ServerVpss/CentralDark`
- Se falhar: `gh run list ... --branch fix/vigia-self-hosted-minimal` + `gh run view <id> --log-failed`
- Billing residual → identificar workflow e migrar se seguro.
- Erro de código → commit pequeno na mesma branch.
- Codex/OpenAI deslogado em workflow já self-hosted → registrar como bloqueio externo, sem declarar verde.

### 7. Merge normal do PR #82
Somente com base main, mergeable, escopo seguro, checks obrigatórios verdes (ou comprovadamente skipped/não obrigatórios), e sem billing em workflow seguro restante:
```
gh pr merge 82 --repo ServerVpss/CentralDark --squash --delete-branch
```
Sem `--admin`, sem `--force`, sem push direto na main.

### 8. Testar Vigia na main
```
gh workflow run vigia-actions-vermelhos.yml --repo ServerVpss/CentralDark --ref main
sleep 8
gh run list --workflow vigia-actions-vermelhos.yml --limit 1 --repo ServerVpss/CentralDark
gh run watch <RUN_ID> --repo ServerVpss/CentralDark --exit-status
gh run view <RUN_ID> --repo ServerVpss/CentralDark --log
```
Confirmar nos logs: runner self-hosted `vmi3256920`, `GITHUB_REPOSITORY=ServerVpss/CentralDark`, Octokit OK, sem erro de label `red-action`, sem billing, conclusão `success`.

### 9. Validar os demais robôs
Para cada um — `vigia-actions-vermelhos`, `linear-pendencias-sync`, `dependabot-auto-merge`, `dispatcher-bots`, `farm-co-author`, `PR auto-review/Codex checklist`, `codex-validate` — confirmar: self-hosted quando seguro, sem billing, sem dependência obrigatória de `gh` CLI, Octokit/API quando aplicável.

### 10. Atualizar pendência #132
Editar `docs/PENDENCIAS.md` (e/ou a issue #132) com evidência real (links de run, PR, commit). Marcar concluído **apenas** se todos os critérios baterem. Caso contrário, registrar exatamente o que ficou, por quê, qual run/PR comprova, e próximo passo.

### 11. Relatório final
Entregar no formato pedido (STATUS, REPOSITÓRIO, PR #82, MERGE, COMMIT FINAL, CHECKS, WORKFLOWS MIGRADOS, RUNNER, cada robô, GH CLI, OCTOKIT, BILLING, LABEL, PENDÊNCIA #132, SERVIÇOS REINICIADOS, RISCOS, BLOQUEIOS, PRÓXIMO PASSO).

## Restrições (invioláveis)
- Sem `git add .`, `--force`, `--admin`, push direto na main.
- Sem tocar em CRM, `.env`, secrets, tokens, sessions, Docker, Caddy, PM2, WuzAPI, WhatsApp, banco, Supabase real.
- Sem apagar arquivo/pasta nem reiniciar serviço da VPS sem necessidade comprovada.
- Sem usar a branch contaminada `fix/vigia-self-hosted-final`.
- Sem declarar verde sem run real.

## Detalhes técnicos
- Acesso à VPS (se necessário p/ runner): `source scripts/lovable-agent/setup-vps-ssh.sh && ssh-vps "..."`. Não vou reiniciar o runner sem motivo.
- Toda alteração de workflow vai na branch `fix/vigia-self-hosted-minimal`, em commits pequenos e seletivos.
- Se algum check obrigatório não puder virar verde por bloqueio externo (ex.: OpenAI/Codex), NÃO faço merge — registro na #132 e devolvo o relatório.
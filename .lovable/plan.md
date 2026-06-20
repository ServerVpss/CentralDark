# Plano — Ajuste final no PR #86 (ServerVpss/CentralDark)

Trabalho é 100% no repo externo `ServerVpss/CentralDark` via `gh`/GitHub API + `ssh-vps` quando precisar. Nada disso entra no codebase do Lovable atual (telegram-zen-panel). Branch alvo: `chore/bots-guard-billing-antipublic-reload` (PR #86). Sem merge automático — entrego relatório e espero seu OK.

## Restrições invioláveis
Sem `git add .`, sem `--force`, sem `--admin`, sem push na main, sem aplicar SQL, sem mexer em banco/Supabase real, sem CRM/secrets/.env/sessions/SSH, sem reiniciar Docker/Caddy/PM2/WuzAPI, sem apagar workflow no escuro, sem fechar issues, sem resolver conversas do Codex antes de corrigir/documentar.

## Fase 0 — Estado do PR #86 e comentários do Codex
- `gh pr view 86`, `gh pr diff 86 --name-only`, `gh pr checks 86`.
- Listar comentários do Codex via `gh api repos/.../pulls/86/comments` e `/reviews`.
- Confirmar branch ainda aberta. Se fechada/mergeada, abrir `fix/vigia-passo-desconhecido` a partir da main.

## Fase 1 — Inventário total de workflows
- Ler todos `.github/workflows/*.y{a,}ml` via API.
- Para cada um capturar: nome, `on:`, `runs-on:`, jobs sensíveis.
- Classificar em **ATIVO SEGURO** (bots/vigia/validação/triage/sync/docs), **LEGADO** (clone-deck/MultiZap/segredounlock/experimentos), **SENSÍVEL** (deploy/Supabase/VPS SSH/WuzAPI/WhatsApp/CRM/Docker/Caddy/PM2/mirror).
- Gerar/atualizar `docs/RELATORIOS/2026-06-20-zero-github-hosted-runners.md` com tabela: arquivo · workflow · gatilhos · runner · classificação · ação · risco · precisa autorização.

## Fase 2 — Zero GitHub-hosted em jobs seguros
- ATIVO SEGURO com `ubuntu-*`/`macos-*`/`windows-*` → trocar para `runs-on: self-hosted` + `concurrency:` se faltar.
- LEGADO automático → manter arquivo, remover `push/schedule/pull_request`, deixar só `workflow_dispatch:`. Não apagar.
- SENSÍVEL → não tocar; registrar como BLOQUEIO no relatório (motivo, risco, ação recomendada, autorização).
- Validar: `grep -RniE "ubuntu-latest|ubuntu-22.04|ubuntu-24.04|macos-latest|windows-latest" .github/workflows` — qualquer remanescente precisa estar documentado/justificado.

## Fase 3 — Correções do Codex Review
1. **bot-server-validate.yml** — manter self-hosted. Restringir `pull_request` para `pull_request_target` só com guard `if: github.event.pull_request.head.repo.full_name == github.repository` (sem fork). Documentar risco aceito: repo privado, sem PR externo.
2. **github-bot-controller.yml** — manter self-hosted. Adicionar `if: github.event.pull_request.merged == true` no job. Forçar `actions/checkout` com `ref: ${{ github.event.repository.default_branch }}` (não a branch do PR). Se inviável, deixar só `workflow_dispatch` + nota.
3. **scripts/guards/anti-public-policies-check.sh** — remover `psql "$DATABASE_URL"`. Usar `PGPASSFILE` temporário (`mktemp` + `chmod 600`) ou exportar `PGHOST/PGPORT/PGUSER/PGDATABASE/PGPASSWORD` e chamar `psql` sem argumentos. Continua read-only, sem aplicar SQL.
4. **docs/PENDENCIAS.md** — varrer IDs existentes, escolher próximos livres reais (sem duplicar). Converter entradas novas do formato `🔴 #N — Título` para o padrão `### N. Título` + corpo, compatível com `scripts/sync/linear-pendencias.mjs`.
5. Documentar no relatório: `chatgpt-codex-connector` = review automático; `pr-auto-review.yml` = checklist/label interno; decisão self-hosted por custo zero em repo privado; conversas do Codex serão resolvidas só depois do push corretivo.

## Fase 4 — Node 24 cirúrgico nos 7 workflows do PR #82
Arquivos permitidos (proibido tocar fora):
`vigia-actions-vermelhos.yml`, `dependabot-auto-merge.yml`, `dispatcher-bots.yml`, `farm-co-author.yml`, `linear-pendencias-sync.yml`, `pr-auto-review.yml`, `codex-validate.yml`.

- Inventariar `uses:` só nesses 7.
- Bumps conservadores: `actions/checkout@v5`, `actions/setup-node@v5` + `node-version: '24'`, `actions/cache@v4`, `actions/upload-artifact@v4`, `actions/download-artifact@v4`, `actions/github-script@v8` (NÃO v9), `actions/setup-python@v5` se houver.
- Não mexer em lógica/permissions/triggers (salvo se já alterado na Fase 2).
- Confirmar versão do runner `vmi3256920` via `ssh-vps "cd ~/actions-runner && cat .runner 2>/dev/null; ./run.sh --version 2>/dev/null || ls bin/"`. Se ≥ v2.327.1 ok; senão registrar risco no relatório.
- Tabela no relatório: action antes/depois · arquivo · motivo · risco · runner version.

## Fase 5 — Vigia: fim do "(passo desconhecido)"
Editar `scripts/vigia/actions-vermelhos.mjs`:
- Função que escolhe o step: tentar `conclusion === "failure"` → senão `"cancelled"` → senão `"skipped"` → senão, se o job falhou e nenhum step bateu, retornar **"(Falha Fatal de Ambiente / Runner Morto - Checar RAM/OOM)"**.
- Sem mexer em labels/abertura de issue/classificação fora disso.
- Validação: `node --check` + `grep` da string nova.

## Fase 6 — Memória / troubleshooting
- Criar `docs/CONSCIENCIA/TROUBLESHOOTING-VIGIA.md` (significado da nova mensagem, como foi corrigido, ações manuais: PM2, RAM, `dmesg`/`journalctl`, runner online, OOM, disco; aprendizados).
- Adicionar nota curta em `docs/CONTINUIDADE/proxima-ia.md`.

## Fase 7 — Guard anti-regressão + checklist
- `scripts/guards/no-github-hosted-runners-check.sh` (read-only; lista runners hospedados; falha se algum workflow seguro estiver hospedado; sem rede, sem banco).
- Atualizar `docs/CHECKLIST-SEGURANCA-BOTS.md` com as 4 regras (seguro=self-hosted; hospedado proibido salvo exceção; legado manual/documentado; sensível exige humano).

## Fase 8 — Anti-public / SQL review (sem aplicar)
- Manter/atualizar `docs/CHECKLIST-ANTI-PUBLIC.md`, `scripts/guards/anti-public-policies-check.sh` (já corrigido na Fase 3.3), `docs/SQL-REVIEW/2026-06-20-fix-public-policies-review.md`.
- **SQL APLICADO: NÃO.** Banco e Supabase intactos.

## Fase 9 — Handoff
Atualizar `docs/CONTINUIDADE/proxima-ia.md`, `docs/RELATORIOS/2026-06-20-bots-guard-billing-antipublic-reload.md`, `docs/PENDENCIAS.md` com todo o contexto consolidado (PRs #82/#84/#86, main 9b1c00e, run 27861071001, runner vmi3256920, #57 ✅, #132 não existe, policies auditadas sem patch, sensíveis catalogados, próximas etapas exigem OK humano).

## Fase 10 — Validações antes do commit
- `git diff --name-only` — bloquear se aparecer `apps/crm/`, `.env`, `secrets`, `tokens`, `sessions`, `.ssh`, `*.pem`, `*.key`, migrations SQL, scripts de produção.
- YAML lint dos alterados (`ruby -ryaml -e ...`).
- `git diff --check`.
- `node --check scripts/vigia/actions-vermelhos.mjs`.
- `bash -n` + execução dos guards shell criados/alterados.

## Fase 11 — Commit no PR #86
- Commit seletivo (lista explícita de arquivos), mensagem: `chore(ci): enforce zero billing runners and improve Vigia diagnostics`.
- Push na branch `chore/bots-guard-billing-antipublic-reload`. **Sem merge.**
- Acompanhar `gh pr checks 86`. Só depois de tudo verde e dentro do escopo, resolver conversas do Codex que ficaram cobertas.

## Fase 12 — Relatório final
Entrego no chat o bloco com todos os campos pedidos (STATUS, PR #86, COMMIT NOVO, ARQUIVOS ALTERADOS, totais por classificação, GitHub-hosted removidos/restantes, ACTIONS NODE 24 ALTERADAS, RUNNER VERSION, CODEX ITENS 1–5, VIGIA, GUARDS, ANTI-PUBLIC, SQL APLICADO=NÃO, BANCO/CRM/SECRETS intactos, ISSUES intactas, HANDOFF, RISCOS, BLOQUEIOS, PODE MERGEAR?, PRÓXIMO PASSO) e aguardo seu OK humano.

## Detalhes técnicos (referência rápida)
- Acesso: `GH_TOKEN` + `GITHUB_OWNER=ServerVpss` + `GITHUB_REPO=CentralDark` via `gh`/REST. SSH na VPS via `source scripts/lovable-agent/setup-vps-ssh.sh` e `ssh-vps`.
- Lovable Cloud (este projeto telegram-zen-panel) **não é tocado** — o scanner pode reclamar das policies do banco *deste* projeto, mas a ordem é não aplicar SQL agora; vou marcar findings como pendência documentada na security memory deste projeto e seguir.
- Sem merge automático em hipótese alguma.

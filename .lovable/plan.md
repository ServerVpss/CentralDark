
# Auditoria read-only — PR #315 (ServerVpss/CentralDark)

Fonte independente: GitHub REST API via conector oficial (ServerVpss/CentralDark). Nada foi editado, commitado, publicado ou implantado.

---

## PROVADO (com evidência da API)

**1. State do PR**
- `state: open`
- `merged: false` · `merged_at: null` · `closed_at: null`

**2. Draft ou ready**
- `draft: true` (permanece como rascunho)

**3. Base e head**
- Base: `ServerVpss:main` @ `4311499c6285377e0f44bd2fe26f9dcdb06b7995`
- Head: `ServerVpss:test/desafio-omega-autolupa-2026-07-22` @ `2d4acb9c38189a978bc2123c095e294574182f71`
- Título: `[BENCHMARK] Desafio Omega — autocorreção com prova`
- Autor: `segredounlock` · Criado: `2026-07-22T19:30:09Z` · Atualizado: `2026-07-22T19:34:55Z`

**4. Labels atuais (4)**
- `🤖 IA-VALIDAR` ✅
- `🧠 AGENTE-HERMES` ✅
- `🔄 GIT` ✅
- `permito-pivete` ✅

**5. Commits visíveis na head branch (ordem: mais recente → mais antigo)**
- `2d4acb9c38189a978bc2123c095e294574182f71` — `feat(omega): resolve benchmark com solver deterministico + ledger (25/25)` — Hermes Pivete, 2026-07-22T19:29:35Z (HEAD do PR)
- `d9f45b258e518287717e54004409d381d0b14859` — `test(omega): arma benchmark adversarial de autocorrecao` — Hermes Pivete, 2026-07-22T19:17:46Z (baseline vermelho)
- Pai anterior à baseline: `5caeb7271f6497e9b7091ca86efa859dfe638248` (commit painel automático, fora do escopo do PR)

Ou seja, o PR contém **2 commits novos** sobre `main`: baseline (Fase A) + solver (Fase B).

**7. Checks/CI no HEAD `2d4acb9c…`**
- Único workflow disparado: `codex-validate` (`.github/workflows/codex-validate.yml`).
- Últimas execuções para este SHA:
  - run #190 (id 29951570381) → `status: completed`, `conclusion: success` (2026-07-22T19:35:29Z)
  - run #187 (id 29951569557) → `status: completed`, `conclusion: cancelled` (superseded pelo #190)
- Total de runs listados para a branch: 10 (todos do mesmo workflow codex-validate; não há evidência de outros workflows terem sido disparados por este PR na janela consultada).

**8. Sem merge / deploy / restart**
- `merged=false`, `merge_commit_sha` é apenas o candidato calculado pelo GitHub (`246a86fc…`), não commit efetivado. Nenhuma ação de deploy ou restart foi executada por esta sessão (somente chamadas GET à API).

---

## NÃO PROVADO (falta de acesso a metadado específico nesta sessão)

**6. Arquivos alterados / escopo restrito a `desafios/omega_autolupa/omega_solver.py`**
- As ferramentas GitHub disponíveis nesta sessão não expõem endpoint `/pulls/{n}/files` nem `/compare`. Só o texto do PR e a mensagem do commit `2d4acb9c…` afirmam “Diff limitado a omega_solver.py” e “Testes/contrato/gerador intactos (SHA-256 == MANIFEST)”. **Isso é declaração do autor, não prova independente.** Para confirmar de forma read-only, seria preciso consultar `GET /repos/ServerVpss/CentralDark/pulls/315/files` ou o `compare` entre `4311499c…` e `2d4acb9c…`.

**9. Status verification de outros checks (branch protection, CodeQL, sentinela etc.)**
- A listagem de workflow_runs mostra somente `codex-validate` para o SHA do HEAD. Não é possível afirmar que “não há outros checks obrigatórios exigidos”, apenas que “nenhum outro workflow foi executado neste HEAD dentro do batch retornado (10 runs)”. Um `GET /repos/.../commits/{sha}/check-runs` daria a lista consolidada — não disponível aqui.

---

## DIVERGÊNCIA

Nenhuma divergência entre metadados do PR e as alegações **verificáveis**. Divergências não podem ser afirmadas nem descartadas para o item 6 (arquivos) enquanto a lista real de arquivos alterados não for consultada.

---

## Estado final

- Nenhum arquivo alterado, nenhum commit criado, nenhum push, nenhum merge, nenhum deploy, nenhum restart nesta sessão.
- PR #315 permanece: `open · draft · base main · head test/desafio-omega-autolupa-2026-07-22 @ 2d4acb9c` com 4 labels incluindo `permito-pivete` e `codex-validate = success` no HEAD.

## Plano — Auditoria e correção protegida (labels + workflows)

Escopo: apenas `.github/workflows/{bots-labels-seed.yml,github-bot-controller.yml}`, novo `scripts/github-bot-controller.mjs` e docs em `docs/BOTS/` + `docs/CONSCIENCIA/`. Nada de VPS, nada de secrets, nada de deploy, nada de fechar issue/PR automaticamente. Tudo idempotente e reversível.

---

### 1. `.github/workflows/bots-labels-seed.yml` — separar seed de migração

Reestruturar em **dois jobs sequenciais**, ambos disparáveis por `workflow_dispatch` (com input `dry_run` default `true`):

**Job A — seed canônicos**
- Semear/atualizar apenas os canônicos, em duas famílias claramente separadas:
  - Roteamento (minúsculas, namespaced): `assign:chatgpt`, `assign:codex`, `assign:supabase-bot`, `assign:lovable`, `assign:grok`, `assign:doc-guardiao`, `assign:faxineiro-repo`, `assign:auditor-divergencia`, `assign:guarda-seguranca`, `assign:vps-healthcheck`.
  - Operacionais humanas (emoji + PT-BR maiúsculo): `🟢 PRONTO-PARA-IA`, `🟡 IA-PRECISA-REVISAR`, `🔴 RISCO-SERVIDOR`, `🟡 PRECISA-DE-OK`, `🔴 SEGURANÇA`, `🟢 CORREÇÃO-SEGURA`, `🔴 FALTA-EVIDÊNCIA`.
- **Não** semear aliases (`assign:faxineiro`, `assign:auditor`, `assign:seguranca`, `assign:vps-health`).
- Idempotente: usar `gh label create ... || gh label edit ...`.

**Job B — migração de aliases (needs: A)**
Para cada par `alias -> canonico`:
1. Garantir canônico existente (fail-fast se ausente).
2. Listar todas issues/PRs (abertas **e fechadas**, sem paginar em cima do limite) com o alias: `gh issue list --label <alias> --state all --limit 1000 --json number` + idem `gh pr list`.
3. Para cada item: `gh issue/pr edit <n> --add-label <canonico> --remove-label <alias>`. **Nunca** `--state closed`, nunca `gh issue close`.
4. Contar restantes com o alias. Se `== 0`, `gh label delete <alias> --yes`. Se `> 0`, **abortar deleção** desse alias, logar e seguir os demais.
5. Em `dry_run=true`, apenas listar contagens e ações previstas; nenhuma escrita.

Pares migrados:
```
assign:faxineiro     -> assign:faxineiro-repo
assign:auditor       -> assign:auditor-divergencia
assign:seguranca     -> assign:guarda-seguranca
assign:vps-health    -> assign:vps-healthcheck
```

Trigger: **somente** `workflow_dispatch`. Não adicionar `push`. Justificativa na seção 5.

Permissões mínimas: `issues: write`, `pull-requests: write`, `contents: read`.

---

### 2. `.github/workflows/github-bot-controller.yml` + `scripts/github-bot-controller.mjs`

**Workflow**
- Corrigir caminho: `node scripts/github-bot-controller.mjs` (sem prefixo `CentralDark/`).
- Manter `workflow_dispatch` (com `dry_run`, `merged_pr`, `supersedes`), `pull_request: closed` e `schedule` — mas mudar comportamento por evento (ver script).
- Default `DRY_RUN=true` para `schedule` e `pull_request`; para `workflow_dispatch` respeita o input.
- Sem `SUPABASE_*`, sem secrets além do `GITHUB_TOKEN` já usado.

**Script `scripts/github-bot-controller.mjs`** (novo, ESM, Node 20, `fetch` nativo — mesmo estilo de `scripts/bots/lib/gh.mjs`)
- Modos:
  - `workflow_dispatch` com `BOT_MERGED_PR` e `BOT_SUPERSEDES`: **único** modo autorizado a fechar PRs, e só quando:
    - `merged_pr` está mergeado (`merged_at != null`);
    - cada nº em `supersedes` está aberto;
    - o corpo/título/commits do `merged_pr` referencia explicitamente cada superseded (`#<n>` ou `Supersedes: #<n>`);
    - `DRY_RUN=false` explícito.
    Ação: comentar no superseded citando o merged, aplicar label `superseded`, e só então `state: closed`. Nunca em issues, só PRs listados.
  - `pull_request.closed` e `schedule`: modo **auditoria** — gera relatório em `docs/RELATORIOS/github-bot-controller/<data>.md` com PRs candidatos (ex.: mesma branch base, títulos correlatos, referências cruzadas). **Não** fecha nada. **Não** fecha por idade.
- Comum a todos os modos: validar `BOT_EXPECTED_REPOSITORY` == `GITHUB_REPOSITORY`; abortar se divergir. Rate-limit aware. Log estruturado. Sem force push, sem tocar em `main`.

---

### 3. Documentação e registro de decisão

- `docs/BOTS/README.md`: remover a linha "Compatibilidade: aliases antigos continuam no seed" e substituir por nota curta explicando que aliases foram migrados e removidos, com data.
- `docs/BOTS/TIME-DE-BOTS.md`: refletir apenas canônicos.
- `docs/CONSCIENCIA/GITHUB-LABELS-OPERACIONAIS.md`: adicionar seção "Duas camadas" deixando explícito que labels humanas (emoji/maiúsculas) e labels de roteamento `assign:*` coexistem e não se fundem; documentar que `assign:chatgpt`/`assign:grok` = dono, e que se `area:chatgpt`/`area:grok-cli` forem criadas no futuro, terão semântica separada (área/integrador).
- `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md`: nova entrada datada — "Consolidação de labels: alias→canônico; correção do github-bot-controller; política de não-fechamento automático". Inclui autorização "PERMITO PIVETE" e link para os arquivos alterados.

---

### 4. Validação (sem executar mudanças de estado)

- Lint YAML: `yamllint .github/workflows/*.yml` (ou `actionlint` se disponível).
- Sintaxe JS: `node --check scripts/github-bot-controller.mjs`.
- Dry-run local do controller: `DRY_RUN=true GITHUB_REPOSITORY=ServerVpss/CentralDark node scripts/github-bot-controller.mjs` — deve listar candidatos e sair 0 sem chamadas de escrita.
- Ensaio da migração: rodar `workflow_dispatch` do seed com `dry_run=true` no GitHub, revisar o log (contagens por alias, canônicos alvo), depois rodar com `dry_run=false`.
- Pós-migração: `gh label list | grep -E 'assign:(faxineiro|auditor|seguranca|vps-health)$'` deve retornar vazio; contagem de issues/PRs por canônico deve refletir a soma antiga.

---

### 5. Sobre trigger `push` para rodar migração — descartado

Adicionar `push` faria a migração rodar em cada merge subsequente, aumentando risco de re-migrar labels legítimas caso alguém reintroduza um alias por engano, e dificulta auditoria (execução silenciosa). Como já existe `workflow_dispatch`, a execução manual é o canal correto: o Pivete dispara com `dry_run=true`, revisa, depois `dry_run=false`. Se houver dúvida de que o Action rodou, o próprio log do run é a prova; não precisa de `push`.

---

### 6. Critérios de aceite

1. `bots-labels-seed.yml` não menciona mais aliases no seed; job de migração existe, é `workflow_dispatch`-only, idempotente e nunca fecha issues/PRs.
2. `github-bot-controller.yml` aponta para `scripts/github-bot-controller.mjs`; script existe, roda com `node --check`, default `DRY_RUN=true`, só fecha PR em modo manual com referência explícita.
3. Após execução real do dispatch, zero labels alias restantes, zero issues/PRs com alias, zero issues/PRs fechados pela automação.
4. Docs atualizadas e decisão registrada em `08-HISTORICO-DECISOES.md`.
5. Nenhuma alteração fora dos caminhos listados. Nenhum secret lido. Nenhum deploy. Reversível: aliases podem ser recriados com `gh label create` e labels reaplicadas manualmente se necessário (histórico preservado nos comentários das issues/PRs).

---

### Arquivos a alterar/criar

- editar: `.github/workflows/bots-labels-seed.yml`
- editar: `.github/workflows/github-bot-controller.yml`
- criar:  `scripts/github-bot-controller.mjs`
- editar: `docs/BOTS/README.md`
- editar: `docs/BOTS/TIME-DE-BOTS.md`
- editar: `docs/CONSCIENCIA/GITHUB-LABELS-OPERACIONAIS.md`
- editar: `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md`
- criar (na execução real, não no PR): pasta `docs/RELATORIOS/github-bot-controller/` com `.gitkeep`

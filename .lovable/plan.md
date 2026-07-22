
## Auditoria read-only — checkpoint travas-protecao

Escopo real lido: repo `ServerVpss/CentralDark` via GitHub API (metadados, commits main, blob CODEOWNERS + Doutrina, listagem `.github/workflows`, busca global de código por `protected-paths` / `check-protected-paths` / `PERMITO PIVETE` em `.github`, PRs abertos, tentativa de branch `test/travas-protecao-21-07` e lookup do prefixo `1e1ac1cd8`). Workspace local do sandbox não foi tocado.

### Saída obrigatória

```
VEREDITO: CHECKPOINT_PRECISA_REBASE
MAIN_SHA_ATUAL: 8a5be39459b3a15c595e211aebe201fc19ce6c0a
MAIN_DATA: 2026-07-22T08:33:12Z ("chore(sentinela): snapshot 29904384546")
BASE_DA_IMAGEM_LOCALIZADA: sim — 1e1ac1cd85433eb700655d378fff7f0ec83fd0fe (2026-07-21T11:12:09Z, "chore(notion-sync): relatório + changelog [skip ci]", commit-fonte a6005d048650ce1f99c56f1b8173b0ae9a79f38a)
BRANCH_REMOTA_TESTE: NÃO EXISTE (GitHub 404 em refs/heads/test/travas-protecao-21-07 — inclusive local se houver)
ARQUIVOS_RELEVANTES:
  - .github/CODEOWNERS · blob b45f642f6ca53ffd490f276963cf2ac2ed5ce913 · 2069 bytes · lista fallback @ServerVpss + governança + .claude/.agents/.lovable + .github + infra/caddy + scripts/vps + secrets + 20 áreas 🔒 sob apps/modulos/**
  - docs/GOVERNANCA/DOUTRINA-PROTECAO-ESTRATEGICA.md · blob 856076a132cf7b972fad49785eff730f095c5ea8 · 5593 bytes · doutrina de proteção estratégica selada; referencia CODEOWNERS mas não implementa check automático
  - .github/protected-paths.txt · NÃO EXISTE (404)
  - check-protected-paths(.mjs|.sh|.js|.py) · NÃO EXISTE (busca global retornou 0 hits)
  - workflows em .github/workflows/: 40+ arquivos; nenhum menciona "protected-paths" ou "PERMITO PIVETE" (busca global 0 hits em path:.github). Existe `sentinela-divergencias.yml` e `codex-validate.yml` como gates adjacentes, mas nenhum valida CODEOWNERS-derived path allowlist.
MUDANCAS_RELEVANTES: main avançou de 1e1ac1cd8 (21/07 11:12) até 8a5be3945 (22/07 08:33). Entre elas estão pelo menos o merge #297 (MetaLupa mantém backups fora do mapa canônico, 22/07 01:54, SHA 1cf6ae96350321a6a6fa59e3f346e8ef40cc3a2f) e commits sentinela/notion-sync automáticos. Nenhum toque em .github/CODEOWNERS ou docs/GOVERNANCA/DOUTRINA-PROTECAO-ESTRATEGICA.md desde a base — os dois blobs continuam nos mesmos SHAs citados acima.
DUPLICACAO: nenhum mecanismo atual duplica o plano. CODEOWNERS sinaliza propriedade mas exige branch protection ativa para bloquear merge; Doutrina é textual; admin-guard (apps/modulos/mcp/src/lib/admin-guard.js) protege catálogo MCP em runtime, não caminhos de PR. Não achei script/workflow que consuma allowlist de paths. Portanto criar `.github/protected-paths.txt` + `check-protected-paths.mjs` é NOVO e complementar, não redundante.
RISCO: baixo — só adiciona 2 arquivos read-only; risco real está em (a) rebasear em cima de main que avançou 214 commits desde pivete/dev (não aparente aqui, mas histórico recente inclui MetaLupa 296/297); (b) coerência com CODEOWNERS (glob `/apps/modulos/*/**` etc. precisa ser preservado sem regex quebrado); (c) sem branch protection, o gate só funciona se o workflow for required check.
COMANDO_PRONTO:
  # rebase local do checkpoint no main atual e recriar branch test/ enviando pra remoto
  git fetch origin --prune \
    && git switch -c test/travas-protecao-21-07 origin/main \
    && echo "# Derivado de .github/CODEOWNERS · gerar via script auxiliar antes de commit" \
    && git status
LIMITACOES:
  - Auditoria via GitHub REST/Search API do repo remoto; não inspecionei o clone local do Pivete nem estado da VPS.
  - `github_search_code` pode não indexar arquivos muito recentes (<1min) ou fora dos idiomas suportados; contornado com listagem direta de .github/workflows/ e leitura dos blobs alvo.
  - Não consegui enumerar TODAS as branches remotas (API não expõe list_branches nesta camada); confirmação de "test/travas-protecao-21-07 inexistente" veio do 404 em list_commits?sha=…, que também retornaria 404 se a ref existisse mas fosse inacessível — probabilidade baixa, mas registrada.
  - Não li os 214 commits entre base e HEAD um a um; verifiquei só o histórico recente e diffs de arquivos-alvo (CODEOWNERS e Doutrina inalterados desde 1e1ac1cd8).
```

### Próximo passo

Nenhuma escrita autorizada nesta rodada. Ao voltar para build mode, aplicar `COMANDO_PRONTO` localmente e só depois gerar `.github/protected-paths.txt` a partir do CODEOWNERS + `scripts/ci/check-protected-paths.mjs`.

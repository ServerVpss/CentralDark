PR: feat/coderabbit-bridge — Links e contexto

Branch: feat/coderabbit-bridge
Pushed: origin/feat/coderabbit-bridge

PR relacionados (citar manualmente ao criar PR):
- #1381 — PR de revisão divergência (mencionar e verificar pontos conflituosos)
- #1393 — PR reorganização (referenciar para integrar deltas)
- dependabot PRs relevantes — revisar automaticamente por regra de dependabot

Resumo das evidências incluídas neste branch:
- scripts/coderabbit-bridge.mjs (bridge service)
- files/coderabbit-integration-README.md
- files/coderabbit-config-snippet.yaml
- files/github-meta-20260904.json
- files/add-webhook-cronjob-PR.md
- files/github-webhook-cron.sh

Ações sugeridas após PR aberto:
1. Editar PR body para incluir links para PRs #1381, #1393 e listar receipts em files/.
2. Marcar reviewers: @owner-da-area, @ops
3. Fazer CI em runner Linux para validar (especialmente testes Meta-Lupa)
4. Após aprovação, merge por squash em main.

Notas operacionais:
- Tentativa automática de criar PR via API falhou (422). Branch foi criado e push feito; abrir PR manual via:
  https://github.com/ServerVpss/CentralDark/pull/new/feat/coderabbit-bridge

Evidência: todos os arquivos e registros estão em files/ e commits no branch.
\nPR_CREATED: https://github.com/ServerVpss/CentralDark/pull/1406

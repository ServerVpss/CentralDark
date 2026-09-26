# MISSAO - vigia-actions-vermelhos.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\.github\workflows\vigia-actions-vermelhos.yml
**SHA:** ac7a46eb487e273f
**Timestamp:** 2026-08-26T19:30:49.923874
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- workflow_run:
- # - workflow_run: só se o run que disparou FALHOU e não é o próprio vigia
- run: npm ci --prefix scripts/vigia --no-audit --no-fund
- run: |
- run: node scripts/vigia/actions-vermelhos.mjs

### Ouro Bruto (primeiros 5000 chars)
```
# Vigia de Actions Vermelhos — bot 24/7
# Dispara automaticamente quando QUALQUER workflow termina com FALHA,
# e também varre a cada 6h pra pegar qualquer vermelho que tenha
# escapado (ex: workflow_run não dispara em PRs de forks).
#
# Comportamento:
# - 1 Issue por workflow (dedupe pela label `red-action:<slug>`).
# - Comentário novo a cada nova falha (run_id, autor, commit, erro).
# - Fecha automaticamente quando o mesmo workflow voltar a passar.
# - Adiciona label `assign:codex` (e `assign:lovable` se for build/painel)
#   pro Dispatcher chamar o bot certo.
#
# Permissões mínimas: issues:write + actions:read + contents:read.

name: vigia-actions-vermelhos

on:
  workflow_run:
    workflows: ["*"]
    types: [completed]
  schedule:
    - cron: "7 */6 * * *"   # varredura a cada 6h (reduz ruído)
  workflow_dispatch: {}

permissions:
  issues: write
  actions: read
  contents: read

concurrency:
  group: vigia-actions-vermelhos
  cancel-in-progress: false

jobs:
  vigia:
    # Só roda quando faz sentido:
    # - schedule / workflow_dispatch: sempre
    # - workflow_run: só se o run que disparou FALHOU e não é o próprio vigia
    #   (corta ~80% das execuções, que eram disparadas por workflows verdes)
    if: >-
      ${{ github.event_name != 'workflow_run' ||
          (github.event.workflow_run.name != 'vigia-actions-vermelhos' &&
           github.event.workflow_run.conclusion == 'failure') }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Instalar dependências do vigia (isolado, lock determinístico)
        # fail-fast: se o lockfile quebrar, o vigia falha cedo e abre Issue sozinho
        # em vez de mascarar com `npm install` (que gerava ERR_UNSUPPORTED_ESM_URL_SCHEME)
        run: npm ci --prefix scripts/vigia --no-audit --no-fund

      - name: Validar import do Octokit (pré-check ESM)
        # Garante que @octokit/rest resolveu de node_modules local e não de URL https.
        # Se falhar aqui, o erro fica óbvio em vez de explodir no meio do vigia.
        working-directory: scripts/vigia
        run: |
          node --input-type=module -e "
          import('@octokit/rest')
            .then(m => {
              if (typeof m.Octokit !== 'function') {
                console.error('Octokit não exporta classe esperada');
                process.exit(1);
              }
              console.log('✓ Octokit OK (resolvido de node_modules local)');
            })
            .catch(e => {
              console.error('✗ Falha no import do Octokit:', e.code || e.message);
              process.exit(1);
            });
          "

      - name: Rodar vigia
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPOSITORY: ${{ github.repository }}
          EVENT_NAME: ${{ github.event_name }}
          TRIGGER_RUN_ID: ${{ github.event.workflow_run.id }}
          TRIGGER_WORKFLOW_NAME: ${{ github.event.workflow_run.name }}
          TRIGGER_CONCLUSION: ${{ github.event.workflow_run.conclusion }}
        run: node scripts/vigia/actions-vermelhos.mjs

```
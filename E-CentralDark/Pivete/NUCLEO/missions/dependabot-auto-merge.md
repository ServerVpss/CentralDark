# MISSAO - dependabot-auto-merge.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\dependabot-auto-merge.yml
**SHA:** ffc5a230158c7e26
**Timestamp:** 2026-08-26T19:33:13.518418
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
# Auto-merge dos PRs do Dependabot — só patches (semver-patch).
# Minor fica aberto pra revisão humana. Major nem chega (bloqueado no dependabot.yml).
name: Dependabot Auto-Merge (só patches)

on:
  pull_request:
    types: [opened, reopened, synchronize, ready_for_review]

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-merge-patch:
    runs-on: ubuntu-latest
    steps:
      - name: Sair limpo se não for Dependabot
        if: github.actor != 'dependabot[bot]' || github.repository != 'ServerVpss/CentralDark'
        run: |
          echo "::notice::Disparo fora do escopo (autor=${{ github.actor }}). Saindo sem erro."
          echo "SKIP=1" >> "$GITHUB_ENV"

      - name: Coletar metadados do PR do Dependabot
        if: env.SKIP != '1'
        id: meta
        uses: dependabot/fetch-metadata@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Aprovar PR (sempre que for Dependabot)
        if: env.SKIP != '1'
        run: |
          gh pr review --approve "$PR_URL" \
            --body "Aprovação automática — atualização do Dependabot dentro da política (sem majors)."
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Habilitar auto-merge somente para PATCH
        if: env.SKIP != '1' && steps.meta.outputs.update-type == 'version-update:semver-patch'
        run: |
          gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Comentar quando for MINOR (fica pra revisão humana)
        if: env.SKIP != '1' && steps.meta.outputs.update-type == 'version-update:semver-minor'
        run: |
          gh pr comment "$PR_URL" \
            --body "🟡 Atualização **minor** detectada — aprovei, mas o merge fica pra revisão humana (política: auto-merge só pra patch)."
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

```

---

# MISSAO - dependabot-auto-merge.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\dependabot-auto-merge.yml
**SHA:** 89d87981def1398c
**Timestamp:** 2026-08-28T02:56:03.188466
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
# Auto-merge dos PRs do Dependabot — só patches (semver-patch).
# Minor fica aberto pra revisão humana. Major nem chega (bloqueado no dependabot.yml).
name: Dependabot Auto-Merge (só patches)

on:
  pull_request:
    types: [opened, reopened, synchronize, ready_for_review]

permissions:
  contents: write
  pull-requests: write

concurrency:
  group: dependabot-auto-merge-${{ github.event.pull_request.number }}
  cancel-in-progress: false

jobs:
  auto-merge-patch:
    runs-on: [self-hosted, Linux]
    steps:
      - name: Sair limpo se não for Dependabot
        if: github.actor != 'dependabot[bot]' || github.repository != 'ServerVpss/CentralDark'
        run: |
          echo "::notice::Disparo fora do escopo (autor=${{ github.actor }}). Saindo sem erro."
          echo "SKIP=1" >> "$GITHUB_ENV"

      - name: Coletar metadados do PR do Dependabot
        if: env.SKIP != '1'
        id: meta
        uses: dependabot/fetch-metadata@v3
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Aprovar PR (sempre que for Dependabot)
        if: env.SKIP != '1'
        uses: actions/github-script@v9
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            await github.rest.pulls.createReview({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.payload.pull_request.number,
              event: 'APPROVE',
              body: 'Aprovação automática — atualização do Dependabot dentro da política (sem majors).',
            });

      - name: Habilitar auto-merge somente para PATCH
        if: env.SKIP != '1' && steps.meta.outputs.update-type == 'version-update:semver-patch'
        uses: actions/github-script@v9
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            await github.graphql(`
              mutation($pullRequestId: ID!) {
                enablePullRequestAutoMerge(input: {pullRequestId: $pullRequestId, mergeMethod: SQUASH}) {
                  pullRequest { number autoMergeRequest { enabledAt mergeMethod } }
                }
              }
            `, {
              pullRequestId: context.payload.pull_request.node_id,
            });

      - name: Comentar quando for MINOR (fica pra revisão humana)
        if: env.SKIP != '1' && steps.meta.outputs.update-type == 'version-update:semver-minor'
        uses: actions/github-script@v9
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.pull_request.number,
              body: '🟡 Atualização **minor** detectada — aprovei, mas o merge fica pra revisão humana (política: auto-merge só pra patch).',
            });

```
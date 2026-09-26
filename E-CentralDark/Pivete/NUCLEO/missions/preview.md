# MISSAO - preview.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\source\.github\workflows\preview.yaml
**SHA:** 5347c935f4592e18
**Timestamp:** 2026-08-28T02:56:10.303034
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: pnpm run build
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches: [main]

# Cancel in-progress runs on the same PR
concurrency:
  group: preview-${{ github.event.pull_request.number }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write
  deployments: write

jobs:
  deploy-preview:
    name: Deploy Preview
    runs-on: ubuntu-latest
    if: github.event.action != 'closed'

    steps:
      - name: Check if preview deployment is configured
        id: check-secrets
        run: |
          if [[ -n "${{ secrets.CLOUDFLARE_API_TOKEN }}" && -n "${{ secrets.CLOUDFLARE_ACCOUNT_ID }}" ]]; then
            echo "configured=true" >> $GITHUB_OUTPUT
          else
            echo "configured=false" >> $GITHUB_OUTPUT
          fi

      - name: Checkout
        if: steps.check-secrets.outputs.configured == 'true'
        uses: actions/checkout@v7

      - name: Setup and Build
        if: steps.check-secrets.outputs.configured == 'true'
        uses: ./.github/actions/setup-and-build

      - name: Build for production
        if: steps.check-secrets.outputs.configured == 'true'
        run: pnpm run build
        env:
          NODE_ENV: production

      - name: Deploy to Cloudflare Pages
        if: steps.check-secrets.outputs.configured == 'true'
        id: deploy
        uses: cloudflare/wrangler-action@v4
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy build/client --project-name=bolt-diy-preview
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}

      - name: Preview deployment not configured
        if: steps.check-secrets.outputs.configured == 'false'
        run: |
          echo "✅ Preview deployment is not configured for this repository"
          echo "To enable preview deployments, add the following secrets:"
          echo "- CLOUDFLARE_API_TOKEN"
          echo "- CLOUDFLARE_ACCOUNT_ID"
          echo "This is optional and the workflow will pass without it."
          echo "url=https://preview-not-configured.example.com" >> $GITHUB_OUTPUT

      - name: Add preview URL comment to PR
        uses: actions/github-script@v9
        continue-on-error: true
        with:
          script: |
            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });

            const previewComment = comments.find(comment =>
              comment.body.includes('🚀 Preview deployment')
            );

            const isConfigured = '${{ steps.check-secrets.outputs.configured }}' === 'true';
            const deployUrl = '${{ steps.deploy.outputs.deployment-url }}' || 'https://preview-not-configured.example.com';

            let commentBody;
            if (isConfigured) {
              commentBody = `🚀 Preview deployment is ready!

              | Name | Link |
              |------|------|
              | Latest commit | ${{ github.sha }} |
              | Preview URL | ${deployUrl} |

              Built with ❤️ by [bolt.diy](https://bolt.diy)
              `;
            } else {
              commentBody = `ℹ️ Preview deployment not configured

              | Name | Info |
              |------|------|
              | Latest commit | ${{ github.sha }} |
              | Status | Preview deployment requires Cloudflare secrets |

              To enable preview deployments, repository maintainers can add:
              - \`CLOUDFLARE_API_TOKEN\` secret
              - \`CLOUDFLARE_ACCOUNT_ID\` secret

              Built with ❤️ by [bolt.diy](https://bolt.diy)
              `;
            }

            if (previewComment) {
              github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: previewComment.id,
                body: commentBody
              });
            } else {
              github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: commentBody
              });
            }

      - name: Run smoke tests on preview
        run: |
          if [[ "${{ steps.check-secrets.outputs.configured }}" == "true" ]]; then
            echo "Running smoke tests on preview deployment..."
            echo "Preview URL: ${{ steps.deploy.outputs.deployment-url }}"
            # Basic HTTP check instead of Playwright tests
            curl -f ${{ steps.deploy.outputs.deployment-url }} || echo "Preview environment check completed"
          else
            echo "✅ Smoke tests skipped - preview deployment not configured"
            echo "This is normal and expected when Cloudflare secrets are not available"
          fi

      - name: Preview wo
```
# MISSAO - bump-skill-version.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\marketplace-cache\94f2c10e177b3171\.github\workflows\bump-skill-version.yml
**SHA:** 49701f0d7c2a8fd1
**Timestamp:** 2026-08-28T02:53:46.274524
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dry_run: true
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Bump Skill Version

on:
  push:
    branches:
      - master
    paths:
      - 'skills/**'
      - '.claude-plugin/**'

concurrency:
  group: bump-skill-version
  cancel-in-progress: true

jobs:
  bump-version:
    name: Bump plugin.json version
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Determine new version
        id: tag
        uses: mathieudutour/github-tag-action@v6.2
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          dry_run: true
          tag_prefix: "skill-v"

      - name: Update plugin.json version
        if: steps.tag.outputs.new_version != ''
        run: |
          NEW_VERSION="${{ steps.tag.outputs.new_version }}"
          echo "Bumping to $NEW_VERSION"
          jq --arg v "$NEW_VERSION" '.version = $v' .claude-plugin/plugin.json > tmp.json
          mv tmp.json .claude-plugin/plugin.json

      - name: Commit and push
        if: steps.tag.outputs.new_version != ''
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add .claude-plugin/plugin.json
          git diff --cached --quiet || git commit -m "chore: bump skill version to ${{ steps.tag.outputs.new_version }} [skip ci]"
          git fetch origin master
          git rebase origin/master
          git push

      - name: Tag and create release
        if: steps.tag.outputs.new_version != ''
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          git tag "skill-v${{ steps.tag.outputs.new_version }}"
          git push origin "skill-v${{ steps.tag.outputs.new_version }}"
          gh release create "skill-v${{ steps.tag.outputs.new_version }}" \
            --title "Skill v${{ steps.tag.outputs.new_version }}" \
            --generate-notes \
            --notes-start-tag "$(git tag --sort=-v:refname | grep '^skill-v' | sed -n '2p')"

```
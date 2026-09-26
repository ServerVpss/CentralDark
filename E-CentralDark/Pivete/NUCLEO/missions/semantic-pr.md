# MISSAO - semantic-pr.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\source\.github\workflows\semantic-pr.yaml
**SHA:** f3c7a8131d593f34
**Timestamp:** 2026-08-28T02:56:10.382814
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- subjectPattern: ^(?![A-Z]).+$

### Ouro Bruto (primeiros 5000 chars)
```
name: Semantic Pull Request
on:
  pull_request_target:
    types: [opened, reopened, edited, synchronize]
permissions:
  pull-requests: read
jobs:
  main:
    name: Validate PR Title
    runs-on: ubuntu-latest
    steps:
      # https://github.com/amannn/action-semantic-pull-request/releases/tag/v6.1.1
      - uses: amannn/action-semantic-pull-request@48f256284bd46cdaab1048c3721360e808335d50 # v6.1.1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          subjectPattern: ^(?![A-Z]).+$
          subjectPatternError: |
            The subject "{subject}" found in the pull request title "{title}"
            didn't match the configured pattern. Please ensure that the subject
            doesn't start with an uppercase character.
          types: |
            fix
            feat
            chore
            build
            ci
            perf
            docs
            refactor
            revert
            test

```
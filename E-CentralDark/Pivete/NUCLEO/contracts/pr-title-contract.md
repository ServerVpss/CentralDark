# CONTRATO - pr-title-contract.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\pr-title-contract.yml
**SHA:** 54f9d791dd282c5b
**Timestamp:** 2026-08-28T02:56:03.767361
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: PR Title Contract

on:
  pull_request:
    types: [opened, edited, reopened, synchronize]

permissions:
  contents: read

jobs:
  validate-title:
    runs-on: [self-hosted, Linux]
    timeout-minutes: 3
    steps:
      - name: Validate emoji prefix and uppercase title
        env:
          PR_TITLE: ${{ github.event.pull_request.title }}
        run: |
          node <<'NODE'
          const title = process.env.PR_TITLE ?? '';
          const trimmed = title.trim();

          if (!trimmed) {
            console.error('PR title is empty.');
            process.exit(1);
          }

          const first = Array.from(trimmed)[0] ?? '';
          if (!/\p{Extended_Pictographic}/u.test(first)) {
            console.error('PR title must start with an emoji that represents the situation.');
            process.exit(1);
          }

          const rest = trimmed.slice(first.length).trim();
          if (!rest) {
            console.error('PR title must contain text after the emoji.');
            process.exit(1);
          }

          const letters = rest.match(/\p{L}/gu) ?? [];
          if (letters.length === 0) {
            console.error('PR title must contain alphabetic text.');
            process.exit(1);
          }

          if (rest !== rest.toLocaleUpperCase('pt-BR')) {
            console.error('PR title text must be uppercase.');
            process.exit(1);
          }

          console.log('PASS: emoji prefix + uppercase PR title.');
          NODE

```
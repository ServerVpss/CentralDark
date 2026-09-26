# MISSAO - bot-server-validate.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\bot-server-validate.yml
**SHA:** 5ae89f0c23ed4159
**Timestamp:** 2026-08-26T19:33:13.185314
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run:
- run: |
- run: |
- run: npm run validate:route:chats
- run: npm run validate:route:contacts
- run: npm run validate:route:contact-avatar
- run: npm run validate:route:groups
- run: npm run validate:route:group-participants
- run: npm run validate:route:group-details
- run: npm run validate:route:message-history

### Ouro Bruto (primeiros 5000 chars)
```
name: bot-server validate (Lotes 2–10)

# Em todo PR que toca CentralDark/apps/bot-server/, roda os 8 validadores
# offline criados nos Lotes 2 a 10. Sem rede, sem secrets, sem WuzAPI real.

on:
  pull_request:
    branches: [main]
    paths:
      - "CentralDark/apps/bot-server/**"
      - ".github/workflows/bot-server-validate.yml"
  push:
    branches: [main]
    paths:
      - "CentralDark/apps/bot-server/**"
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: bot-server-validate-${{ github.ref }}
  cancel-in-progress: true

jobs:
  validate:
    name: Validar Lotes 2–10 offline
    runs-on: ubuntu-latest
    if: github.repository == 'ServerVpss/CentralDark'
    timeout-minutes: 5
    defaults:
      run:
        working-directory: CentralDark/apps/bot-server

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node 20
        uses: actions/setup-node@v6
        with:
          node-version: "20"

      - name: Install deps (se existir lockfile)
        run: |
          if [ -f package-lock.json ]; then
            npm ci --no-audit --no-fund || npm install --no-audit --no-fund
          else
            npm install --no-audit --no-fund
          fi

      - name: Lote 2/3 — adaptador + getCentralDarkChats
        run: |
          npm run validate:whatsapp
          npm run validate:chats

      - name: Lote 4 — rota /v1/whatsapp/chats
        run: npm run validate:route:chats

      - name: Lote 5 — rota /v1/whatsapp/contacts
        run: npm run validate:route:contacts

      - name: Lote 6 — rota /v1/whatsapp/contacts/:phone/avatar
        run: npm run validate:route:contact-avatar

      - name: Lote 7 — rota /v1/whatsapp/groups
        run: npm run validate:route:groups

      - name: Lote 8 — rota /v1/whatsapp/groups/:groupJid/participants
        run: npm run validate:route:group-participants

      - name: Lote 9 — rota /v1/whatsapp/groups/:groupJid
        run: npm run validate:route:group-details

      - name: Lote 10 — rota /v1/whatsapp/messages/:chatId/history
        run: npm run validate:route:message-history

      - name: Resumo
        if: always()
        run: |
          {
            echo "## bot-server validate — resumo"
            echo ""
            echo "Validadores executados: 9 (Lotes 2/3 + Lotes 4–10)."
            echo "Sem rede, sem secrets, sem WuzAPI real."
          } >> "$GITHUB_STEP_SUMMARY"

```

---

# MISSAO - bot-server-validate.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\bot-server-validate.yml
**SHA:** bed99594a676908a
**Timestamp:** 2026-08-28T02:56:03.107145
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run:
- run: |
- run: |
- run: npm run validate:route:chats
- run: npm run validate:route:contacts
- run: npm run validate:route:contact-avatar
- run: npm run validate:route:groups
- run: npm run validate:route:group-participants
- run: npm run validate:route:group-details
- run: npm run validate:route:message-history

### Ouro Bruto (primeiros 5000 chars)
```
name: bot-server validate (Lotes 2–10)

# Em todo PR que toca CentralDark/apps/bot-server/, roda os 8 validadores
# offline criados nos Lotes 2 a 10. Sem rede, sem secrets, sem WuzAPI real.

on:
  pull_request:
    branches: [main]
    paths:
      - "CentralDark/apps/bot-server/**"
      - ".github/workflows/bot-server-validate.yml"
  push:
    branches: [main]
    paths:
      - "CentralDark/apps/bot-server/**"
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: bot-server-validate-${{ github.ref }}
  cancel-in-progress: true

jobs:
  validate:
    name: Validar Lotes 2–10 offline
    runs-on: [self-hosted, Linux]
    if: github.repository == 'ServerVpss/CentralDark'
    timeout-minutes: 5
    defaults:
      run:
        working-directory: CentralDark/apps/bot-server

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Setup Node 24
        uses: actions/setup-node@v7
        with:
          node-version: "24"

      - name: Install deps (se existir lockfile)
        run: |
          if [ -f package-lock.json ]; then
            npm ci --no-audit --no-fund || npm install --no-audit --no-fund
          else
            npm install --no-audit --no-fund
          fi

      - name: Lote 2/3 — adaptador + getCentralDarkChats
        run: |
          npm run validate:whatsapp
          npm run validate:chats

      - name: Lote 4 — rota /v1/whatsapp/chats
        run: npm run validate:route:chats

      - name: Lote 5 — rota /v1/whatsapp/contacts
        run: npm run validate:route:contacts

      - name: Lote 6 — rota /v1/whatsapp/contacts/:phone/avatar
        run: npm run validate:route:contact-avatar

      - name: Lote 7 — rota /v1/whatsapp/groups
        run: npm run validate:route:groups

      - name: Lote 8 — rota /v1/whatsapp/groups/:groupJid/participants
        run: npm run validate:route:group-participants

      - name: Lote 9 — rota /v1/whatsapp/groups/:groupJid
        run: npm run validate:route:group-details

      - name: Lote 10 — rota /v1/whatsapp/messages/:chatId/history
        run: npm run validate:route:message-history

      - name: Resumo
        if: always()
        run: |
          {
            echo "## bot-server validate — resumo"
            echo ""
            echo "Validadores executados: 9 (Lotes 2/3 + Lotes 4–10)."
            echo "Sem rede, sem secrets, sem WuzAPI real."
          } >> "$GITHUB_STEP_SUMMARY"

```
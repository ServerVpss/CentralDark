# OUTRO - install-cf-origin-cert.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\install-cf-origin-cert.yml
**SHA:** e16bdc94ca5b4394
**Timestamp:** 2026-08-28T02:56:03.428083
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: bash infra/scripts/setup-cf-origin-cert.sh
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Instalar Cloudflare Origin Certificate

on:
  workflow_dispatch:
    inputs:
      confirm:
        description: "Digite CONFIRMO para instalar o cert"
        required: true

jobs:
  install-cert:
    name: Instalar Origin CA no Caddy
    runs-on: [self-hosted, Linux]
    if: github.event.inputs.confirm == 'CONFIRMO'
    steps:
      - uses: actions/checkout@v7

      - name: Instalar certificado e recarregar Caddy
        env:
          CF_ORIGIN_CERT: ${{ secrets.CF_ORIGIN_CERT }}
          CF_ORIGIN_KEY: ${{ secrets.CF_ORIGIN_KEY }}
        run: bash infra/scripts/setup-cf-origin-cert.sh

      - name: Notificar Telegram
        if: always()
        env:
          TOKEN: ${{ secrets.SRVER1_BOT_TOKEN }}
          CHAT: ${{ secrets.TELEGRAM_CHANNEL_ID }}
          STATUS: ${{ job.status }}
        run: |
          MSG="🔐 Origin CA install: $STATUS"
          curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
            -d "chat_id=${CHAT}&text=${MSG}" > /dev/null || true

```
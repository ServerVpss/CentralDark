# OUTRO - auto-cf-origin-cert.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\auto-cf-origin-cert.yml
**SHA:** a52ebe607848628a
**Timestamp:** 2026-08-28T02:56:03.120198
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: bash infra/scripts/auto-cf-origin-cert.sh
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Auto Origin Certificate — Cloudflare SSL Fix

on:
  workflow_dispatch:
    inputs:
      confirm:
        description: "Digite CONFIRMO para gerar e instalar o cert"
        required: true

jobs:
  gerar-cert:
    name: Gerar Origin CA + Recarregar Caddy
    runs-on: [self-hosted, Linux]
    if: github.event.inputs.confirm == 'CONFIRMO'

    steps:
      - uses: actions/checkout@v7

      - name: Verificar dependências
        run: |
          which openssl || (apt-get install -y openssl && echo "openssl instalado")
          which jq     || (apt-get install -y jq     && echo "jq instalado")
          which curl   || (apt-get install -y curl   && echo "curl instalado")

      - name: Gerar cert e instalar no Caddy
        env:
          CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
        run: bash infra/scripts/auto-cf-origin-cert.sh

      - name: Notificar Telegram — sucesso
        if: success()
        env:
          TOKEN: ${{ secrets.SRVER1_BOT_TOKEN }}
          CHAT: ${{ secrets.TELEGRAM_CHANNEL_ID }}
        run: |
          curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
            -d "chat_id=${CHAT}&parse_mode=HTML&text=🔐 <b>Origin CA instalado</b>%0A✅ SSL centralldark.com corrigido — todos os subdomínios ativos" \
            > /dev/null || true

      - name: Notificar Telegram — falha
        if: failure()
        env:
          TOKEN: ${{ secrets.SRVER1_BOT_TOKEN }}
          CHAT: ${{ secrets.TELEGRAM_CHANNEL_ID }}
        run: |
          curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
            -d "chat_id=${CHAT}&text=❌ Origin CA: falha na instalação — verificar logs do workflow" \
            > /dev/null || true

```
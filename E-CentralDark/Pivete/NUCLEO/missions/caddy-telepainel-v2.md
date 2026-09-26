# MISSAO - caddy-telepainel-v2.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\caddy-telepainel-v2.yml
**SHA:** d561175cde1e83c8
**Timestamp:** 2026-08-28T02:56:03.121200
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run:
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: caddy-telepainel-v2
on:
  workflow_dispatch:
permissions:
  contents: read
jobs:
  run:
    runs-on: [self-hosted, Linux]
    steps:
      - name: setup
        run: |
          set -e
          CF=/etc/caddy/Caddyfile
          [ -f "$CF" ] || { echo "no caddyfile"; exit 1; }
          cp "$CF" "$CF.bak.$(date +%s)"
          if ! grep -q "telepainel.centralldark.com" "$CF"; then
            {
              echo ''
              echo 'telepainel.centralldark.com {'
              echo '    encode gzip'
              echo '    reverse_proxy https://telegram-zen-panel-6518f4e2-5d802052.lovable.app {'
              echo '        header_up Host telegram-zen-panel-6518f4e2-5d802052.lovable.app'
              echo '        transport http {'
              echo '            tls'
              echo '            tls_server_name telegram-zen-panel-6518f4e2-5d802052.lovable.app'
              echo '        }'
              echo '    }'
              echo '}'
            } >> "$CF"
          fi
          caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
          systemctl reload caddy
          sleep 8
          curl -sI -L --max-time 25 https://telepainel.centralldark.com/ | head -20
          echo "---"
          curl -s -L --max-time 25 https://telepainel.centralldark.com/ | head -c 400

```
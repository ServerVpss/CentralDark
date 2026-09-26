# MISSAO - run-once-instalar-grok-safe.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\.github\workflows\run-once-instalar-grok-safe.yml
**SHA:** dd9e847a65e3d54d
**Timestamp:** 2026-08-26T19:30:49.531368
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: run-once-instalar-grok-safe.yml manual

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  manual_only:
    name: Manual only
    runs-on: ubuntu-latest
    steps:
      - name: Workflow desativado no push
        shell: bash
        run: |
          echo "Workflow tornado manual-only."
          echo "Arquivo: run-once-instalar-grok-safe.yml"
          echo "Motivo: limpeza dos workflows vermelhos e pausa de automações antigas."
          echo "Este workflow não roda mais em push."

```

---

# MISSAO - run-once-instalar-grok-safe.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\run-once-instalar-grok-safe.yml
**SHA:** bf2d743aea73faca
**Timestamp:** 2026-08-26T19:31:27.074225
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: "RUN ONCE instalar grok-safe"
run-name: "RUN ONCE instalar grok-safe"

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  instalar:
    name: "Instalar grok-safe na VPS"
    runs-on: ubuntu-latest
    steps:
      - name: "Preparar chave SSH"
        env:
          VPS_KEY: ${{ secrets.VPS_SSH_KEY_LOVABLE }}
          VPS_HOST: ${{ secrets.VPS_HOST_LOVABLE }}
        shell: bash
        run: |
          set -euo pipefail
          if [ -z "${VPS_KEY:-}" ]; then echo "secret SSH ausente"; exit 1; fi
          if [ -z "${VPS_HOST:-}" ]; then echo "host SSH ausente"; exit 1; fi
          python3 - <<'PY'
          import os, re, base64, textwrap
          raw = os.environ["VPS_KEY"]
          s = raw.replace("\\n", "\n")
          if "BEGIN" in s and s.count("\n") > 3:
              key = s.strip() + "\n"
          else:
              m = re.search(r"(-----BEGIN [^-]+-----)(.*?)(-----END [^-]+-----)", s, re.S)
              if m:
                  h, b, f = m.group(1), m.group(2), m.group(3)
                  b = re.sub(r"\s+", "", b)
                  key = h + "\n" + "\n".join(textwrap.wrap(b, 70)) + "\n" + f + "\n"
              else:
                  key = base64.b64decode(re.sub(r"\s+", "", s)).decode("utf-8").strip() + "\n"
          open("/tmp/vps_key", "w").write(key)
          os.chmod("/tmp/vps_key", 0o600)
          PY
          ssh-keygen -y -f /tmp/vps_key >/dev/null
          mkdir -p ~/.ssh
          ssh-keyscan -H "$VPS_HOST" >> ~/.ssh/known_hosts 2>/dev/null || true

      - name: "Executar instalador grok-safe"
        env:
          VPS_HOST: ${{ secrets.VPS_HOST_LOVABLE }}
          VPS_USER: ${{ secrets.VPS_USER_LOVABLE }}
        shell: bash
        run: |
          set -euo pipefail
          USER_REMOTE="${VPS_USER:-root}"
          ssh -i /tmp/vps_key -o StrictHostKeyChecking=no -o ConnectTimeout=15 "$USER_REMOTE@$VPS_HOST" 'bash -s' <<'REMOTE'
          set -euo pipefail
          if [ -d /root/CentralDark/.git ]; then
            cd /root/CentralDark
          elif [ -d /root/Multizap/.git ]; then
            cd /root/Multizap
          elif [ -d /root/clone-deck/.git ]; then
            cd /root/clone-deck
          else
            echo "repo nao encontrado"
            exit 20
          fi
          git pull --rebase --autostash
          chmod +x scripts/run-once/20260607-instalar-grok-safe.sh
          bash scripts/run-once/20260607-instalar-grok-safe.sh
          echo "--- validacao ---"
          test -x /usr/local/bin/grok-safe
          test -x /usr/local/bin/grok-status
          /usr/local/bin/grok-status | head -80
REMOTE

```
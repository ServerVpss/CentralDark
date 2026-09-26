# MISSAO - fase-04-ajustar-actions-e-mcp.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\fase-04-ajustar-actions-e-mcp.yml
**SHA:** a58d7a4d3489e018
**Timestamp:** 2026-08-26T19:31:26.575382
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- if line.startswith("PM2_ALLOWED_RESTART="):
- out.append("PM2_ALLOWED_RESTART=" + ",".join(current))
- out.append("PM2_ALLOWED_RESTART=" + ",".join(wanted))
- grep '^PM2_ALLOWED_RESTART=' "$ENV_FILE" | tee "$OUT/env.sanitizado.txt" | tee -a "$OUT/resumo.txt"
- export PM2_ALLOWED_RESTART="CloneDeck-Supabase-Sync,MultiZap-TelegramBot,MCP-CentralDark"
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: "#FASE 04/05 — Corrigir Actions e MCP allowlist"
run-name: "#FASE 04/05 — Corrigir título Actions + validar MCP allowlist"

on:
  workflow_dispatch:

permissions:
  contents: write
  actions: read

jobs:
  ajustar:
    name: "#FASE 04/05 — Aplicar correção guiada"
    runs-on: ubuntu-latest

    steps:
      - name: "#FASE 01/05 — Baixar repositório"
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: "#FASE 02/05 — Corrigir títulos leigos dos workflows"
        shell: bash
        run: |
          set -euo pipefail
          python3 - <<'PY'
          from pathlib import Path

          def set_header(path_str: str, name: str, run_name: str):
              path = Path(path_str)
              text = path.read_text(encoding="utf-8")
              lines = text.splitlines()
              if not lines or not lines[0].startswith("name:"):
                  raise SystemExit(f"Arquivo sem name na primeira linha: {path}")
              out = [f'name: "{name}"', f'run-name: "{run_name}"']
              i = 1
              if i < len(lines) and lines[i].startswith("run-name:"):
                  i += 1
              while i < len(lines) and lines[i].strip() == "":
                  i += 1
              out.append("")
              out.extend(lines[i:])
              path.write_text("\n".join(out).rstrip() + "\n", encoding="utf-8")

          set_header(
              ".github/workflows/deploy.yml",
              "#FASE 03/05 — Deploy Clone Deck",
              "#FASE 03/05 — Deploy VPS — ${{ github.event_name }} — run-once ${{ github.event.inputs.FORCE_RUN_ONCE || 'auto' }}"
          )
          set_header(
              ".github/workflows/deploy-fallback.yml",
              "#FASE 04/05 — Deploy fallback seguro",
              "#FASE 04/05 — Fallback seguro — ${{ github.event.workflow_run.conclusion || github.event_name }}"
          )
          PY

          if git diff --quiet -- .github/workflows/deploy.yml .github/workflows/deploy-fallback.yml; then
            echo "Sem alteração: títulos já estavam no padrão #FASE."
          else
            git config user.name "SegredoiDev"
            git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
            git add .github/workflows/deploy.yml .github/workflows/deploy-fallback.yml
            git commit -m "#FASE 02/05: padronizar títulos leigos dos workflows" -m "Co-authored-by: SegredoiDev <<conta-bot>>"
            git push
          fi

      - name: "#FASE 03/05 — Reconstruir chave SSH da VPS"
        env:
          VPS_SSH_KEY_LOVABLE: ${{ secrets.VPS_SSH_KEY_LOVABLE }}
          VPS_HOST_LOVABLE: ${{ secrets.VPS_HOST_LOVABLE }}
        shell: bash
        run: |
          set -euo pipefail
          if [ -z "${VPS_SSH_KEY_LOVABLE:-}" ]; then
            echo "::error::secret VPS_SSH_KEY_LOVABLE vazio"
            exit 1
          fi
          python3 - <<'PY'
          import os, re, base64, textwrap
          raw = os.environ["VPS_SSH_KEY_LOVABLE"]
          s = raw.replace("\\n", "\n")
          if "BEGIN" in s and s.count("\n") > 3:
              key = s.strip() + "\n"
          else:
              m = re.search(r"(-----BEGIN [^-]+-----)(.*?)(-----END [^-]+-----)", s, re.S)
              if m:
                  header, body, footer = m.group(1), m.group(2), m.group(3)
                  body = re.sub(r"\s+", "", body)
                  wrapped = "\n".join(textwrap.wrap(body, 70))
                  key = f"{header}\n{wrapped}\n{footer}\n"
              else:
                  b64 = re.sub(r"\s+", "", s)
                  key = base64.b64decode(b64).decode("utf-8").strip() + "\n"
          with open("/tmp/vps_key", "w") as f:
              f.write(key)
          os.chmod("/tmp/vps_key", 0o600)
          print(f"chave reconstruida: {len(key)} bytes, {key.count(chr(10))} linhas")
          PY
          ssh-keygen -y -f /tmp/vps_key >/dev/null
          mkdir -p ~/.ssh
          if [ -n "${VPS_HOST_LOVABLE:-}" ]; then
            ssh-keyscan -H "$VPS_HOST_LOVABLE" >> ~/.ssh/known_hosts 2>/dev/null || true
          fi

      - name: "#FASE 04/05 — Aplicar allowlist MCP na VPS"
        env:
          VPS_USER_LOVABLE: ${{ secrets.VPS_USER_LOVABLE }}
          VPS_HOST_LOVABLE: ${{ secrets.VPS_HOST_LOVABLE }}
        shell: bash
        run: |
          set -euo pipefail
          VPS_USER="${VPS_USER_LOVABLE:-root}"
          VPS_HOST="${VPS_HOST_LOVABLE:?VPS_HOST_LOVABLE vazio}"
          ssh -i /tmp/vps_key -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR "$VPS_USER@$VPS_HOST" 'bash -s' <<'REMOTE'
          set -euo pipefail
          TS="$(date +%Y%m%d-%H%M%S)"
          OUT="/root/Multizap/revisoes/$TS/fase-04-mcp-allowlist"
          mkdir -p "$OUT"
          chmod 700 "$OUT" 2>/dev/null || true
          {
            echo "#FASE 04/05 — Aplicar allowlist MCP"
            echo "Relatorio: $OUT"
            echo "Obje
```

---

# MISSAO - fase-04-ajustar-actions-e-mcp.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\fase-04-ajustar-actions-e-mcp.yml
**SHA:** 54be2bd77c8b50bf
**Timestamp:** 2026-08-26T19:33:13.205362
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: fase-04-ajustar-actions-e-mcp.yml manual

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
          echo "Arquivo: fase-04-ajustar-actions-e-mcp.yml"
          echo "Motivo: limpeza dos workflows vermelhos e pausa de automações antigas."
          echo "Este workflow não roda mais em push."

```
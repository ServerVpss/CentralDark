# Session 2026-09-02 — Voice TTS, Dependabot, Bolt Desktop Status

## Contexto
Sessão de diagnóstico operacional: voz TTS em inglês, status Dependabot, app Bolt desktop, portas, cron jobs.

---

## 1. Voice TTS — Português (pt-BR)

### Configuração atual (`config.yaml`)
```yaml
tts:
  provider: openai
  openai:
    voice: ash   # apenas inglês
```

### Providers com suporte pt-BR
| Provider | Configuração | Voices pt-BR |
|----------|--------------|--------------|
| **edge** (grátis, sem chave) | `tts.provider: edge` + `tts.edge.voice: pt-BR-FranciscaNeural` | FranciscaNeural, AntonioNeural, ThalitaNeural, LeticiaNeural |
| **elevenlabs** | `tts.provider: elevenlabs` + `ELEVENLABS_API_KEY` | Várias |
| **piper** (local) | `tts.provider: piper` + modelo local | Modelos pt |
| **gemini** | `tts.provider: gemini` + `GEMINI_API_KEY` | Sim |
| **minimax** | `tts.provider: minimax` + `MINIMAX_API_KEY` | Verificar |

### Exemplo Edge TTS (recomendado — grátis)
```yaml
tts:
  provider: edge
  edge:
    voice: pt-BR-FranciscaNeural
```

---

## 2. Dependabot — Status Atual (ServerVpss/CentralDark)

### Alertas ABERTOS (2)
| # | Pacote | Severidade | CVE | Arquivo |
|---|--------|------------|-----|---------|
| 489 | `jsondiffpatch` (npm, transitive) | HIGH | CVE-2026-8657 | `apps/modulos/Bolt/source/pnpm-lock.yaml` |
| 488 | `react-router-dom` (npm, transitive) | MEDIUM | CVE-2026-53668 | `apps/modulos/Bolt/source/pnpm-lock.yaml` |

### Alertas CORRIGIDOS (resumo)
- esbuild, vite, jinja2, urllib3, requests → corrigidos em ago/2026
- Maioria em `apps/modulos/Bolt/source/docs/poetry.lock` (Python)

### PRs Dependabot abertos: **ZERO**
- `gh pr list --label dependabot` → vazio
- PRs abertos: #1393 (SOUL), #1381 (Fixed Point) — não são Dependabot

### Cron Job `dependabot-monitor` (ID: 7cb6bc563171)
- Schedule: `* * * * *` (todo minuto)
- Status: **ERROR** — `RuntimeError: Skipped to prevent unintended spend: global inference config drifted`
- Fix: `cronjob action=update job_id=7cb6bc563171 provider=nous model=nous/tencent/hy3:free`

---

## 3. Bolt Desktop App (Electron/Chromium)

### Estado real
- **NÃO EXISTE `.exe` instalável no PC**
- **NENHUM release no GitHub Releases** (apenas Obsidian Plugin v0.5.0, v0.4.0)
- Código em `apps/modulos/Bolt/source/` — Electron configurado (`electron-builder.yml`)
- **Package.json mínimo** (só `zod`), **sem scripts de build** (`electron:build`, `electron:pack`)
- **Sem `node_modules`, sem `dist/`**
- Roda via **Docker** (`docker compose up -d`) → porta 5174 → 5173
- Público: `https://builder.centralldark.com`

### Para gerar `.exe` (Windows)
```bash
cd apps/modulos/Bolt/source
pnpm install
# Precisa adicionar scripts no package.json:
# "electron:build": "electron-builder",
# "electron:pack": "electron-builder --dir"
pnpm electron:build
```

---

## 4. Portas — Medição Atual

| Porta | Serviço | Status |
|-------|---------|--------|
| 3030 | Screenpipe | ✅ LISTENING + ESTABLISHED (PID 33196) |
| 8080 | Hermes Gateway | ❌ NÃO OUVINDO |
| 8787 | Hermes Desktop | ❌ NÃO OUVINDO |
| 8099 | Omni Router | ❌ NÃO OUVINDO |
| 8788 | WebUI | ❌ NÃO OUVINDO |

Comando: `netstat -ano | findstr ":8080 :8787 :8099 :3030 :8788"`

---

## 5. Cron Jobs — Perfil pivete

Local: `E:\CentralDark\Pivete\cron\jobs.json`

### Jobs com erro recorrente
| Job | Schedule | Erro |
|-----|----------|------|
| System Breathing | every 360m | Script not found: `scripts/system-breathing.sh` |
| Telemetry (script) | */5 * * * * | Script not found: `logs/telemetria/CollectTelemetry.ps1` |
| Telemetry (model) | */5 * * * * | Config drift (provider/model mudou) |
| PRs abertos | every 30m | Script not found: `scripts/prs-open-commits-cycle.sh` |
| dependabot-monitor | * * * * * | Config drift |
| screenpipe-monitor | * * * * * | Config drift |
| cadeia-free-watchdog | every 10m | Script not found: `scripts/cadeia-free-watchdog.py` |
| webui-watchdog | */5 * * * * | Script not found: `scripts/webui-watchdog.py` |
| HERMES-CASA-HEALTH-WATCH | once | Connection error |
| screenpipe-hermes-live-monitor | every 10m | Connection error |

### Padrão de fix
1. **Script não existe** → criar script ou corrigir caminho
2. **Config drift** → `cronjob action=update job_id=<id> provider=<provider> model=<model>`

---

## 6. CLIs Disponíveis

| CLI | Status | Versão/Path |
|-----|--------|-------------|
| **Claude Code** | ✅ Instalado + autenticado | `2.1.251` — `/c/Users/danda/AppData/Roaming/npm/claude` |
| **Codex CLI** | ❌ Não instalado | `npm install -g @openai/codex` + `codex auth login` |
| **Gemini CLI** | ❌ Não instalado | — |
| **OpenCode** | ❌ Não instalado | — |

---

## 7. Perfil Ativo

- **Perfil em uso:** `pivete` (validado por `casa_boot.py` → status OK)
- **Perfil `default`:** NÃO EXISTE em `C:\Users\danda\AppData\Local\hermes\profiles\`
- Perfis existentes: `claude`, `pivete`, `sol`, `teste`

---

## Ações Recomendadas Próximas
1. Alterar `config.yaml` → TTS Edge + `pt-BR-FranciscaNeural`
2. `cd apps/modulos/Bolt/source && pnpm update` → resolve Dependabot #489, #488
3. Pinnar cron job `dependabot-monitor` (provider/model)
4. Verificar se scripts de cron existem ou criar/ajustar caminhos
5. Se quiser Bolt desktop nativo: adicionar scripts de build no package.json + `pnpm install && pnpm electron:build`
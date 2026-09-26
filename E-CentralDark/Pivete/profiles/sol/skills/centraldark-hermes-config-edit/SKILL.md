---
name: centraldark-hermes-config-edit
description: Edit Hermes config.yaml with PyYAML from its venv.
---

# CentralDark Hermes Config Edit

When the mission requires editing `E:\\CentralDark\\Pivete\\config.yaml`:

1. **Use the Hermes venv for PyYAML — never regex, never blind text edits.**
   - `sys.path.insert(0, r'C:\\Users\\danda\\AppData\\Local\\hermes\\hermes-agent\\venv\\Lib\\site-packages')`
   - `import yaml` works there (the system Python does NOT have PyYAML, but the venv does).
2. **Parse → modify nodes → serialize → re-parse to validate.**
   - `yaml.safe_load` → adjust dict/lists → `yaml.dump(..., allow_unicode=True, sort_keys=False)` → read back and confirm.


## Pitfall: CRONTAB DRIFT — editar model/provider sem recalibrar crons

Quando se edita `model.default` ou `providers.*` no config.yaml, **crons existentes não são recalibrados automaticamente** — eles continuam com a configuração de modelo/provider que tinham no momento da criação. Isso causa falhas silenciosas tipo:

```
Skipped to prevent unintended spend: global inference config drifted
since this job was created (provider 'nous' -> 'custom'; model 'x-ai/grok-4.20' -> 'nous/tencent/hy3:free')
```

**Regra:** após qualquer edição de `model.*` ou `providers.*` no config.yaml, verificar e recalibrar todos os cron jobs que dependem dessa configuração:

```bash
# 1. Listar todos os crons
hermes cron list

# 2. Para cada cron que usa modelo (não --no-agent), verificar se o model/provider atual bate com o que o job espera
hermes cron status <ID>

# 3. Recriar ou editar o cron com --model/--provider explícito se necessário
hermes cron remove <ID>
hermes cron create "every 6h" \
  --name "Telemetry collection" \
  --prompt "Collect telemetry data" \
  --model "upstage/solar-pro4:free" \
  --provider "nous" \
  --deliver origin

# OU editar existente mantendo ID
hermes cron edit <ID> --model "upstage/solar-pro4:free" --provider "nous"
```

**Melhor prática (preventiva):** criar crons com `--model` e `--provider` explícitos desde o início. Isso evita dependência de configuração global mutável e garante que o job use exatamente o modelo esperado, mesmo se o config.yaml for editado depois.

**Casos que desencadeiam verificação de drift:**
- Edição de `model.default`
- Edição/criação de `providers.<name>`
- Remoção de provider
- Troca de provider padrão
- Renomeação de modelos no config

**Detector de drift (conceitual):** um watchdog que periodicamente compara `hermes cron list` (model/provider de cada job) contra `config.yaml` atual e alerta sobre discrepâncias.

Sy:]
- `hermes fallback list` pode reportar vazio mesmo com YAML válido se a estrutura estiver errada; validar com Python antes.
- **TRAP DE PYTHON**: o `python` do sistema (`C:\Users\...\Python313\python.exe`) NÃO tem acesso aos módulos C extension do venv, mesmo com `sys.path.insert`. Usar **diretamente** `venv/Scripts/python.exe`. Exemplo: `"C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe" script.py`. Isso resolve: `pydantic_core._pydantic_core`, `requests`, `fastapi`, `uvicorn`, `yaml`.

See also `centraldark-operational-discipline` (Regra 77 — Edição do Config.yaml do Hermes).

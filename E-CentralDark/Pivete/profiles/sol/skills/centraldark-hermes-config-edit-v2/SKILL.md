---
name: centraldark-hermes-config-edit
description: Edit Hermes config.yaml with PyYAML from its venv.
category: configuration
---

# centraldark-hermes-config-edit

Quando a missão requer editar `E:\CentralDark\Pivete\config.yaml`:

1. **Use o venv Hermes para PyYAML — nunca regex, nunca edição cega de texto.**
   - `sys.path.insert(0, r'C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Lib\site-packages')`
   - `import yaml` funciona lá (o Python do sistema NÃO tem PyYAML, mas o venv tem).
2. **Parse → modificar nós → serializar → re-parar para validar.**
   - `yaml.safe_load` → ajustar dict/lists → `yaml.dump(..., allow_unicode=True, sort_keys=False)` → ler novamente e confirmar.

## Pitfall: CRONTAB DRIFT — editar model/provider sem recalibrar crons

Quando se edita `model.default` ou `providers.*` no config.yaml, **crons existentes não são recalibrados automaticamente** — eles continuam com a configuração de modelo/provider que tinham no momento da criação. Isso causa falhas silenciosas tipo:

```text
Skipped to prevent unintended spend: global inference config drifted
since this job was created (provider 'nous' -> 'custom'; model 'x-ai/grok-4.20' -> 'nous/tencent/hy3:free')
```

**Regra:** após qualquer edição de `model.*` ou `providers.*` no config.yaml, verificar e recalibrar todos os cron jobs que dependam dessa configuração:

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

### Padrão de execução comprovado (2026-09-03)

Quando editar `config.yaml` com mudanças em `model.*` ou `providers.*`, o fluxo validado é:

```bash
# 1. Usar o Python do venv Hermes (NÃO o system Python)
"C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe" <<PYEOF
import sys
sys.path.insert(0, r'C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Lib\site-packages')
import yaml

with open(r'E:\CentralDark\Pivete\config.yaml', 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

# ... fazer a alteração desejada ...

with open(r'E:\CentralDark\Pivete\config.yaml', 'w', encoding='utf-8') as f:
    yaml.dump(config, f, allow_unicode=True, sort_keys=False)

with open(r'E:\CentralDark\Pivete\config.yaml', 'r', encoding='utf-8') as f:
    validated = yaml.safe_load(f)

assert config == validated, "Round-trip falhou — YAML inconsistente"
PYEOF

# 2. Verificar drift de cron jobs
hermes cron list
hermes cron status <ID>  # para jobs críticos
```

**Referência:** Esta sequência foi validada em sessão 2026-09-03 ao editar `model.default: auto → nous/tencent/hy3:free` com sucesso e confirmed round-trip validation.

See also `centraldark-operational-discipline` (Regra 77 — Edição do Config.yaml do Hermes).

## Referências de apoio

- `references/hermes-config-yaml-edit-pattern.md` — padrão de edição YAML
- `references/centraldark-omni-router-startup.md` — startup do omni-router
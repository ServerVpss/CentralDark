# Pré-requisito crítico: gateway ativo

O gateway Hermes deve estar RODANDO para os cron jobs dispararem. Sem ele, jobs configurados nunca executam.

```bash
# Verificar status
hermes gateway status
# ✓ Gateway process running (PID: XXXX)  → OK
# ✗ No gateway process detected           → bloqueado

# Ligar se estiver off
hermes gateway start
```

O `hermes gateway start` é o que ativa o scheduler. Sem esse passo, `hermes cron list` mostra jobs mas eles nunca rodam.

---

## Comando correto para editar jobs existentes

**NÃO use `hermes cron update`** — esse subcommand NÃO EXISTE.

Use **`hermes cron edit`** (posicional, sem `--job-id`):

```bash
# Corrigir script path
hermes cron edit <JOB_ID> --script <nome-arquivo>

# Pincar provider/model (corrige config drift)
hermes cron edit <JOB_ID> --provider <provider> --model "<model>"

# Múltiplas flags juntas
hermes cron edit <JOB_ID> --script sistema.sh --provider nous --model "nous/tencent/hy3:free"
```

Flags aceitas por `edit`: `--script`, `--provider`, `--model`, `--workdir`, `--name`.

---

## Gap-filling: jobs apontando para scripts que não existem

Quando `hermes cron list` mostra "Script not found" nos jobs existentes, o workflow é **criar os scripts missing**, não remover os jobs.

**Diagnóstico:**
```bash
hermes cron list | grep "Script not found"
```

**Classificação rápida:**
- Path duplicado (`scripts/scripts/...`) → corrigir via `hermes cron edit --script <caminho-correto>`
- Script inexistente → criar o script no caminho esperado

**Exemplo real (sessão 2026-09-02):**
| Job ID | Problema | Ação |
|--------|----------|------|
| `0e769e2ce2b2` | `scripts/scripts/system-breathing.sh` (duplicado) | `hermes cron edit --script system-breathing.sh` |
| `8da666859a0d` | `scripts/logs/telemetria/CollectTelemetry.ps1` (duplicado) | `hermes cron edit --script logs/telemetria/CollectTelemetry.ps1` |
| `5050ea9f4723` | Config drift | `hermes cron edit --provider nous --model "nous/tencent/hy3:free"` |

---

## `.ps1` direto vs wrapper .sh — verificar antes de generalizar

O skill anterior afirmava ".ps1 não roda direto, precisa de wrapper .sh". Na prática desta sessão:

- Job `8da666859a0d` registrado com `--script logs/telemetria/CollectTelemetry.ps1` foi ** aceito pelo cron** (erro foi path duplicado, não execução)
- **Contraprova necessária:** rodar o .ps1 via cron real e confirmar execução, não apenas aceite do registro

Até contraprova, registrar como **PENDENTE_DE_VERIFICACAO** — não generalizar "ps1 roda direto" nem manter ".ps1 precisa de wrapper" cego.

---

## Testar job manualmente

```bash
# Forma correta (ARG POSICIONAL, não --job-id):
hermes cron run <JOB_ID>

# NOTA: neste ambiente, hermes cron run pode timeout. Se falhar, testar o script
# diretamente antes de blamear o cron:
bash /caminho/absoluto/script.sh          # para .sh
python /caminho/absoluto/script.py        # para .py
powershell -File "C:/caminho/script.ps1"  # para .ps1
```

**Se `hermes cron run` timeout:** o problema pode ser o próprio comando Hermes, não o job. Testar o script diretamente isola a variável.

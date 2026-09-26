---
name: cron-maintenance-tasks
description: "Hermes cron: agendar tarefa recorrente à validação."
version: 1.0.2
author: Hermes
platforms: [windows, linux]
metadata:
  hermes:
    tags: [cron, scheduled-tasks, hermes-agent, devops, maintenance, powershell, windows]
    related_skills: [hermes-agent, intention-driven-workflow, operational-discipline]
---

# Cron Maintenance Tasks (Hermes Agent)

## Trigger

Use quando o usuário pede para agendar uma tarefa recorrente no Hermes Agent — script de manutenção, verificação, alerta, limpeza, "respiração", flush, monitor, watchdog, etc.

## Workflow

```text
1. ESCREVER O SCRIPT
2. GARANTIR QUE RODA NO AMBIENTE DO CRON
3. COLOCAR EM ~/.hermes/scripts/
4. REGISTRAR COM hermes cron create
5. VALIDAR COM hermes cron list
6. TESTAR EXECUÇÃO (dry run ou run manual)
7. CONFIRMAR PRÓXIMO RUN E ENTREGA
```

Leia `references/hermes-cron-reference.md` para os parâmetros e formatos de schedule.

### Pré-requisito crítico: gateway ativo

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

### Step 1 — Escrever o script

O script é o trabalho real. Pode ser bash, Python, PowerShell. O cron roda o script; o stdout vira entrega (quando `--no-agent`).

### Step 2 — Garantir que roda no ambiente do cron

- Scripts `.sh` / `.bash` → bash
- Scripts `.ps1` → **não rodam direto**. Precisam de wrapper `.sh` chamando `pwsh.exe` ou `powershell.exe`. **VER PEREIRA ABAHO.**
- Scripts Python → Python

O cron roda detachado: caminhos relativos são ambíguos; use caminhos absolutos no `--workdir`.

### Step 3 — Colocar em `~/.hermes/scripts/`

Regra: `hermes cron create --script` só aceita **nome de arquivo relativo** e o arquivo deve estar em `~/.hermes/scripts/`.

```bash
mkdir -p ~/.hermes/scripts/
cp meu-script.sh ~/.hermes/scripts/
chmod +x ~/.hermes/scripts/meu-script.sh
```

Para PowerShell: copia **tanto** o `.ps1` (trabalho real) **quanto** o `.sh` (wrapper) para `~/.hermes/scripts/`.

### Step 4 — Registrar com hermes cron create

```bash
hermes cron create "every 6h" \
  --name "Nome do Job" \
  --script "meu-script.sh" \
  --no-agent \
  --deliver origin \
  --workdir "E:/CentralDark/Pivete"
```

Parâmetros principais:
- `--name` — nome amigável (opcional)
- `--script` — nome do arquivo em `~/.hermes/scripts/` **apenas o nome**, sem caminho
- `--no-agent` — roda só o script, sem LLM; stdout vira entrega direta
- `--deliver` — destino: `origin`, `local`, `telegram`, `discord`, `signal`, ou `platform:chat_id`
- `--workdir` — caminho absoluto (Windows: use `E:/Caminho` com barra)
- `--repeat` — repetições (omit = ∞)
- `--skill` — skills pré-carregados (opcional)
- `--model` / `--provider` — override de modelo (opcional)

### Step 5 — Validar

```bash
hermes cron list
```

Confirma: ID, nome, schedule, repeat, próximo run, entrega, script, modo, workdir.

### Step 6 — Testar

Prefira testar o script antes do cron entrar em loop:

```bash
bash ~/.hermes/scripts/meu-script.sh
```

Ou, para PowerShell:

```bash
bash ~/.hermes/scripts/meu-script.sh   # o wrapper chama pwsh.exe
```

Se o script for perigoso (kill de processos, flush de memória, reload de serviço), comece com dry-run ou flag de teste.

---

## Windows + PowerShell — caminho completo

**Problema:** `.ps1` não é executável pelo cron direto. O cron roda `.sh` via bash, `.ps1` via Python — o que não executa PowerShell.

**Solução:** Wrapper `.sh` que chama o interpretador PowerShell apropriado.

### Wrapper mínimo

```bash
#!/bin/bash
SCRIPT="C:/CentralDark/Pivete/scripts/system-breathing.ps1"

if [ -x "/c/Program Files/PowerShell/7/pwsh.exe" ]; then
    /c/Program\ Files/PowerShell/7/pwsh.exe -NoProfile -ExecutionPolicy Bypass -File "$SCRIPT" 2>&1
elif [ -x "/c/Program Files (x86)/PowerShell/7/pwsh.exe" ]; then
    /c/Program\ Files\\(x86\\)/PowerShell/7/pwsh.exe -NoProfile -ExecutionPolicy Bypass -File "$SCRIPT" 2>&1
elif command -v pwsh &> /dev/null; then
    pwsh -NoProfile -ExecutionPolicy Bypass -File "$SCRIPT" 2>&1
elif command -v powershell &> /dev/null; then
    powershell -NoProfile -ExecutionPolicy Bypass -File "$SCRIPT" 2>&1
else
    /c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$SCRIPT" 2>&1
fi
```

### Registro

```bash
# 1. Copia ambos para ~/.hermes/scripts/
mkdir -p ~/.hermes/scripts/
cp system-breathing.ps1 ~/.hermes/scripts/
cp system-breathing.sh ~/.hermes/scripts/
chmod +x ~/.hermes/scripts/system-breathing.sh

# 2. Registra com nome do wrapper (apenas nome)
hermes cron create "every 6h" \
  --name "System Breathing - Memory Flush & Zombie Reaper" \
  --script "system-breathing.sh" \
  --no-agent \
  --deliver origin \
  --workdir "E:/CentralDark/Pivete"

# 3. Valida
hermes cron list
```

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

## Troubleshooting: `hermes cron run` vs execução manual

### Sinal: "Ran now: failed." mas o script roda manualmente

**Sinal:** `hermes cron run <ID>` reporta `"Ran now: failed."` mas ao rodar o script manualmente (bash/python/powershell direto) funciona.

**Nem toda falha de cron é bug no script.** O worker do cron roda em subprocess isolado com:
- PATH diferente do terminal interativo (pode não ter `bash.exe`, `pwsh.exe`, ou ferramentas Windows como `tasklist`/`netstat`/`ss`)
- `set -euo pipefail` no script mata execução em primeira falha não-zero — no manual o operador tolera, no cron o erro encerra com código não-zero
- Saída de `grep`/`ss`/`netstat` em Windows pode vir com linhas extras ou bytes inválidos (ANSI color codes, null bytes) que quebram parsing condicional (`if [ "$VAR" -gt 0 ]` com valor `"0\n0"`)

**Triagem (antes de editar o script):**

```bash
# 1. Ler o log gerado pelo último run do job
# (caminho: logs/<job-tag>-<timestamp>.log ou conforme LOG_FILE do script)

# 2. Reproduzir com o mesmo PATH/shell do worker
#    - Se o script é .sh: bash <script> (worker do cron usa bash disponível)
#    - Se usa comandos Windows (tasklist, netstat, findstr): teste com caminho absoluto
#    - Se usa ps/free/ss: confirmar disponibilidade no ambiente do worker

# 3. Sanitizar valores que vêm de comandos externos antes de usar em testes numéricos
#    Ex: ZOMBIES=$(ps ... | grep -c '^Z' 2>/dev/null || echo "0")
#    Garante que $ZOMBIES sempre é um inteiro simples, não "0\n0" ou "0\n"
```

**Correções comuns:**
- `+set -euo pipefail+` é útil para scripts de produção, mas para script de diagnóstico que pode encontrar ferramentas indisponíveis, preferir `+set -u+` ou lidar explicitamente com cada fallthrough
- Valores de comandos externos devem ser sanitizados: `ZOMBIES=$(ps ... | grep -c '^Z' 2>/dev/null) || ZOMBIES=0` e depois `if [ "$ZOMBIES" -gt 0 ] 2>/dev/null`
- Comandos Windows (`findstr`, `tasklist`, `netstat -ano`) não têm análogos bash nativos no worker do cron — usar caminhos absolutos ou verificar disponibilidade com `command -v`
- Saída de `grep -c` em ambientes com ANSI color pode conter bytes não-decodeáveis — usar `2>/dev/null` e sanitizar

**Padrão recomendado para scripts de watchdog de produção:**
- Log detalhado em arquivo (`logs/<tag>-<timestamp>.log`)
- Código de saída 0 em sucesso, 1 em erro real (não em "ferramenta indisponível")
- Valor default seguro para cada métrica (0, "unknown", "") em vez de falhar
- Não usar `set -e` se o script tolera indisponibilidade de ferramentas

---

## Debug: distinguir falha real do script de falha de ambiente

Quando `hermes cron run <ID>` falha mas execução manual funciona:

1. **Ler o log do job** — o script grava em LOG_FILE; o log mostra onde parou
2. **Tentar reproduzir com shell mínimo** — `bash script.sh` vs `bash -x script.sh` para ver cada comando
3. **Verificar PATH do worker** — o worker pode não ter acesso às mesmas ferramentas do terminal
4. **Isolar o comando problemático** — rodar só a parte que falha, isolar a variável

Exemplo real (sessão 2026-09-02):
- Job `0e769e2ce2b2` (System Breathing) reportava "Ran now: failed."
- Script funcionava manualmente via `bash scripts/system-breathing.sh`
- Causa: `grep -c '^Z'` retornava valor com quebra de linha extra (`"0\n0"`) e `set -euo pipefail` matava o script no `if [ "$ZOMBIES" -gt 0 ]`
- Correção: sanitizar ZOMBIES com fallback seguro + tolerar `set -e` apenas nos comandos que podem falhar

---

## Pitfalls

### Pitfall: script path absoluto no --script

`hermes cron create` rejeita caminho absoluto ou home-relative no `--script`. Erro: "Script path must be relative to ~/.hermes/scripts/".

Correção: copia o script para `~/.hermes/scripts/` e usa **apenas o nome do arquivo**.

### Pitfall: workdir POSIX vs Windows

`--workdir` com caminho POSIX (`/e/CentralDark/...`) pode ser rejeitado como "não absoluto" no contexto Windows. Erro: "Cron workdir must be an absolute path (got '/e/...')".

Correção: usar caminho Windows absoluto com barra: `E:/CentralDark/Pivete`.

### Pitfall: .ps1 sem wrapper

Registrar `meu-script.ps1` como `--script` e esperar que rode: o cron tenta rodar via Python, o que não executa PowerShell.

Correção: sempre criar wrapper `.sh` para `.ps1` e registrar o wrapper. **VER PEREIRA ABAHO — .ps1 pode ser aceito direto pelo cron em algumas configurações; testar.**

### Pitfall: PowerShell C# null-conditional `?.`

PowerShell **não** suporta o operador `?.` de null-conditional do C#. Usar `$config.config.gateway?.platforms?.telegram` dá erro de parser.

Correção: escrever parse de YAML simples (regex / hashtable) e navegar com verificação explícita de chave.

### Pitfall: subexpression inline com if/else em here-string

```powershell
$resumo = @"
- Eixos: Flush=$($if($DryRun){"SKIP"}else{"OK"})
"@
```

Isso **falha** com "Token '(' inesperado". Subexpression `$()` não aceita bloco `if/else` inline complexo.

Correção: usar variável intermediária:

```powershell
$flushStatus = if ($DryRun) { "SKIP" } else { "OK" }
$resumo = @"
- Eixos: Flush=$flushStatus
"@
```

### Pitfall: script perigoso sem dry-run

Se o script faz coisa destructiva (kill de processos, flush de memória, reload de serviço), testar em dry-run ou com flag de simulação antes do cron entrar em loop.

### Pitfall: encerramento de processos órfãos sem confirmação

Zombie reaper que mata `chrome.exe`/`node.exe`/`Code.exe` pode matar processos legítimos se a heurística de "órfão" for frouxa. Preferir:
- timeout de idle (CPU = 0 por N minutos) +
- verificação de processo-pai (ParentProcessId inexistente ou kill) +
- opção de dry-run

### Padrão: Watchdog de serviço com checagem de porta (sem duplicação)

Quando o objetivo é manter um serviço web vivo (ex: Hermes WebUI na porta 8788) sem criar processos duplicados, use um watchdog que segue esta ordem:

1. CHECA se a porta responde (Invoke-WebRequest / curl no `/health` ou raiz)
2. SE responde → loga OK e sai (nada a fazer — não sobe nada)
3. SE não responde → lança o serviço em background e aguarda N segundos
4. RE-CHECA se subiu
5. LOGA a decisão final: `OK`, `RECOVERED` ou `FAIL`

Isso evita que o cron crie múltiplas instâncias se o serviço já tá no ar — e garante que o serviço renasce sozinho se cair.

### Registro no cron

- Script `.ps1` copiado para `~/.hermes/scripts/` (junto com qualquer wrapper `.sh` se necessário)
- Registra com nome do script, `--no-agent`, `--deliver local`
- Schedule curto (ex: `*/5 * * * *`) pra detectar falha rápido

### Leitura de estado do job: distinguir parada designada de erro real

Alguns jobs terminam com `last_status: error` mas o log mostra que saíram por parada designada (ex: "horário >= 18:00 Brasil — ciclo stop."). Isso NÃO é falha de execução — é comportamento esperado.

Como investigar antes de "consertar":
- Ler o log do job gravado no último run
- Se contém string de parada designada → não é erro, é parada no horário
- Se contém stack trace / erro real → investigar a causa

Na dúvida, **ler o log antes de agir** — não assumir que `last_status: error` = JOB quebrado.

### Pitfall (adicionado): CRONTAB DRIFT — crons não são recalibrados quando config.yaml muda

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

### Patch: Hermes CLI binary location — Esta sessão confirmou que o binário está em

```
C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\hermes.exe
```

e **não está no PATH**. Acesso necessário via caminho absoluto ou ativação do venv.

Comandos confirmados funcionando nesta sessão:
- `/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/hermes.exe cron list`
- `/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/hermes.exe cron edit <ID> --script <path>`
- `/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/hermes.exe cron edit <ID> --provider <p> --model <m>`
- `/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/hermes.exe gateway start`
- `/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/hermes.exe gateway status`

Observação sobre `hermes cron edit`: aceita flags `--script`, `--provider`, `--model`, `--workdir`, `--name`. Não aceita `hermes cron update` (esse subcommand não existe — usar `edit`).

### ✨ Pattern confirmado: Cron Job Failure Taxonomy (categorias de falha)

Falha de cron job não é um bloco — é um sinal. Classificar antes de agir.

#### Categoria A — Script não existe (path incorreto)
**Sinal:** `Script not found: E:\\...\\scripts\\scripts\\...`
**Causa:** path duplicado gerado pelo workdir + subdir. Ver `script path deduplication` abaixo.
**Correção:** corrigir `--script` para caminho correto ou copiar script para local esperado.

Exemplo real (sessão 2026-09-02, job `0e769e2ce2b2`):
```
Error: Script not found: E:\CentralDark\Pivete\scripts\scripts\system-breathing.sh
```
→ Corrigido via `hermes cron edit 0e769e2ce2b2 --script system-breathing.sh` com workdir ajustado.

#### Categoria B — Config drift (provider/model mudou)
**Sinal:** `Skipped to prevent unintended spend: global inference config drifted since this job was created (provider 'nous' -> 'custom'; model 'x-ai/grok-4.20' -> 'nous/tencent/hy3:free')`
**Causa:** job criado com provider/model implícitos (herda config no momento da criação). Config.yaml mudou depois.
**Correção:** `hermes cron edit <ID> --provider <pv> --model <mv>`

Exemplo real (sessão 2026-09-02, jobs `5050ea9f4723`, `8a7b98f04c7c`, `89f742175bac`):
```
Error: RuntimeError: Skipped to prevent unintended spend: global inference config drifted...
```
→ Corrigido via `hermes cron edit 5050ea9f4723 --provider nous --model "nous/tencent/hy3:free"` etc.

#### Categoria C — Modelo gratuito expirado
**Sinal:** `HTTP 502: {"detail":"nous_http_404:...This model's free period has ended..."}`
**Causa:** modelo free-tier usado pelos jobs expirou ou foi desligado pelo provedor.
**Correção:** migrar para modelo pago/alternativo ou incluir módulo de fallback.

Exemplo real (sessão 2026-09-02, job `6fa96b458564` Monitor Hermex):
```
Error: RuntimeError: HTTP 502: {"detail":"nous_http_404:{...This model's free period has ended..."}
```
→ Requer decisão humana: pagar modelo ou trocar.

#### Categoria D — Script com erro de execução
**Sinal:** `error: ...` com traceback Python ou erro de shell
**Causa:** bug no script (syntax, lógica, path, permissão, dependência)
**Correção:** ler log, depurar script, corrigir, re-testar manualmente.

#### Categoria E — Timeout / lentidão excessiva
**Sinal:** job não termina no tempo esperado, timeout nas ferramentas de observação
**Causa:** script lento, bloqueio de I/O, espera de recurso externo
**Correção:** otimizar, aumentar timeout, dividir em chunks, ou migrar para processo background monitorado.

### Pattern confirmado: config drift — job peek vs job fix

**Job peek (ler antes de consertar):** o erro do job mostra o provider/model ANTES vs DEPOIS no campo `global inference config drifted`:

```
provider 'nous' -> 'custom'; model 'x-ai/grok-4.20' -> 'nous/tencent/hy3:free'
```

Isso diz exatamente:
- Provider antes: `nous`
- Provider depois: `custom`
- Model antes: `x-ai/grok-4.20`
- Model depois: `nous/tencent/hy3:free`

**Job fix (ação):** pegar os valores "depois" (os que estão no config.yaml agora) e aplicar ao job:
```bash
hermes cron edit <ID> --provider <valor-depois> --model "<model-depois>"
```

Exemplo real (sessão 2026-09-02):
```
Error: ... provider 'nous' -> 'custom'; model 'x-ai/grok-4.20' -> 'nous/tencent/hy3:free'
```
→ O "depois" é `nous` (provider) + `nous/tencent/hy3:free` (model) → aplicar via edit.

**Observação:** em alguns casos o provider "depois" é `nous` mas as jobs estavam com `custom` — confirmar via `hermes status` ou `config.yaml` qual é o provider real atual antes de pinar.

### Pattern confirmado: script path deduplication com workdir + subdir

Quando registrar job com workdir = pasta pai e script com caminho relativo que INCLUDE subdir, o resolved path pode duplicar o subdir.

**Exemplo real (sessão 2026-09-02):**
- Workdir: `E:/CentralDark/Pivete`
- Script registrado: `scripts/system-breathing.sh`
- Path resolvido pelo cron: `E:\\CentralDark\\Pivete\\scripts\\scripts\\system-breathing.sh`
- Resultado: duplicação de `scripts/`, arquivo não encontrado

**Correção aplicada:** usar `--script system-breathing.sh` com workdir apontando para `E:/CentralDark/Pivete/scripts` **OU** usar `--workdir E:/CentralDark/Pivete` + `--script system-breathing.sh` com script copiado para pasta root do workdir.

**Regra prática para criar/edit:**
1. Se script está em `scripts/`, definir workdir = `<pasta_pai>/scripts/` e --script = nome apenas
2. Se script está em root do workdir, definir workdir = `<pasta_pai>/` e --script = nome apenas
3. Antes de registrar/edit, testar manualmente com `bash "<path-absoluto-do-script>"` — se der "No such file or directory", ajustar.

### Padrão: Watchdog de serviço com checagem de porta (sem duplicação)

Quando o objetivo é manter um serviço web vivo (ex: Hermes WebUI na porta 8788) sem criar processos duplicados, use um watchdog que segue esta ordem:

1. CHECA se a porta responde (Invoke-WebRequest / curl no `/health` ou raiz)
2. SE responde → loga OK e sai (nada a fazer — não sobe nada)
3. SE não responde → lança o serviço em background e aguarda N segundos
4. RE-CHECA se subiu
5. LOGA a decisão final: `OK`, `RECOVERED` ou `FAIL`

Isso evita que o cron crie múltiplas instâncias se o serviço já tá no ar — e garante que o serviço renasce sozinho se cair.

### Registro no cron

- Script `.ps1` copiado para `~/.hermes/scripts/` (junto com qualquer wrapper `.sh` se necessário)
- Registra com nome do script, `--no-agent`, `--deliver local`
- Schedule curto (ex: `*/5 * * * *`) pra detectar falha rápido

### Leitura de estado do job: distinguir parada designada de erro real

Alguns jobs terminam com `last_status: error` mas o log mostra que saíram por parada designada (ex: "horário >= 18:00 Brasil — ciclo stop."). Isso NÃO é falha de execução — é comportamento esperado.

Como investigar antes de "consertar":
- Ler o log do job gravado no último run
- Se contém string de parada designada → não é erro, é parada no horário
- Se contém stack trace / erro real → investigar a causa

Na dúvida, **ler o log antes de agir** — não assumir que `last_status: error` = JOB quebrado.

### Pitfall (adicionado): CRONTAB DRIFT — crons não são recalibrados quando config.yaml muda

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

### Patch: Hermes CLI binary location — Esta sessão confirmou que o binário está em

```
C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\hermes.exe
```

e **não está no PATH**. Acesso necessário via caminho absoluto ou ativação do venv.

Comandos confirmados funcionando nesta sessão:
- `/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/hermes.exe cron list`
- `/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/hermes.exe cron edit <ID> --script <path>`
- `/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/hermes.exe cron edit <ID> --provider <p> --model <m>`
- `/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/hermes.exe gateway start`
- `/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/hermes.exe gateway status`

Observação sobre `hermes cron edit`: aceita flags `--script`, `--provider`, `--model`, `--workdir`, `--name`. Não aceita `hermes cron update` (esse subcommand não existe — usar `edit`).

### Pattern confirmado: config drift — job peek vs job fix

**Job peek (ler antes de consertar):** o erro do job mostra o provider/model ANTES vs DEPOIS no campo `global inference config drifted`:

```
provider 'nous' -> 'custom'; model 'x-ai/grok-4.20' -> 'nous/tencent/hy3:free'
```

Isso diz exatamente:
- Provider antes: `nous`
- Provider depois: `custom`
- Model antes: `x-ai/grok-4.20`
- Model depois: `nous/tencent/hy3:free`

**Job fix (ação):** pegar os valores "depois" (os que estão no config.yaml agora) e aplicar ao job:
```bash
hermes cron edit <ID> --provider <valor-depois> --model "<model-depois>"
```

Exemplo real (sessão 2026-09-02):
```
Error: ... provider 'nous' -> 'custom'; model 'x-ai/grok-4.20' -> 'nous/tencent/hy3:free'
```
→ O "depois" é `nous` (provider) + `nous/tencent/hy3:free` (model) → aplicar via edit.

**Observação:** em alguns casos o provider "depois" é `nous` mas as jobs estavam com `custom` — confirmar via `hermes status` ou `config.yaml` qual é o provider real atual antes de pinar.

### Pattern confirmado: script path deduplication com workdir + subdir

Quando registrar job com workdir = pasta pai e script com caminho relativo que INCLUDE subdir, o resolved path pode duplicar o subdir.

**Exemplo real (sessão 2026-09-02):**
- Workdir: `E:/CentralDark/Pivete`
- Script registrado: `scripts/system-breathing.sh`
- Path resolvido pelo cron: `E:\\CentralDark\\Pivete\\scripts\\scripts\\system-breathing.sh`
- Resultado: duplicação de `scripts/`, arquivo não encontrado

**Correção aplicada:** usar `--script system-breathing.sh` com workdir apontando para `E:/CentralDark/Pivete/scripts` **OU** usar `--workdir E:/CentralDark/Pivete` + `--script system-breathing.sh` com script copiado para pasta root do workdir.

**Regra prática para criar/edit:**
1. Se script está em `scripts/`, definir workdir = `<pasta_pai>/scripts/` e --script = nome apenas
2. Se script está em root do workdir, definir workdir = `<pasta_pai>/` e --script = nome apenas
3. Antes de registrar/edit, testar manualmente com `bash "<path-absoluto-do-script>"` — se der "No such file or directory", ajustar.

## Relationship to other skills

- `hermes-agent` (protected) — referencia cron in `references/background-systems.md`; este é o guia operacional de criação/validação/debug.
- `intention-driven-workflow` — sobre não agir antes da intenção completa; este é sobre como agendar depois de ter a intenção.
- `operational-discipline` — sobre não tomar ação periférica não pedida; este é sobre o fluxo de agendamento em si.

## Aprendizados desta sessão (2026-09-06)

**Sintaxe de criação corrigida:** `hermes cron create "every 10m" "descrição" --script script.sh` — schedule é argumento posicional, **não** flag `--schedule`. Tentativas anteriores com `--schedule` falharam com "unrecognized arguments". O workflow correto é passar o schedule como primeiro argumento posicional após o nome do job.

**Path deduplication com workdir + subdir:** Quando registrar job com `workdir = E:/CentralDark/Pivete` e `--script scripts/system-breathing.sh`, o path resolvido pelo cron fica `E:/CentralDark/Pivete/scripts/scripts/system-breathing.sh` (duplicação de `scripts/`). **Correção:** definir `workdir = E:/CentralDark/Pivete/scripts/` e usar `--script system-breathing.sh` (apenas o nome), **OU** manter `workdir = E:/CentralDark/Pivete/` e copiar o script para a pasta root do workdir. Antes de registrar, testar manualmente com `bash "<caminho-absoluto>"`.

**`hermes cron edit` vs `hermes cron update`:** O subcommand `update` **não existe**. Use sempre `hermes cron edit <JOB_ID>` para corrigir script, provider, model, workdir e name. As flags aceitas pelo `edit` são: `--script`, `--provider`, `--model`, `--workdir`, `--name`. Tentar `hermes cron update` retorna erro de subcommand inexistente.

**PATH do worker Windows — isolamento de subprocess:** O worker do cron roda em subprocess isolado no Windows. Pode não ter `bash`, `pwsh` ou comandos nativos (`tasklist`, `netstat`, `findstr`) no PATH, mesmo que o terminal interativo os tenha. Erro típico: `CreateProcessCommon:818: execvpe(/bin/bash) failed: No such file or directory`. **Triagem:** (1) Ler o log do último run do job. (2) Tentar reproduzir com `bash <script>` no terminal. (3) Isolar o comando problemático com caminhos absolutos. (4) Sanitizar valores de comandos externos (`ZOMBIES=$(ps ... | grep -c '^Z' 2>/dev/null) || ZOMBIES=0`). Padrão recomendado: evitar `set -euo pipefail` em watchdog scripts; usar `set -u+` e lidar explicitamente com cada fallthrough, com valores defaults seguros (0, "unknown", "").

**Config drift — job peek vs job fix:** Após editar `model.default` ou `providers.*` no `config.yaml`, os crons existentes **não são recalibrados automaticamente** — continuam com a configuração de modelo/provider que tinham no momento da criação, causando falhas silenciosas tipo: `Skipped to prevent unintended spend: global inference config drifted since this job was created (provider 'nous' -> 'custom'; model 'x-ai/grok-4.20' -> 'nous/tencent/hy3:free')`. **Regra:** após qualquer edição de `model.*` ou `providers.*` no config.yaml, verificar e recalibrar todos os cron jobs: (1) `hermes cron list`, (2) `hermes cron status <ID>` para conferir provider/model esperados, (3) `hermes cron edit <ID> --provider <p> --model "<m>"` para aplicar os valores atuais, ou `hermes cron remove <ID>` + `hermes cron create` novo com flags explícitas. **Melhor prática (preventiva):** criar crons com `--model` e `--provider` explícitos desde o início.

**Exemplo real (sessão 2026-09-02):**
- Jobs `5050ea9f4723`, `8a7b98f04c7c`, `89f742175bac` foram deletados acidentalmente por erro de sintaxe em `hermes cron edit` (usando `--schedule` como flag posicionais).
- Corrigido recriando com `hermes cron create "every 10m" "Nome do job" --script script.sh --provider openrouter --model tencent/hy4-preview`.
- Jobs `0e769e2ce2b2` tinha path duplicado `scripts/scripts/` — corrigido via `hermes cron edit 0e769e2ce2b2 --script system-breathing.sh`.
- HTTP 401 nos jobs `dependabot-monitor.sh` e `screenpipe-monitor.sh` — auth GitHub pendente, não impede execução.
- HTTP 402 no `Monitor Hermex` — crédito esgotado no OpenRouter, requiere recarga no painel.

---\n*Próximo passo: após qualquer edição de config.yaml, rodar `hermes cron list` + `hermes cron status <ID>` para verificar drift.*

Deve-se ainda verificar o PATH do worker do cron antes de criar scripts .sh, pois o worker do cron Hermes no Windows executa jobs em subprocess isolado e, em algumas configurações (notadamente quando o Hermes Agent roda via MSYS2/Git Bash), o subprocess do cron **não tem `bash` disponível** no PATH, mesmo que o terminal interativo tenha. Sintoma: job com script `.sh` reporta "failed" mas roda manualmente no terminal. Erro típico: `CreateProcessCommon:818: execvpe(/bin/bash) failed: No such file or directory`. Correção: preferir `.py` para cron no Windows; para `.sh`, usar wrapper com caminho absoluto do bash ou verificar disponibilidade com `which bash`. Ver `references/windows-cron-worker-realities.md`.

Ainda, o binário do Hermes CLI **não está no PATH** por padrão. Localização confirmada nesta sessão: `C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\hermes.exe`. No terminal MSYS/Git Bash o caminho POSIX funciona: `/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/hermes.exe cron list`.

Besides the `hermes cron create` CLI, you can create cron jobs programmatically via the `cronjob` tool available in the agent's toolset. This is useful when automating from within a script or another skill.

Example (JSON payload for the tool):
```json
{
  "action": "create",
  "name": "Telemetry collection automation",
  "schedule": "*/5 * * * *",
  "prompt": "Run the PowerShell script located at logs/telemetria/CollectTelemetry.ps1 to collect telemetry data.",
  "script": "logs/telemetria/CollectTelemetry.ps1",
  "workdir": "E:\\\\CentralDark\\\\Pivete",
  "no_agent": true,
  "deliver": "origin"
}
```
Notes:
- The `script` path is relative to the `workdir` (or absolute if preferred).
- Setting `no_agent:true` runs the script directly without invoking the LLM; the script's stdout becomes the job's delivery.
- The job will appear in `cronjob(action='list')` and can be managed with the same tool (update, pause, resume, remove, run).

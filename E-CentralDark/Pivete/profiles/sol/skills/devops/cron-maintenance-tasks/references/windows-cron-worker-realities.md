# Windows Cron Worker Realities (cron-maintenance-tasks)

> Realities confirmadas operacionalmente na sessão 2026-09-02 e válidas para
> qualquer sessão futura que configure cron jobs no Hermes Agent rodando no Windows.

## 1. O worker do cron roda em subprocess isolado — PATH é diferente do terminal

O worker do Hermes Agent que executa os jobs cron **não herda o PATH do terminal
interativo**. Isto significa:

- Ferramentas que o usuário acha que estão disponíveis (`bash`, `pwsh`, `tasklist`,
  `netstat`, `ss`, `python`, etc.) podem **não estar no PATH do worker** mesmo que
  o terminal as tenha.
- O `hermes cron run <ID>` executa o job em processo separado. Se o script depender
  de algo que não está no PATH do worker, o job reporta "failed" mesmo que rode
  perfeitamente no terminal interativo.

**Regra prática:** antes de criar um job, testar o script **com os mesmos comandos
que o worker vai usar**. Para scripts .sh: `bash <script>`. Para .py: `python <script>`.
Se algo falhar no teste manual, o cron também vai falhar.

---

## 2. `.sh` vs `.py` no Windows — preferir `.py`

Na sessão 2026-09-02, os jobs com scripts `.sh` (bash) falharam via cron e "Job is
already being fired by the scheduler" foi reportado — mas ao mesmo tempo, scripts `.py`
funcionaram corretamente quando executados via `python <script>`.

A causa provável: o subprocess do cron no Windows **não tem `bash` no PATH** em
certas configurações (notadamente quando o Hermes Agent roda via MSYS2/Git Bash),
mesmo que o terminal interativo tenha. O erro típico é:

```
CreateProcessCommon:818: execvpe(/bin/bash) failed: No such file or directory
```

**Regra:** para cron jobs no Windows, **preferir scripts `.py`**. Eles são executados
pelo Python que já está no PATH do worker (ou na mesma base que o Hermes Agent).

Para scripts `.sh` que precisam existir (legado, comportamento específico), usar
wrapper com caminho absoluto do bash, ou verificar disponibilidade com `which bash`
antes de registrar o job.

---

## 3. Encoding do Windows no subprocess — "errors='replace'" evita crash

Comandos Windows como `tasklist`, `netstat -ano`, `findstr` podem emitir bytes que
não são UTF-8 válidos quando capturados via `subprocess.run(capture_output=True,
text=True)` no Python. Isso causa `UnicodeDecodeError` no subprocess do worker.

**Correção confirmada:** usar `encoding="utf-8", errors="replace"` em
`subprocess.run()`:

```python
r = subprocess.run(cmd, capture_output=True, text=True, timeout=10,
                   encoding="utf-8", errors="replace")
```

Isso substitui bytes inválidos por `U+FFFD REPLACEMENT CHARACTER` em vez de crashar.

**Aplicação:** qualquer script Python de watchdog/cron que execute comandos Windows
deve usar esse padrão de encoding. Scripts que não usam e capturam stderr/stdout
crasham silenciosamente ou relatam "failed" sem log útil.

---

## 4. "Job is already being fired by the scheduler" — NÃO é erro

Quando `hermes cron run <ID>` reporta:

```
Triggered job: Nome do Job (ID)
  Next run: 2026-09-03T02:27:25.630378-02:00
  Job is already being fired by the scheduler; not run again.
```

Isso significa que o job **já está ativo no scheduler** — o gateway está protegendo
contra execução duplicada. **Não é uma falha de execução.**

**Regra:** quando ver este mensagem, entender que o job está rodando (ou prestes a
rodar) no ciclo normal. Não tentar "consertar" — é comportamento esperado.

---

## 5. "Ran now: failed." via gateway vs execução manual OK — classificar antes de agir

Sinal: `hermes cron run <ID>` reporta `"Ran now: failed."` mas ao rodar o script
manualmente (`bash script.sh` ou `python script.py`) funciona.

**Nem toda falha de cron é bug no script.** Triage:

### a. O script usa `set -euo pipefail` e um comando falha
O `set -e` mata a execução no primeiro comando que retorna não-zero. No terminal
interativo, o usuário pode tolerar ou ver o erro e continuar; no cron, isso encerra
com código de saída não-zero e o gateway reporta "failed".

**Correção:** para scripts de diagnóstico que toleram indisponibilidade de ferramentas,
usar `set -u` (sem `-e`) ou lidar explicitamente com cada fallthrough.

### b. O script espera uma variável com valor ruim
Exemplo: `ZOMBIES=$(ps ... | grep -c '^Z')` retorna `"0\n0"` em alguns ambientes
(ANSI color code, quebra de linha extra). O `if [ "$ZOMBIES" -gt 0 ]` falha porque
`"$ZOMBIES"` não é um inteiro simples.

**Correção:** sanitizar o valor: `ZOMBIES=$(ps ... | grep -c '^Z' 2>/dev/null) || ZOMBIES=0`
e depois `if [ "$ZOMBIES" -gt 0 ] 2>/dev/null`.

### c. O PATH do worker não tem a ferramenta
Se o script usa `tasklist`, `netstat`, `ss`, `free` etc. e o worker não tem essas
ferramentas no PATH, o comando falha. No terminal, o PATH pode incluir mais coisas.

**Correção:** usar caminhos absolutos para ferramentas Windows, ou verificar
disponibilidade com `command -v` antes de usar.

### d. O script depende de variáveis de ambiente que o worker não tem
O worker do cron pode não ter as mesmas variáveis de ambiente do terminal (como
`HERMES_UI_SESSION_ID`, `PATH` expandido, etc.).

**Correção:** definir variáveis necessárias no script mesmo, ou verificar se estão
presentes antes de usar.

---

## 6. Config drift — jobs criados com provider/model implícitos quebram quando config.yaml muda

Jobs criados sem `--model` e `--provider` explícitos herdam a configuração do momento
da criação. Se depois o `config.yaml` muda (troca de provider padrão, troca de modelo),
os jobs continuam com a configuração antiga.

**Sinal:** os jobs falham com:
```
Skipped to prevent unintended spend: global inference config drifted since this job
was created (provider 'nous' -> 'custom'; model 'x-ai/grok-4.20' -> 'nous/tencent/hy3:free')
```

**Correção:** depois de qualquer edição de `model.*` ou `providers.*` no config.yaml,
verificar todos os jobs e recalibrar com `hermes cron edit <ID> --provider <pv> --model <mv>`.

**Regra preventiva:** criar jobs **sempre** com `--model` e `--provider` explícitos:

```bash
hermes cron create "every 6h" \
  --name "Telemetry collection" \
  --script "scripts/system-breathing.py" \
  --no-agent \
  --deliver origin \
  --workdir "E:/CentralDark/Pivete" \
  --model "nous/tencent/hy3:free" \
  --provider "nous"
```

Isso garante que o job use exatamente o modelo esperado, mesmo se o config.yaml for
editado depois.

---

## 7. "Heroku CLI binary not in PATH" — acesso ao hermes.exe

O binário do Hermes Agent (`hermes.exe`) **não está no PATH** por padrão no Windows.
Localização confirmada na sessão 2026-09-02:

```
C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\hermes.exe
```

No terminal MSYS/Git Bash, o caminho POSIX funciona:

```
/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/hermes.exe cron list
```

**Regra:** ao usar `hermes` no terminal, usar o caminho absoluto ou ativar o venv.
Não assumir que `hermes` está no PATH.

---

## 8. Script path deduplication — workdir + subdir

Quando se registra um job com workdir apontando para a pasta pai e o script em
subdiretorio, o resolved path pode duplicar o subdiretorio.

**Exemplo (sessão 2026-09-02, job `0e769e2ce2b2`):**
- Workdir: `E:/CentralDark/Pivete`
- Script registrado: `scripts/system-breathing.sh`
- Path resolvido pelo cron: `E:\CentralDark\Pivete\scripts\scripts\system-breathing.sh`
- Resultado: duplicação de `scripts/`, arquivo não encontrado

**Correção:** usar `--script system-breathing.sh` com workdir apontando para
`E:/CentralDark/Pivete/scripts/` **OU** usar `--workdir E:/CentralDark/Pivete` +
`--script system-breathing.sh` com o script copiado para a raiz do workdir.

**Regra prática para criar/edit:**
1. Se o script está em `scripts/`, definir `workdir = <pasta_pai>/scripts/` e
   `--script = nome apenas`
2. Se o script está na raiz do workdir, definir `workdir = <pasta_pai>/` e
   `--script = nome apenas`
3. Antes de registrar/edit, testar manualmente com `bash "<path-absoluto-do-script>"`
   — se der "No such file or directory", ajustar o caminho.

---

## 9. PowerShell `.ps1` via cron — verificar se roda antes de generalizar

Na sessão 2026-09-02, o job `8da666859a0d` (Telemetry collection) foi registrado com
`--script logs/telemetria/CollectTelemetry.ps1`. O registro foi aceito pelo cron (o
erro foi path duplicado, não execução).

**Até contraprova operacional confirmada**, registrar como **PENDENTE_DE_VERIFICACAO**:
não generalizar "ps1 roda direto no cron" nem manter ".ps1 precisa de wrapper" cego.

O wrapper `.sh` ainda é a abordagem mais segura para PowerShell no cron, mas vale
testar o `.ps1` direto em cada ambiente antes de decidir.

---

## 10. Job que demora mais que o timeout do subprocess Python que o invoca

Jobs que executam comandos longos (ex: `gh pr list` com paginação, espera de API
externa) podem timeoutar no subprocess Python que o invoca (não no job em si).

**Sinal:** `subprocess.TimeoutExpired` ao chamar `hermes cron run <ID>` via Python
subprocess, mas o job pode ter terminado por conta própria depois.

**Correção:** aumentar timeout do subprocess Python que invoca `hermes cron run`,
ou usar `background=true` + `notify_on_complete` para não bloquear.

No terminal interativo, o timeout padrão do tool é 180s — suficiente para a maioria
dos jobs. Mas se usar Python subprocess para invocar `hermes cron run`, definir
timeout generoso (ex: 60s+) ou usar mecanismo de notificação.

# Cron Job Patterns Confirmed — Session 2026-09-02

Padrões reais de erro e correção observados na sessão 2026-09-02 ao configurar e depurar jobs do `hermes cron`.

---

## Padrão 1 — Path deduplication no `hermes cron edit` / `hermes cron create`

**Sinal:**
```
Error: Script not found: E:\CentralDark\Pivete\scripts\scripts\system-breathing.py
```
(duplicação do subdir `scripts/` no caminho resolvido pelo cron)

**Causa:** quando se registra um job com `--workdir <pasta_pai>` e `--script "subdir/script.py"`, o resolved path do worker do cron une `<workdir>/subdir/script.py`. Se o `workdir` já era `<pasta_pai>/subdir`, isso gera duplicação e o arquivo não fica onde o script espera.

**Correção (dois modos válidos):**

**Modo A — workdir na raiz do workdir e script copiado para raiz:**
```bash
# workdir = pasta pai (E:/CentralDark/Pivete)
# script  = system-breathing.py  (copiado para a raiz do workdir antes)
hermes cron edit 0e769e2ce2b2 --script system-breathing.py
# RESULTA em: E:/CentralDark/Pivete/system-breathing.py  (se o script estiver lá)
```

**Modo B — workdir apontando para pasta do script e script sem subdir:**
```bash
# workdir = pasta onde o script mora (E:/CentralDark/Pivete/scripts)
# script  = system-breathing.py  (apenas nome)
hermes cron edit 0e769e2ce2b2 --script system-breathing.py
# RESULTA em: E:/CentralDark/Pivete/scripts/system-breathing.py  (caminho limpo)
```

**Regra prática antes de registrar ou editar:**
1. Se o script está em `scripts/`, defina `--workdir` como `E:/CentralDark/Pivete/scripts` e use `--script nome-do-script.py` (sem subdir).
2. Se o script está na raiz do workdir, defina `--workdir` como a raiz (`E:/CentralDark/Pivete`) e use `--script nome-do-script.py`.
3. **Antes de registrar/edit, testar manualmente se o arquivo existe no caminho absoluto:**
   ```bash
   # Linux/macOS
   if [ -f "$WORKDIR/$SCRIPT" ]; then echo "OK"; else echo "FALTA"; fi
   # Windows (PowerShell)
   if (Test-Path "$env:WORKDIR/$SCRIPT") { Write-Host "OK" } else { Write-Host "FALTA" }
   ```
   Se der "FALTA", ajustar workdir/script antes de qualquer `hermes cron edit`.

**Exemplo real (sessão 2026-09-02):**
- Workdir original: `E:/CentralDark/Pivete`
- Script registrado: `scripts/system-breathing.sh`
- Path resolvido pelo cron: `E:\\CentralDark\\Pivete\\scripts\\scripts\\system-breathing.sh`
- Resultado: erro `Script not found: E:\\CentralDark\\Pivete\\scripts\\scripts\\system-breathing.sh`
- Correção aplicada em runtime: `hermes cron edit 0e769e2ce2b2 --script system-breathing.py` com workdir ajustado para `E:/CentralDark/Pivete/scripts`
- Resultado final: job voltou a aparecer no `hermes cron list` com caminho correto.

---

## Padrão 2 — Model drift em jobs de telemetria (modelo free expirado/inválido)

**Sinal:**
```
Error: RuntimeError: HTTP 404: Model 'nous/tencent/hy3:free' not found. The requested model does not exist in our configuration or OpenRouter catalog.
```
em jobs de telemetria criados com `--model nous/tencent/hy3:free`.

**Causa:** jobs criados com modelo free que expirou ou não está mais disponível no OpenRouter. O job continua no cron list mas falha na execução porque o modelo não existe mais.

**Exemplo real (sessão 2026-09-02):**
- Jobs `5050ea9f4723`, `8a7b98f04c7c`, `89f742175bac` criados com `nous/tencent/hy3:free`.
- Erro no cron: `HTTP 404: Model 'nous/tencent/hy3:free' not found`.
- Correção: descobrir modelo alternativo disponível (`tencent/hy4-preview` neste caso) e atualizar todos os jobs:
  ```bash
  hermes cron edit 5050ea9f4723 --provider openrouter --model tencent/hy4-preview
  hermes cron edit 8a7b98f04c7c --provider openrouter --model tencent/hy4-preview
  hermes cron edit 89f742175bac --provider openrouter --model tencent/hy4-preview
  ```

**⚠️ Atenção — jobs podem sumir do cron list após edit com novo modelo:**
Nesta sessão, os três jobs de telemetria (`5050ea9f4723`, `8a7b98f04c7c`, `89f742175bac`) **sumiram do `hermes cron list`** depois do `edit` com o novo modelo `tencent/hy4-preview`. Isso pode indicar que o `edit` removeu os jobs acidentalmente em vez de atualizar. **Ação recomendada:** se após `hermes cron edit` um job sumir do `hermes cron list`, verificar se ele ainda existe em algum registro e, se não, recriá-lo com o modelo correto.

**Decisão:** usar `tencent/hy4-preview` como modelo padrão para jobs de telemetria/monitoramento no lugar do `nous/tencent/hy3:free` que deu 404.

**Modelos disponíveis no OpenRouter (sessão 2026-09-02):**
| Modelo | Preço (prompt/token) |
|---|---|
| `tencent/hy4-preview` | 0.000000834 |
| `meta/muse-spark-1.3-contributor` | 0.0000001 |
| `meta/muse-spark-1.3` | 0.00000125 |
| `google/gemini-3.8-flash` | 0.00000075 |
| `anthropic/claude-fable-5.1` | 0.00001 |
| `inception/mercury-2.5-preview` | 0.00000004 |
| `ibm-granite/granite-4.2-8b` | 0.0000001 |
| `inclusionai/ling-3.0-flash-fin:free` | 0 |

---

## Padrão 3 — jq error em scripts de shell no cron / PowerShell (locale e parsing)

**Sinal:** script que usa `jq` ou `gh pr list --jq` funciona no terminal mas falha no cron com erro de parsing de expressão jq, frequentemente por causa de quebra de linha, locale, ou diferença de versão/flag do jq.

**Exemplo real (sessão 2026-09-02):**
```bash
gh pr list --repo "ServerVpss/CentralDark" --state open --json number,title,headRefName,updatedAt,additions,deletions \
  --jq '.[] | "[PR #\(.number)] \(.title) | branch: \(.headRefName) | updated: \(.updatedAt) | +\(.additions)/-\(.deletions)"'
```
Erro no cron:
```
failed to parse jq expression (line 1, column 90)
    .[] | "[PR #\(.number)] \(.title) | branch: \(.headRefName) | updated: \(.updatedAt) | +\(.additions)/-\(.deletions)"
                                                                                             ^  unexpected token "\"
```

**Causa:** o jq rejeita expressões com escape complexo (`\|`) ou caracteres especiais se a expressão não for bem formada. Além disso, o shell pode estar interpretando o pipe `|` como pipe do shell em vez do jq.

**Correção:**
1. Simplificar a expressão jq — evitar escapes desnecessários de pipe.
2. Usar sintaxe de concatenação do jq em vez de interpolação complexa com `\(.)`.
3. Testar a expressão jq isoladamente antes de colocar no script:
   ```bash
   echo '{"number":1381,"title":"Teste","headRefName":"main","updatedAt":"2026-09-02T00:00:00Z","additions":100,"deletions":50}' \
     | jq -r '.[] | "[PR #" + (.number|tostring) + "] " + .title + " | branch: " + .headRefName + " | updated: " + .updatedAt + " | +" + (.additions|tostring) + "/-" + (.deletions|tostring)'
   ```
4. Se o script usa `jq`, confirmar que o jq está disponível no PATH do worker do cron (pode não estar no Windows).

**Exemplo corrigido (sessão 2026-09-02):**
```bash
gh pr list --repo "ServerVpss/CentralDark" --state open --json number,title,headRefName,updatedAt,additions,deletions \
  --jq '.[] | "[PR #" + (.number|tostring) + "] " + .title + " | branch: " + .headRefName + " | updated: " + .updatedAt + " | +" + (.additions|tostring) + "/-" + (.deletions|tostring)'
```
Resultado: script de PRs passou a listar PRs corretamente no cron.

---

## Padrão 4 — Script .sh "não roda" no cron mas roda no terminal — PATH/bash indisponível

**Sinal:**
- Job registrado com `--script script.sh` aparece no `hermes cron list` com "Script not found" ou execução falha.
- Ao rodar manualmente no terminal com `bash scripts/script.sh`, funciona.

**Exemplo real (sessão 2026-09-02):**
- Job registrado com `--workdir E:/CentralDark/Pivete --script scripts/system-breathing.sh`
- Path resolvido: `E:\\CentralDark\\Pivete\\scripts\\scripts\\system-breathing.sh` → duplicação → "Script not found".
- Correção: usar `--workdir E:/CentralDark/Pivite/scripts --script system-breathing.sh`.

OU

- Script roda no terminal, mas no cron dá:
  ```
  CreateProcessCommon:818: execvpe(/bin/bash) failed: No such file or directory
  ```
- Causa: worker do cron não tem `bash` no PATH (comum quando o Hermes Agent roda via MSYS2/Git Bash e o subprocess do cron é isolado).
- Correção: usar script Python em vez de .sh, ou garantir que o caminho do bash está disponível (ex: `/c/Program Files/Git/usr/bin/bash.exe`).

**Regra:** antes de registrar um job com script .sh, confirmar:
1. O arquivo existe no caminho resolvido (workdir + script).
2. O worker do cron tem bash disponível: `which bash` ou `command -v bash` dentro do ambiente do worker.
3. Se não tiver, usar Python ou copiar script para local que o worker possa acessar.

---

## Padrão 5 — Script .ps1 pode ser aceito pelo cron diretamente (sem wrapper .sh)

**Sinal:** job registrado com `--script "logs/telemetria/CollectTelemetry.ps1"` é aceito pelo cron e o worker tenta executá-lo. Pode funcionar ou não dependendo do ambiente, mas o registro é aceito — ao contrário do que a documentação anterior afirmava ("".ps1 não roda direto, precisa de wrapper .sh').

**Descoberta desta sessão:** o cron Hermes pode aceitar `.ps1` diretamente como script, sem wrapper `.sh`. Isso não significa que sempre vai rodar (depende do ambiente, disponibilidade de powershell), mas **não é mais um hard block**. A recomendação passa a ser: testar `.ps1` direto primeiro; se falhar, então criar wrapper `.sh`.

**Regra atualizada:**
- Para `.ps1` no cron Hermes: registrar diretamente com `--script "caminho/para/script.ps1"`.
- Se o worker do cron não conseguir executar o `.ps1` (ex: powershell indisponível), criar wrapper `.sh` que chama `powershell -NoProfile -ExecutionPolicy Bypass -File "script.ps1"`.
- Testar execução manual antes de confiar no cron:
  ```bash
  powershell -NoProfile -ExecutionPolicy Bypass -File "E:/CentralDark/Pivete/logs/telemetria/CollectTelemetry.ps1"
  ```

---

## Padrão 6 — Debug: `hermes cron run` vs execução manual (PATH diferente, set -e, encoding)

**Sinal:** `hermes cron run <ID>` reporta `"Ran now: failed."` mas ao rodar o script manualmente (bash/python/powershell direto) funciona.

**Causas mais comuns (ordem de verificação):**

### Causa 1 — caminho do script incorreto (path deduplication)
Ver Padrão 1 — o worker resolve o caminho e o arquivo não fica onde o script espera.

### Causa 2 — PATH/shell diferente no subprocess do cron
O worker do cron Hermes no Windows executa o script em subprocess isolado. Esse subprocess pode:
- Não ter `bash.exe` disponível no PATH, mesmo que o terminal interativo tenha.
- Não ter `powershell`, `pwsh` ou ferramentas Windows como `tasklist`/`netstat`/`ss` no PATH.
- Rodar com `set -euo pipefail` ativo; qualquer comando que falhe (valor não-zero, ferramenta indisponível, pipe quebrado) aborta o script, enquanto no terminal o operador tolera.

**Triagem:**
1. Ler o log do job (`logs/<tag>-<timestamp>.log` ou conforme LOG_FILE do script) — mostra a linha exata onde parou.
2. Reproduzir com shell mínimo: `bash -x script.sh` para ver cada comando.
3. Verificar PATH do worker: `echo $PATH` dentro do ambiente do worker vs do terminal.
4. Isolar o comando problemático e testar **dentro do worker** se possível.

**Correções práticas:**
- Para jobs que usam ferramentas Windows (`tasklist`, `netstat`, `findstr`): testar com caminho absoluto do executable ou garantir que estão no PATH do workdir.
- Para jobs que usam `set -euo pipefail`: sanitizar variáveis que vêm de comandos externos antes de usar em testes condicionais.
- Para jobs que usam `grep -c` em ambientes com ANSI color / quebras de linha extras: usar `2>/dev/null` e sanitizar o valor (ex: `ZOMBIES=$(... || echo 0); ZOMBIES=${ZOMBIES//[!0-9]/}`).
- Preferir scripts Python para jobs de watchdog/monitor no Windows, já que o worker do cron tem Python disponível e a porta do Hermes CLI também está em Python (menos problemas de PATH que bash).

---

## Padrão 7 — `set -euo pipefail` mata script de diagnóstico no cron

**Sinal:** script de watchdog/monitor funciona no terminal mas falha no cron, e o log mostra que parou na primeira linha que executa um teste condicional com variável vinda de comando externo.

**Exemplo real (sessão 2026-09-02):**
```bash
set -euo pipefail   # ← aqui

ZOMBIES=$(ps -eo stat 2>/dev/null | grep -c '^Z' 2>/dev/null || echo "0")
log "Zombies detectados: ${ZOMBIES}"

if [ "$ZOMBIES" -gt 0 ] 2>/dev/null; then   # ← aqui falha se "$ZOMBIES" não for inteiro limpo
    ...
fi
```

**Causa:** `grep -c` em ambientes Windows/ANSI pode retornar valor com quebra de linha extra (`"0\n0"` ou `"0\n"`), e o `if [ "$ZOMBIES" -gt 0 ]` falha com `[: 0\n0: integer expression expected`, matando o script com `set -euo pipefail`.

**Correção: sanitizar o valor antes do teste.**

```bash
# Opção A — sanitizar ZOMBIES com subtração de caracteres não-numéricos
ZOMBIES=$(ps -eo stat 2>/dev/null | grep -c '^Z' 2>/dev/null || echo "0")
ZOMBIES=$(echo "$ZOMBIES" | tr -cd '0-9' 2>/dev/null || echo "0")
# Agora "$ZOMBIES" é sempre um inteiro limpo (ou 0)

if [ "$ZOMBIES" -gt 0 ]; then
    ...
fi
```

OU

```bash
# Opção B — sanitizar com fallback explícito (mais legível)
ZOMBIES=$(ps -eo stat 2>/dev/null | grep -c '^Z' 2>/dev/null || true)
if ! [[ "$ZOMBIES" =~ ^[0-9]+$ ]]; then
    ZOMBIES=0
fi
```

**Regra geral:** scripts de watchdog/monitor de produção devem:
- Log detalhado em arquivo (`logs/<tag>-<timestamp>.log`).
- Código de saída 0 em sucesso, 1 em erro real (não em "ferramenta indisponível").
- Valor default seguro para cada métrica (0, "unknown", "") em vez de falhar.
- Não usar `set -e` se o script tolera indisponibilidade de ferramentas.

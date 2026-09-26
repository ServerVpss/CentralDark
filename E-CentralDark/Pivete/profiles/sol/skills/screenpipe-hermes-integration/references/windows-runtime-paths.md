# Caminhos de runtime no Windows — corretos para o monitor e health_check

> Capturado em 2026-09-01 durante validação do `screenpipe-hermes-live-monitor.py`.  
> Como o skill é READ_ONLY e o script é invoção direta, o runtime precisa ser explicitado no prompt e no script — não há runtime default confiável.

## Python correto

**Use SEMPRE o Python do venv do Hermes Agent:**

```text
/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python
```

### Por que não os outros existentes

| Python | Resultado | Motivo |
|---|---|---|
| `python3` | ❌ não existe | comando ausente neste host |
| `python` (Windows) | ❌ quebra | é alias do Microsoft Store que abre janela de configurações e retorna sem executar; não é interpreters Python funcional |
| `python` do MSYS2/git-bash | ⚠️ pode funcionar | não confiável; depende de como o git-bash resolve o PATH |

**Regra:** todo chamado ao script deve usar o python do venv explicitamente, nunca `python3`, nunca `python` sem verificação.

---

## Bash correto para health_check.sh

O `health_check.sh` usa `tasklist` e `wmic` — binários nativos do Windows. Só rodam num bash que consiga executar binários nativos via `execvpe`.

**Use o git-bash do instalador do Git for Windows:**

```text
C:\Program Files\Git\usr\bin\bash.exe
```

### Por que não o bash default do ambiente

| Bash encontrado | Resultado | Motivo |
|---|---|---|
| `/usr/bin/bash` (WSL/cygwin via MSYS) | ❌ falha | resolve pro bash do WSL/cygwin, que retorna `CreateProcessCommon:818: execvpe(/bin/bash) failed` ao tentar executar binários nativos Windows |
| `bash` do MSYS2/git-bash Path | ✅ funciona | quando o MSYS2/git-bash é o ambiente, `bash` resolve corretamente e executa `tasklist`/`wmic` |
| bash do WSL | ❌ não executa .exe nativos | `tasklist`, `wmic` são binários Windows; o bash do WSL tenta executar como `/bin/bash tasklist` e falha |

**Regra:** o script descobre o bash via lista priorizada:

```python
bash_candidates = [
    os.environ.get("HERMES_BASH", ""),
    r"C:\Program Files\Git\usr\bin\bash.exe",
    r"/usr/bin/bash.exe",
    r"/mingw64/bin/bash.exe",
]
bash_path = next((p for p in bash_candidates if p and os.path.isfile(p)), None)
if not bash_path:
    bash_path = "bash"  # fallback: confia no PATH do ambiente
```

Se o script for rodado fora do MSYS2/git-bash (ex: pelo python do venv direto), a lista prioriza `C:\Program Files\Git\usr\bin\bash.exe` — que é o que funciona.

---

## Invocação correta do health_check.sh

```bash
bash -c "cd '<dir do script>' && bash 'health_check.sh'"
```

Ou, pelo Python do monitor:

```python
cmd = [bash_path, "-c", f'cd "{os.path.dirname(script)}" && bash "{os.path.basename(script)}"']
r = subprocess.run(cmd, capture_output=True, text=True, timeout=40, cwd=os.path.dirname(script))
```

---

## Prompt do cronjob (exemplo)

```text
Roda um ciclo único de monitoramento da cadeia Hermex/Casa em tempo real:

/c/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python "E:/CentralDark/Pivete/skills/screenpipe-hermes-integration/scripts/screenpipe-hermes-live-monitor.py" --once 2>&1
```

O script já usa o git-bash correto (`C:\Program Files\Git\usr\bin\bash.exe`) para rodar `health_check.sh`. Não precisa configurar nada na mão — o script descobre e escolhe.

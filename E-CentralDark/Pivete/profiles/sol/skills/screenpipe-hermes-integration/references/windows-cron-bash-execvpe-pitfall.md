# Windows cron + bash: pitfall `execvpe(/bin/bash)` e o monitor nativo funcional

## Contexto

Cron jobs que invocam `.sh` no Windows podem falhar com:

```
CreateProcessCommon:818: execvpe(/bin/bash) failed: No such file or directory
```

Isso acontece quando o ambiente de execução do cron **não tem `/bin/bash`** (WSL/cygwin ausente ou não no PATH usado), mas o script começa com `#!/bin/bash`.

## O que isso significa

- O script `.sh` pode estar **correto em tese** para uma máquina com git-bash/MSYS instalado.
- Mas se o cron job roda em contexto que não resolve `/bin/bash`, a execução **nem chega a rodar** — erro antes do primeiro comando.
- O erro **não é do script**, é do ambiente de execução.

## O que funciona neste ambiente

- Script Python com `#!/usr/bin/env python3` ou invocado explicitamente com `python scripts/...py` **roda no venv do cron**.
- `scripts/screenpipe-monitor.py` (na raiz do Pivete) e `skills/screenpipe-hermes-integration/scripts/screenpipe-hermes-live-monitor.py` são formas nativas funcionais de medir/diagnosticar.
- O monitor Python **não depende de bash nem de WSL** para as suas ações — usa `tasklist`, `urllib.request`, `os.path`.

## Diagnóstico rápido

1. Olhar o log do cron job: se o erro começa com `execvpe(/bin/bash)`, o problema é a invocação do interpretador, não a lógica do script.
2. Tenta executar o script manualmente com `python scripts/<nome>.py` ou `./scripts/<nome>.py` (se shebang resolver).
3. Se o script queria usar `tasklist`/`wmic`/binários nativos Windows, o Python também consegue via `subprocess.run(["tasklist", ...])`.

## Regras

- `bash disponível` != `script bash funcional no cron`
- `python3Missing no env` ≠ `pythonFalta no venv do cron` — verificar qual interpretador o cron realmente resolve antes de confiar no shebang.
- Monitor via Python nativo é a forma mais resistente paraeste ambiente.
- Não assumir que um script `.sh` funciona só porque rodou em sessão interativa.

## Veja também

- `scripts/screenpipe-monitor.py` — monitor do screenpipe em Python, usado quando o `.sh` quebrou.
- `skills/screenpipe-hermes-integration/scripts/screenpipe-hermes-live-monitor.py` — monitor canônico da cadeia Hermes-Casa.
- `references/monitor-doctrine.md` — doctrine do monitor (READ_ONLY, placar 🟢🟡🔴).

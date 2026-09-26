# OUTRO - vps-ssh-exec.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\vps-ssh-exec.yml
**SHA:** 117894d225ab004f
**Timestamp:** 2026-08-28T02:56:04.226736
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: echo "desativado"

### Ouro Bruto (primeiros 5000 chars)
```
name: VPS SSH Exec [DESATIVADO — duplicata de vps-exec-selfhosted.yml]
# TRAVA: Este workflow é duplicata exata de vps-exec-selfhosted.yml (ambos rodam bash -lc local).
# Use vps-exec-selfhosted.yml. Este não será executado (if:false).
# Mesmo desativado, respeita a política global de executor da Casa para não reintroduzir hosted runner por cópia futura.
on:
  workflow_dispatch:
    inputs:
      _disabled:
        description: 'DESATIVADO. Use vps-exec-selfhosted.yml'
        required: true
        type: string

jobs:
  noop:
    runs-on: [self-hosted, Linux]
    if: false
    steps:
      - run: echo "desativado"

```
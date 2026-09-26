---
name: centraldark-shared
category: centraldark
description: "Emp&alias for RECONCILIAR_SHARED"
---
# CentralDark Shared

## Descrição
CentralDark aura dedicada a executar a ação `RECONCILIAR_SHARED` de forma unificada. O comando alias `centraldark shared` invoca este script, que encapsula todas as flags exigidas para a resolução de missão.

## Uso
```bash
centraldark shared
```
Isso executará o CLI `centraldark RECONCILIAR_SHARED` com todas as opções configuradas, garantindo que o fluxo acorde com a política de “primeira janela escreve, as demais não”.

## Referências
- [centraldark_shared.sh](../workspace/centraldark_shared.sh) – Script de execução.
- [.bashrc](../.bashrc) – Alias configurado.

## Como incorporar
Esta skill é class‑level; qualquer agente pode carregar `centraldark-shared` e utilizar o comando.

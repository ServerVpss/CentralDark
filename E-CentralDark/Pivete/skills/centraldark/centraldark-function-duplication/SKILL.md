---
title: "CentralDark Function Duplication and Parallel Workflows"
name: "centraldark-function-duplication"
description: "Duplica funções entre Zendrive, Rabbit e Hermes."
usage: "Use quando precisar duplicar operação em múltiplas contas ou rodar scripts paralelamente."
---

## Objetivo
Implementa a duplicação de lógicas em CentralDark, respeitando regras de zero regressão e vermos sem v1-v3.

## Entidades
- **Twist**: Função principal.
- **Perfil**: Config. de conta Zendrive.
- **Cron**: Agendamento.

## Passos
1. crie `config.json` com perfis.
2. execute `centraldark_duplicate.sh`.
3. Opcional: crons `duplicate-job` e `radar-17/47`.

## Execução
- O script use `jq` para ler `profiles[]`.
- Para cada perfil, chame `centraldark` com parâmetros.
- Assegura que `jq` esteja instalado.

## Teste
```bash
bash centraldark_duplicate.sh
```
